import React, { useEffect, useState, useRef, useCallback } from "react";
import videojs from "video.js";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
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
let currentVideoTime = "00:00:00.000";
import Darkmode from "darkmode-js";

import EventBus from "../../utils/EventBus.jsx";

const { createFFmpeg, fetchFile } = FFmpeg;
let ffmpeg;

let recordingStartTime = 0;
let recordingEndTime = 0;

function VideoEditorInterface({
  videoFile,
  videoRef,
  overlays,
  playerRef,
  isDarkMode,
  setDarkMode,
  setOverlays,
  setVideoFile,
  images,
}) {
  const [loaded, setLoaded] = useState(false);
  const [videoBounds, setVideoBounds] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState();
  const [overlayPositions, setOverlayPositions] = useState([]);
  let [darkMode, setDark] = useState(false);
  const [scaleX, setScaleX] = useState(1); // Horizontal scaling factor
  const [scaleY, setScaleY] = useState(1); // Vertical scaling factor
  const [refreshModal, setRefreshModal] = useState(false);
  const [backgroundFrameRate, setBackgroundFrameRate] = useState(0); // Background video frame rate

  const [refreshContent, setRefreshContent] = useState("");

  const stateFrameRate = useRef(backgroundFrameRate);
  const messageRef = useRef(null);

  const load_FFmpeg = async () => {
    ffmpeg = await createFFmpeg({
      corePath: chrome.runtime.getURL("vendor/ffmpeg-core.js"),
      log: true,
      mainName: "main",
    });

    try {
      await ffmpeg.load();
    } catch (error) {
      console.log("Error loading FFmpeg~~~~~~~~~~~~~~~~~~~~~~~~~~", error);
    }

    setLoaded(true);
  };

  const handleMetadataLoaded = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const originalWidth = videoElement.videoWidth;
      const originalHeight = videoElement.videoHeight;
      // setTimeout(() => {
      //   getVideoFrameRate();
      // }, 2000);
      const aspectRatio = originalWidth / originalHeight;
      const containerHeight = window.innerHeight * 0.7; // 70vh
      const newWidth = containerHeight * aspectRatio;

      videoElement.parentElement.style.width = `${newWidth}px`;

      // Calculate and update scaling factors
      const renderedWidth = videoElement.clientWidth;
      const renderedHeight = videoElement.clientHeight;
      setScaleX(originalWidth / renderedWidth);
      setScaleY(originalHeight / renderedHeight);
    }
  }, [videoFile]);

  const setVideoSource = useCallback(() => {
    if (videoRef.current) {
      setTimeout(() => {
        videoRef.current.src = videoFile;
        videoRef.current.load();
        videoRef.current.play();
      }, 500);
    }
  }, [videoFile]);

  useEffect(() => {
    // Initialize video.js player
    load_FFmpeg();
    if (videoRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: "auto",
        loop: true,
      });

      videoRef.current.addEventListener("loadedmetadata", handleMetadataLoaded);

      videoRef.current.addEventListener("timeupdate", () => {
        const currentTime = videoRef.current.currentTime;
        currentVideoTime = formatTime(currentTime);
      });
    }
    const bounds = videoRef.current.getBoundingClientRect();
    setVideoBounds(bounds);
    return () => {
      // Dispose the player on unmount
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
    //TESTING
  }, [videoRef, playerRef]);

  useEffect(() => {
    setVideoSource(); // set video source on update
  }, [setVideoSource]);

  useEffect(() => {
    setOverlays([]);
    setOverlayPositions([]);
    load_FFmpeg();
  }, [videoFile]);

  const renderVideo = async (duration) => {
    EventBus.dispatch("setLoading", true);
    let fileName = new Date().getTime();

    const videoData = await fetchFile(videoFile);
    await ffmpeg.FS("writeFile", `input_${fileName}.mp4`, videoData); // Fetch and write the overlay image to FFmpeg's filesystem

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

            return `${chainStart}overlay=${timeline.x}:${timeline.y}${chainSuffix}`;
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
            "-i",
            `input_${fileName}.mp4`,
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
                overlay.fileNameFFMPEG,
              ])
              .flat(),
            "-filter_complex",
            `${generateOverlayFilters()}`,
            // `${generateOverlayFilters()};[1:v]rotate='90:c=none:ow=hypot(iw,ih):oh=ow'[rotate];[v0][rotate]overlay=0:0[rotated]`,
            "-map",
            `[out]`, // Map the final overlay to the output
            "-r",
            "30",
            "-c:a",
            "copy",
            "-t",
            `${duration}`,
            "-preset",
            "ultrafast",
            `output_${fileName}.mp4`
          )
        : await ffmpeg.run(
            "-i",
            `input_${fileName}.mp4`,
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

    // Example FFmpeg command (replace with your desired editing operations)

    // Read the edited video file
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

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time - Math.floor(time)) * 1000);
    function padZero(num, length = 2) {
      return String(num).padStart(length, "0");
    }
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}.${padZero(
      milliseconds,
      3
    )}`;
  };

  const getVideoFramePosition = () => {
    const videoElement = videoRef.current;
    const currentTimeInSeconds = videoElement ? videoElement.currentTime : 0; // Current time in seconds
    const timestamp = currentTimeInSeconds * 1000; // Convert to milliseconds
    const frameNumber = Math.round((timestamp / 1000) * stateFrameRate.current); // Convert milliseconds to frame number
    return frameNumber;
  };

  const handleMovement = async (
    overlayPath,
    finalX,
    finalY,
    width,
    heigth,
    rotation
  ) => {
    let currentBackgroundFrame = getVideoFramePosition();
    // Assuming videoRef is a reference to your video element

    const newMovement = {
      x: finalX,
      y: finalY,
      width: width,
      height: heigth,
      rotation: rotation,
      frame: 1,
      // frame: currentBackgroundFrame,
    };
    //Adding new movement to the timeline of overlay
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

  useEffect(() => {
    if (overlays.length > 0) {
      //every time overlay changes, write the new overlay to FFmpeg file system
      overlays.forEach((overlayPath, index) => {
        if (!overlayPositions.find((o) => o.overlayPath === overlayPath)) {
          // Only write new overlay if it is not already in overlayPositions
          const lastIndex = overlayPath.lastIndexOf("/");
          const overlayName = overlayPath.substring(lastIndex + 1);
          const overlayFileName = `${overlayName}.png`;

          writeOverlayToFFmpegFS(overlayFileName, overlayPath);
        }
      });
    }
  }, [overlays]);

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

  async function writeOverlayToFFmpegFS(fileName, blobUrl) {
    // Add unique identifier to fileName
    const uniqueFileName = `${fileName}`;

    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Use uniqueFileName to write to FFmpeg filesystem
    await ffmpeg.FS("writeFile", uniqueFileName, uint8Array);

    setOverlayPositions((prevPositions) => [
      ...prevPositions,
      { overlayPath: blobUrl, fileNameFFMPEG: uniqueFileName, timeline: [] },
    ]);

    // await ffmpeg.exit();
  }

  const toggleDarkMode = (checked) => {
    if (!darkMode) setDark(new Darkmode());
    else darkMode.toggle();
    setDarkMode(checked);
  };

  const removeOverlay = async (url) => {
    setOverlays((overlays) => overlays.filter((item) => item !== url));
    const newOverlayPositions = overlayPositions.filter(
      (o) => o.overlayPath !== url
    );
    setOverlayPositions(newOverlayPositions);
  };

  const onRefresh = () => {
    location.reload(true);
  };

  const onCloseRefresh = () => {
    setRefreshModal(false);
    EventBus.dispatch("setLoading", false);
  };

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
      <div data-vjs-player>
        <video
          ref={videoRef}
          id="video-js"
          className="video-js vjs-big-play-centered"
          loop
        >
          <source src={videoFile} type="video/mp4" />
        </video>
        {videoBounds &&
          overlays?.map((image, index) => (
            // <Draggable
            //   key={index}
            //   axis="both"
            //   bounds="parent"
            //   onDrag={(e, data) => handleMovement(index, e, data, image)}
            // >
            //   <img src={image} className={`draggable-${index}`} />
            // </Draggable>
            <Image
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
          {/* <IconButton
            color="primary"
            size="50px"
            onClick={() => takeSnapshot()}
          >
            <CameraAltIcon fontSize="large" />
          </IconButton> */}
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

export default VideoEditorInterface;
