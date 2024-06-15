import React, { useEffect, useState } from "react";

import axios from "axios";

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
  aspectRatio,
  setAspectRatio,
  audio,
}) {
  const [scaleX, setScaleX] = useState(1); // Horizontal scaling factor
  const [scaleY, setScaleY] = useState(1); // Vertical scaling factor
  const [recordingStatus, setRecordingStatus] = useState();
  const [overlayPositions, setOverlayPositions] = useState([]);

  const [coverImageWidth, setCoverImageWidth] = useState(0);
  const [coverImageHeight, setCoverImageHeight] = useState(0);

  const [styleCoverImageL, setStyleCoverImageL] = useState("");
  const [styleCoverImageR, setStyleCoverImageR] = useState("");
  const [bgResolutionType, setBgResolutionType] = useState(true);
  const [selectedOverlay, setSelectedOverlay] = useState(0);

  const [bgWidth, setBgWidth] = useState(0);
  const [bgHeight, setBgHeight] = useState(0);

  useEffect(() => {
    if (bgRef.current && backgroundType === "video") {
      bgRef.current.load();

      var vid = document.getElementById("video-js");

      vid.onloadedmetadata = function () {
        setBgWidth(this.videoWidth);
        setBgHeight(this.videoHeight);
      };

      vid.load();
    }

    let img = new window.Image();
    img.onload = () => {
      setBgWidth(img.width % 2 == 1 ? img.width + 1 : img.width);
      setBgHeight(img.height % 2 == 1 ? img.height + 1 : img.height);
    };
    img.src = videoFile;
  }, [videoFile]);

  useEffect(() => {
    setOverlayPositions([]);
    setOverlays([]);
    setAspectRatio(null);
    EventBus.dispatch("setRatio", 3);
    setBgWidth(0);
    setBgHeight(0);
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
    if (overlays.length > 0) {
      if (overlays.length > overlayPositions.length) {
        let overlayPath = overlays[overlays.length - 1];
        const lastIndex = overlayPath.lastIndexOf("/");
        const overlayName = overlayPath.substring(lastIndex + 1);
        const overlayFileName = `${overlayName}.png`;
        setOverlayPositions((prevPositions) => {
          return [
            ...prevPositions,
            {
              id: overlayPositions.length,
              overlayPath: overlayPath,
              fileNameFFMPEG: overlayFileName,
              timeline: [],
            },
          ];
        });
      }
    } else if (overlays.length === 0) {
      setOverlayPositions([]);
    }
  }, [overlays]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     handleMetadataLoaded();
  //   };

  //   window.addEventListener("resize", handleResize);

  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  useEffect(() => {
    handleMetadataLoaded();
  }, [aspectRatio]);

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

      // let bgscale = `[0:v]scale=trunc(iw/2)*2:trunc(ih/2)*2[v0]`;
      if (originalWidth > 4096 || originalHeight > 4096) {
        if (originalWidth > originalHeight) {
          originalHeight = (originalHeight / originalWidth) * 4096;
          originalWidth = 4096;
        } else {
          originalWidth = (originalWidth / originalHeight) * 4096;
          originalHeight = 4096;
        }
      }

      const renderedWidth = bgElement.clientWidth;
      const renderedHeight = bgElement.clientHeight;

      if (originalWidth > originalHeight) {
        setBgResolutionType(true);
        setStyleCoverImageL("bg-black absolute top-0 -left-[1px]");
        setStyleCoverImageR("bg-black absolute top-0 -right-[1px]");
        switch (aspectRatio) {
          case 16:
            setCoverImageHeight(renderedHeight + 2);
            setCoverImageWidth(
              Math.abs((renderedWidth - (renderedHeight * 16) / 9) / 2) + 2
            );
            break;

          case 1:
            setCoverImageHeight(renderedHeight + 2);
            setCoverImageWidth(
              Math.abs((renderedWidth - renderedHeight) / 2) + 2
            );
            break;

          case 4:
            setCoverImageHeight(renderedHeight + 2);
            setCoverImageWidth(
              Math.abs((renderedWidth - (renderedHeight * 4) / 3) / 2) + 2
            );
            break;

          default:
            setCoverImageHeight(0);
            setCoverImageWidth(0);
            break;
        }
      } else {
        setBgResolutionType(false);
        setStyleCoverImageL("bg-black absolute top-0 -left-[1px]");
        setStyleCoverImageR("bg-black absolute bottom-0 -right-[1px]");
        switch (aspectRatio) {
          case 16:
            setCoverImageHeight(
              Math.abs((renderedHeight - (renderedWidth * 9) / 16) / 2) + 2
            );
            setCoverImageWidth(renderedWidth + 2);
            break;

          case 1:
            setCoverImageHeight(
              Math.abs((renderedHeight - renderedWidth) / 2) + 2
            );
            setCoverImageWidth(renderedWidth + 2);
            break;

          case 4:
            setCoverImageHeight(
              Math.abs((renderedHeight - (renderedWidth * 3) / 4) / 2) + 2
            );
            setCoverImageWidth(renderedWidth + 2);
            break;

          default:
            setCoverImageHeight(0);
            setCoverImageWidth(0);
            break;
        }
      }

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
    rotation,
    imgIndex
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
      return prevPositions.map((item, index) => {
        if (item.overlayPath === overlayPath && index === imgIndex) {
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

  const removeOverlay = (imgIndex, url) => {
    setOverlays((overlays) =>
      overlays.filter((overlay, index) => index !== imgIndex)
    );
    const newOverlayPositions = overlayPositions.filter(
      (o, index) => index !== imgIndex
    );
    setOverlayPositions(newOverlayPositions);
  };

  const renderVideo = async (duration) => {
    EventBus.dispatch("setLoading", true);
    let fileName = new Date().getTime();
    let ffmpegCommand = "";
    let aspectFFmpegCommand = "";

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
              if (overlayIndex == overlayPositions.length - 1) {
                chainSuffix = `[out]`;
              } else {
                chainSuffix = `[v${overlayIndex + 1}]`;
              }
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
      let bgscale;
      // let bgscale = `[0:v]scale=trunc(iw/2)*2:trunc(ih/2)*2[v0]`;
      if (bgWidth > 4096 || bgHeight > 4096) {
        bgWidth > bgHeight
          ? (bgscale = `[0:v]scale=4096:${(bgHeight / bgWidth) * 4096}[v0]`)
          : (bgscale = `[0:v]scale=${(bgWidth / bgHeight) * 4096}:4096[v0]`);
      } else {
        bgscale = `[0:v]scale=${bgWidth}:${bgHeight}[v0]`;
      }

      overlayPositions.length > 0
        ? (ffmpegCommand = [
            "-hwaccel",
            "cuda",
            `${backgroundType === "video" ? "-stream_loop" : "-loop"}`,
            `${backgroundType === "video" ? "-1" : "1"}`,
            "-i",
            `${videoFile}`,
            ...overlayPositions
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
            "-c:a",
            "copy",
            "-t",
            `${duration}`,
            "-c:v",
            "h264_nvenc",
            "-cq",
            "1",
            // "-c:v",
            // "libx264",
            // "-crf",
            // "18",
            // "-preset",
            // "veryfast",
            "-an",
            "-sn",
            `./src/utils/public/output_${fileName}.mp4`,
          ])
        : (ffmpegCommand = [
            "-hwaccel",
            "cuda",
            `${backgroundType === "video" ? "-stream_loop" : "-loop"}`,
            `${backgroundType === "video" ? "-1" : "1"}`,
            "-i",
            `${videoFile}`,
            "-filter_complex",
            `${bgscale}`,
            "-t",
            `${duration}`,
            "-map",
            `[v0]`,
            "-c:a",
            "copy",
            "-c:v",
            "h264_nvenc",
            "-cq",
            "1",
            "-an",
            "-sn",
            `./src/utils/public/output_${fileName}.mp4`,
          ]);
    } catch (error) {
      return;
    }

    let aspectFilter = "";

    if (bgResolutionType) {
      switch (aspectRatio) {
        case 16:
          aspectFilter = "crop=ih*16/9:ih";
          break;
        case 1:
          aspectFilter = "crop=ih:ih";
          break;
        case 4:
          aspectFilter = "crop=ih*4/3:ih";
          break;
        default:
          aspectFilter = "crop=iw:ih";
          break;
      }
    } else {
      switch (aspectRatio) {
        case 16:
          aspectFilter = "crop=iw:iw*9/16";
          break;
        case 1:
          aspectFilter = "crop=iw:iw";
          break;
        case 4:
          aspectFilter = "crop=iw:iw*3/4";
          break;
        default:
          aspectFilter = "crop=iw:ih";
          break;
      }
    }

    let musicLink = !audio?.paused && audio?.src;
    console.log(musicLink);

    try {
      musicLink
        ? (aspectFFmpegCommand = [
            "-hwaccel",
            "cuda",
            "-i",
            `./src/utils/public/output_${fileName}.mp4`,
            "-i",
            `${musicLink}`,
            "-vf",
            `${aspectFilter}`,
            "-c:v",
            "h264_nvenc",
            "-cq",
            "1",
            "-shortest",
            `./src/utils/public/output_${fileName}_result.mp4`,
          ])
        : (aspectFFmpegCommand = [
            "-hwaccel",
            "cuda",
            "-i",
            `./src/utils/public/output_${fileName}.mp4`,
            "-vf",
            `${aspectFilter}`,
            "-c:v",
            "h264_nvenc",
            "-cq",
            "1",
            "-an",
            "-sn",
            "-shortest",
            `./src/utils/public/output_${fileName}_result.mp4`,
          ]);
    } catch (error) {
      return;
    }
    console.log(ffmpegCommand);
    console.log(aspectFFmpegCommand);

    try {
      await axios
        .post(`http://3.143.204.91:4000/api/editor`, {
          command: ffmpegCommand,
          aspectCommand: aspectFFmpegCommand,
          fileName: `output_${fileName}_result.mp4`,
        })
        .then(async (res) => {
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

  const selectOverlay = (selectedOverlayID) => {
    // let tempOverlayPositions = overlayPositions.map((item) => {
    //   if (item.id === selectedOverlayID) {
    //     return { ...item, id: overlayPositions.length - 1 };
    //   } else if (item.id > selectedOverlayID) {
    //     return { ...item, id: item.id - 1 };
    //   } else {
    //     return item;
    //   }
    // });

    // setOverlayPositions(tempOverlayPositions);
    console.log("~~~~~~~~~~~~~~OverlayID", selectedOverlayID);
  };

  return (
    <div className="bg-black w-[80%] h-full border-dashed border-2 border-sky-500 flex items-center justify-center relative">
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-max h-[95%] relative">
          <div
            className={styleCoverImageL}
            style={{ height: coverImageHeight, width: coverImageWidth }}
          ></div>
          <div
            className={styleCoverImageR}
            style={{ height: coverImageHeight, width: coverImageWidth }}
          ></div>
          {backgroundType === "video" ? (
            <video
              ref={bgRef}
              loop
              autoPlay
              className="w-auto h-full video-js"
              id="video-js"
              onLoadedMetadata={handleMetadataLoaded}
              src={videoFile}
            />
          ) : (
            <img
              ref={bgRef}
              src={videoFile}
              className="w-auto h-full video-js"
              id="video-js"
              onLoad={handleMetadataLoaded}
            ></img>
          )}

          {videoFile &&
            overlayPositions?.map((image, index) => (
              <Image
                key={image.id}
                image={image.overlayPath}
                index={index}
                handleMovement={handleMovement}
                handleResize={handleResize}
                scaleX={scaleX}
                scaleY={scaleY}
                removeOverlay={removeOverlay}
                overlayID={image.id}
                selectOverlay={selectOverlay}
                // className={`z-[${image.id}]`}
              />
            ))}
        </div>
      </div>
      <div className="absolute z-50 -bottom-24">
        {recordingStatus ? (
          <img
            className="w-16 h-16 cursor-pointer hover:brightness-75"
            src={RecordingIco}
            onClick={() => {
              setRecordingStatus(false);
            }}
          />
        ) : (
          <div
            className="w-16 h-16 bg-red-600 rounded-full cursor-pointer hover:bg-red-500"
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
