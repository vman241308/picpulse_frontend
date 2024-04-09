import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

import videojs from "video.js";
import Image from "./Image.jsx";
import RecordingIco from "@/assets/icons/recording_ico.png";

import EventBus from "../../utils/EventBus.jsx";

let recordingStartTime = 0;
let recordingEndTime = 0;

function VideoEditorInterface({
  backgroundType,
  videoFile,
  bgRef,
  overlays,
  playerRef,
  setOverlays,
}) {
  const [scaleX, setScaleX] = useState(1); // Horizontal scaling factor
  const [scaleY, setScaleY] = useState(1); // Vertical scaling factor
  const [recordingStatus, setRecordingStatus] = useState();
  const [overlayPositions, setOverlayPositions] = useState([]);
  const [bgWidth, setBgWidth] = useState(0);
  const [bgHeight, setBgHeight] = useState(0);

  useEffect(() => {
    if (bgRef.current && backgroundType === "video") {
      bgRef.current.load();
    }

    let img = new window.Image();
    img.onload = () => {
      setBgWidth(img.width % 2 == 1 ? img.width + 1 : img.width);
      setBgHeight(img.height % 2 == 1 ? img.height + 1 : img.height);
    };
    img.src = videoFile;
  }, [videoFile]);

  useEffect(() => {
    if (recordingStatus === undefined) return;
    if (recordingStatus) {
      recordingStartTime = new Date().getTime();
    } else {
      recordingEndTime = new Date().getTime();
      let milliTime = recordingEndTime - recordingStartTime;
      renderVideo(milliTime / 1000);
    }
  }, [recordingStatus]);

  useEffect(() => {
    overlays?.forEach((overlayPath, index) => {
      const lastIndex = overlayPath.lastIndexOf("/");
      const overlayName = overlayPath.substring(lastIndex + 1);
      const overlayFileName = `${overlayName}.png`;

      const fileExists = overlayPositions.some(
        (position) => position.fileNameFFMPEG == overlayFileName
      );

      if (fileExists) {
        return;
      }

      setOverlayPositions((prevPositions) => {
        return [
          ...prevPositions,
          {
            overlayPath: overlayPath,
            fileNameFFMPEG: overlayFileName,
            timeline: [],
          },
        ];
      });
    });
  }, [overlays]);

  const handleMetadataLoaded = () => {
    const bgElement = bgRef.current;
    let originalWidth;
    let originalHeight;

    if (bgElement) {
      if (backgroundType === "video") {
        originalWidth = bgElement.videoWidth;
        originalHeight = bgElement.videoHeight;
      } else {
        originalWidth = bgElement.naturalWidth;
        originalHeight = bgElement.naturalHeight;
      }

      // const aspectRatio = originalWidth / originalHeight;
      // const containerHeight = window.innerHeight * 0.7; // 70vh
      // const newWidth = containerHeight * aspectRatio;

      // bgElement.parentElement.style.width = `${newWidth}px`;

      const renderedWidth = bgElement.clientWidth;
      const renderedHeight = bgElement.clientHeight;

      setScaleX(originalWidth / renderedWidth);
      setScaleY(originalHeight / renderedHeight);
    }
  };

  const handleMovement = async (
    overlayPath,
    finalX,
    finalY,
    width,
    heigth,
    rotation
  ) => {
    const newMovement = {
      x: finalX,
      y: finalY,
      width: width,
      height: heigth,
      rotation: rotation,
      frame: 1,
    };
    setOverlayPositions((prevPositions) => {
      return prevPositions.map((item) => {
        if (item.overlayPath === overlayPath) {
          const existingMovementIndex = item.timeline.findIndex(
            (movement) => movement.frame === newMovement.frame
          );
          if (existingMovementIndex !== -1) {
            const updatedTimeline = [...item.timeline];
            updatedTimeline[existingMovementIndex] = newMovement;
            return { ...item, timeline: updatedTimeline };
          } else {
            return { ...item, timeline: [...item.timeline, newMovement] };
          }
        }
        return item;
      });
    });
  };

  const handleResize = (overlayPath, width, height) => {
    setOverlayPositions((prevPositions) => {
      return prevPositions.map((item) => {
        if (item.overlayPath === overlayPath) {
          return { ...item, width: width * scaleX, height: height * scaleX };
        }
        return item;
      });
    });
  };

  const removeOverlay = (url) => {
    // setOverlays(overlays.filter((item) => item !== url));
    setOverlays((overlays) => overlays.filter((item) => item !== url));
    const newOverlayPositions = overlayPositions.filter(
      (o) => o.overlayPath !== url
    );
    setOverlayPositions(newOverlayPositions);
  };

  const renderVideo = async (duration) => {
    EventBus.dispatch("setLoading", true);
    let fileName = new Date().getTime();
    let ffmpegCommand = "";

    function generateOverlayFilters() {
      return overlayPositions
        .flatMap((overlayPosition, overlayIndex) =>
          overlayPosition.timeline.map((timeline, index, array) => {
            let radians = (timeline.rotation * Math.PI) / 180;

            let rotatedW =
              Math.abs(timeline.width * Math.cos(radians)) +
              Math.abs(timeline.height * Math.sin(radians));

            let rotatedH =
              Math.abs(timeline.height * Math.cos(radians)) +
              Math.abs(timeline.width * Math.sin(radians));

            let rotateOverlay = `,rotate=${radians}:c=black@0:ow=${rotatedW}:oh=${rotatedH}`;
            let resizeOverlay = `[${overlayIndex + 1}:v]scale=${
              timeline.width
            }:${timeline.height}${rotateOverlay}[scaled${overlayIndex + 1}];`; //<---THIS WORKS, rotation is breaking it
            // let chainStart =
            //   overlayIndex > 0
            //     ? `${resizeOverlay}[v${overlayIndex}][scaled${
            //         overlayIndex + 1
            //       }]`
            //     : `${resizeOverlay}[0:v][scaled${overlayIndex + 1}]`;
            let chainStart = `${resizeOverlay}[v${overlayIndex}][scaled${
              overlayIndex + 1
            }]`;
            let chainSuffix;

            if (overlayPositions.length > 1) {
              chainSuffix =
                overlayIndex === overlayPositions.length - 1
                  ? `[out]`
                  : `[v${overlayIndex + 1}]`;
            } else {
              chainSuffix = `[out]`;
            }

            // return `${chainStart}overlay=${timeline.x}:${timeline.y}${chainSuffix}`;
            return `${chainStart}overlay=${timeline.x}:${timeline.y}${chainSuffix}`;
          })
        )
        .join(";");
    }

    try {
      let bgscale = `[0:v]scale=${bgWidth}:${bgHeight}[v0]`;
      overlayPositions.length > 0
        ? (ffmpegCommand = [
            // "-hwaccel",
            // "cuda",
            "-i",
            `${videoFile}`,
            // Include each overlay as an input
            ...overlayPositions
              .filter(
                (overlay, index, self) =>
                  index ===
                  self.findIndex(
                    (o) => o.fileNameFFMPEG === overlay.fileNameFFMPEG
                  )
              )
              .map((overlay) => [
                "-stream_loop",
                "-1",
                "-i",
                overlay.overlayPath,
              ])
              .flat(),
            "-filter_complex",
            `${bgscale};${generateOverlayFilters()}`,
            "-map",
            `[out]`,
            "-r",
            "30",
            "-an",
            "-c:a",
            "copy",
            "-t",
            `${duration}`,
            "-c:v",
            // "h264_nvenc",
            "libx264",
            `./src/utils/public/output_${fileName}.mp4`,
          ])
        : (ffmpegCommand = [
            "-i",
            `${videoFile}`,
            "-c:a",
            "copy",
            "-t",
            `${duration}`,
            "-preset",
            "ultrafast",
            `./src/utils/public/output_${fileName}.mp4`,
          ]);
    } catch (error) {
      return;
    }

    console.log(ffmpegCommand);

    try {
      await axios
        .post(`http://3.143.204.91:4000/api/editor`, {
          command: ffmpegCommand,
          fileName: `output_${fileName}.mp4`,
        })
        .then(async (res) => {
          // console.log(res.data.message);
          const response = await fetch(res.data.message);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          const fileName = res.data.message.split("/").pop();
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(blobUrl);
        });
    } catch (error) {
      console.log("error::", error);
    }

    EventBus.dispatch("setLoading", false);
  };

  return (
    <div className="bg-black w-[80%] h-full border-dashed border-2 border-sky-500 flex items-center justify-center relative">
      <div className="w-full h-full flex items-center justify-center absolute">
        {backgroundType === "video" ? (
          <video
            ref={bgRef}
            loop
            autoPlay
            className="h-[95%] w-auto video-js"
            id="video-js"
            onLoadedMetadata={handleMetadataLoaded}
            src={videoFile}
          />
        ) : (
          <img
            ref={bgRef}
            src={videoFile}
            className="h-[95%] w-auto video-js"
            id="video-js"
            onLoad={handleMetadataLoaded}
          ></img>
        )}

        {videoFile &&
          overlays?.map((image, index) => (
            <Image
              key={index}
              image={image}
              index={index}
              handleMovement={handleMovement}
              handleResize={handleResize}
              scaleX={scaleX}
              scaleY={scaleY}
              removeOverlay={removeOverlay}
            />
          ))}
      </div>
      <div className="absolute -bottom-24 z-50">
        {recordingStatus ? (
          <img
            className="w-16 h-16 hover:brightness-75 cursor-pointer"
            src={RecordingIco}
            onClick={() => {
              setRecordingStatus(false);
            }}
          />
        ) : (
          <div
            className="w-16 h-16 bg-red-600 hover:bg-red-500 rounded-full cursor-pointer"
            onClick={() => {
              setRecordingStatus(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default VideoEditorInterface;
