import React, { useEffect, useState, useRef, useCallback } from "react";
import IconButton from "@mui/material/IconButton";
import VideocamIcon from "@mui/icons-material/Videocam";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import Image from "./Image.jsx";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import Darkmode from "darkmode-js";

import EventBus from "../../utils/EventBus.jsx";

const { createFFmpeg, fetchFile } = FFmpeg;
let ffmpeg;

let recordingStartTime = 0;
let recordingEndTime = 0;

function ImageEditorInterface({
  imageFile,
  bgImageRef,
  isDarkMode,
  setDarkMode,
  overlays,
  setOverlays,
  setVideoFile,
}) {
  const [loaded, setLoaded] = useState(false);
  const [imageBounds, setImageBounds] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState();
  const [overlayPositions, setOverlayPositions] = useState([]);
  const [darkMode, setDark] = useState(false);
  const [scaleX, setScaleX] = useState(1); // Horizontal scaling factor
  const [scaleY, setScaleY] = useState(1); // Vertical scaling factor
  const [refreshModal, setRefreshModal] = useState(false);
  const [refreshContent, setRefreshContent] = useState("");
  const messageRef = useRef(null);

  const load_FFmpeg = async () => {
    ffmpeg = await createFFmpeg({
      corePath: chrome.runtime.getURL("vendor/ffmpeg-core.js"),
      log: true,
      mainName: "main",
      logger: ({ type, message }) => {
        if (type === "info") console.info(message);
        else if (type === "warn") console.warn(message);
        else if (type === "error") console.error(message);
      },
    });

    try {
      await ffmpeg.load();
    } catch (error) {
      console.log("Error loading FFmpeg~~~~~~~~~~~~~~~~~~~~~~~~~~", error);
    }

    setLoaded(true);
  };

  const toggleDarkMode = (checked) => {
    if (!darkMode) setDark(new Darkmode());
    else darkMode.toggle();
    setDarkMode(checked);
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
      // frame: currentBackgroundFrame,
    };

    setOverlayPositions((prevPositions) => {
      return prevPositions.map((item) => {
        if (item.overlayPath === overlayPath) {
          const existingMovementIndex = item.timeline.findIndex(
            (movement) => movement.frame === newMovement.frame
          );
          if (existingMovementIndex !== -1) {
            // Update existing movement
            const updatedTimeline = [...item.timeline];
            updatedTimeline[existingMovementIndex] = newMovement;
            return { ...item, timeline: updatedTimeline };
          } else {
            // Add new movement to array
            return { ...item, timeline: [...item.timeline, newMovement] };
          }
        }
        return item;
      });
    });
  };

  const handleMetadataLoaded = useCallback(() => {
    const imageElement = bgImageRef.current;
    if (imageElement) {
      const originalWidth = imageElement.naturalWidth;
      const originalHeight = imageElement.naturalHeight;
      const aspectRatio = originalWidth / originalHeight;
      const containerHeight = window.innerHeight * 0.7; // 70vh
      const newWidth = containerHeight * aspectRatio;

      imageElement.parentElement.style.width = `${newWidth}px`;

      // Calculate and update scaling factors
      const renderedWidth = imageElement.clientWidth;
      const renderedHeight = imageElement.clientHeight;
      setScaleX(originalWidth / renderedWidth);
      setScaleY(originalHeight / renderedHeight);
    }
  }, [imageFile]);

  const removeOverlay = async (url) => {
    setOverlays((overlays) => overlays.filter((item) => item !== url));
    const newOverlayPositions = overlayPositions.filter(
      (o) => o.overlayPath !== url
    );
    setOverlayPositions(newOverlayPositions);
  };

  const renderVideo = async (duration) => {
    EventBus.dispatch("setLoading", true);
    let fileName = new Date().getTime();
    const imageData = await fetchFile(imageFile);
    await ffmpeg.FS("writeFile", `input_${fileName}.jpg`, imageData);

    function generateOverlayFilters() {
      var despillRed = 1.0;
      var despillGreen = 1.0;
      var despillBlue = 1.0;
      var despill = `[0:v]unsharp=lx=13:ly=13[ckout];`;
      return overlayPositions
        .flatMap((overlayPosition, overlayIndex) =>
          overlayPosition.timeline.map((timeline, index, array) => {
            //TODO: add rotation and size to the overlay
            let radians = (timeline.rotation * Math.PI) / 180; // convert degrees to radians

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
            let chainStart =
              overlayIndex > 0
                ? `${resizeOverlay}[v${overlayIndex}][scaled${
                    overlayIndex + 1
                  }]`
                : `${resizeOverlay}[0:v][scaled${overlayIndex + 1}]`;
            let chainSuffix;

            if (overlayPositions.length > 1) {
              chainSuffix =
                overlayIndex === overlayPositions.length - 1
                  ? `[out]`
                  : `[v${overlayIndex + 1}]`;
            } else {
              chainSuffix = `[out]`;
            }

            return `${chainStart}overlay=${timeline.x}:${timeline.y},scale='trunc(iw/2)*2:trunc(ih/2)*2'${chainSuffix}`;
          })
        )
        .join(";");
    }

    if (!generateOverlayFilters()) {
      setRefreshContent("You need to set the position of foreground exactly!");
      setRefreshModal(true);
      return;
    }

    try {
      overlayPositions.length > 0
        ? await ffmpeg.run(
            "-stream_loop",
            "-1",
            "-t",
            `${duration}`,
            "-i",
            `input_${fileName}.jpg`,
            ...overlayPositions
              .map((overlay) => [
                "-stream_loop",
                "-1",
                "-i",
                overlay.fileNameFFMPEG,
              ])
              .flat(),
            "-filter_complex",
            `${generateOverlayFilters()}`,
            "-map",
            `[out]`, // Map the final overlay to the output
            "-r",
            "30",
            "-t",
            `${duration}`,
            "-preset",
            "ultrafast",
            `output_${fileName}.mp4`
          )
        : await ffmpeg.run(
            "-i",
            `input_${fileName}.jpg`,
            "-c:a",
            "copy",
            "-t",
            `${duration}`,
            "-preset",
            "ultrafast",
            `output_${fileName}.mp4`
          );
    } catch (error) {
      setRefreshContent("Something went wrong. You should refresh this page!");
      setRefreshModal(true);
      return;
    }

    const data = await ffmpeg.FS("readFile", `output_${fileName}.mp4`);
    let edited_video_url = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );

    // Create a link element for downloading the image
    const a = document.createElement("a");
    a.href = edited_video_url;
    a.download = "videoshot.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    EventBus.dispatch("setLoading", false);
  };

  const writeOverlayToFFmpegFS = async (fileName, blobUrl) => {
    const fileExists = overlayPositions.some(
      (position) => position.fileNameFFMPEG == fileName
    );

    if (fileExists) {
      return;
    }

    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    await ffmpeg.FS("writeFile", fileName, uint8Array);

    setOverlayPositions((prevPositions) => {
      return [
        ...prevPositions,
        { overlayPath: blobUrl, fileNameFFMPEG: fileName, timeline: [] },
      ];
    });
  };

  const onRefresh = () => {
    location.reload(true);
  };

  const onCloseRefresh = () => {
    setRefreshModal(false);
    EventBus.dispatch("setLoading", false);
  };

  useEffect(() => {
    setOverlays([]);
    setOverlayPositions([]);
    load_FFmpeg();
  }, [imageFile]);

  useEffect(() => {
    load_FFmpeg();

    bgImageRef.current.addEventListener("load", handleMetadataLoaded);

    const bounds = bgImageRef.current.getBoundingClientRect();
    setImageBounds(bounds);
  }, [bgImageRef]);

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
      //every time overlay changes, write the new overlay to FFmpeg file system
      overlays.forEach((overlayPath, index) => {
        const lastIndex = overlayPath.lastIndexOf("/");
        const overlayName = overlayPath.substring(lastIndex + 1);
        const overlayFileName = `${overlayName}.png`;

        writeOverlayToFFmpegFS(overlayFileName, overlayPath);
      });
    } else {
      // Clear the old overlays from the FFmpeg file system
      overlayPositions.forEach(async (position) => {
        const fileName = position.fileNameFFMPEG;
        await ffmpeg.deleteFile(fileName);

        // Remove the overlay position from state as well
        const newOverlayPositions = overlayPositions.filter(
          (o) => o.fileNameFFMPEG !== fileName
        );
        setOverlayPositions(newOverlayPositions);
      });
    }
  }, [overlays]);

  return (
    <div>
      <Dialog
        open={refreshModal}
        // onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {refreshContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onRefresh}>Refresh</Button>
          <Button onClick={onCloseRefresh} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <DarkModeSwitch
        style={{ marginBottom: "2rem", position: "absolute", right: "2%" }}
        checked={isDarkMode}
        onChange={toggleDarkMode}
        size={40}
      />
      <div data-vjs-player style={{ position: "relative", overflow: "hidden" }}>
        <img
          ref={bgImageRef}
          id="video-js"
          className="video-js vjs-big-play-centered"
          style={{ width: "auto" }}
          src={imageFile}
        />
        {imageBounds &&
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
      {loaded && (
        <div style={{ marginTop: "13px" }}>
          {recordingStatus ? (
            <IconButton
              color="primary"
              size="50px"
              sx={{ marginRight: "20px" }}
              onClick={() => setRecordingStatus(false)}
            >
              <GraphicEqIcon fontSize="large" />
            </IconButton>
          ) : (
            <IconButton
              color="primary"
              size="50px"
              sx={{ marginRight: "20px" }}
              onClick={() => setRecordingStatus(true)}
            >
              <VideocamIcon fontSize="large" />
            </IconButton>
          )}
        </div>
      )}
      <p ref={messageRef}></p>
      <p>
        {loaded
          ? "FFmpeg is ready. You can now render the video."
          : "Loading FFmpeg... Please wait."}
      </p>
    </div>
  );
}

export default ImageEditorInterface;
