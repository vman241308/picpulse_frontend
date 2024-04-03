import React, { useEffect, useState, useRef, useCallback } from "react";
import videojs from "video.js";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import IconButton from "@mui/material/IconButton";
import VideocamIcon from "@mui/icons-material/Videocam";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import Image from "./Image.jsx";
import { DarkModeSwitch } from "react-toggle-dark-mode";
let currentVideoTime = "00:00:00.000";
import Darkmode from "darkmode-js";

import EventBus from "../../utils/EventBus.jsx";

let recordingStartTime = 0;
let recordingEndTime = 0;

function ImageEditorInterface({
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
  const [backgroundFrameRate, setBackgroundFrameRate] = useState(0); // Background video frame rate
  const stateFrameRate = useRef(backgroundFrameRate);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef(null);
  const load_FFmpeg = async () => {
    const baseURL =
      "/home/rson/Documents/New_interface/src/Components/Options/ffmpeg/umd";
    const ffmpeg = ffmpegRef.current;

    ffmpeg.on("log", ({ message }) => {
      messageRef.current.innerHTML = message;
      const frameRateMatch = message.match(/(\d+(\.\d+)?) fps/);
      if (frameRateMatch && stateFrameRate.current == 0) {
        const frameRate = parseFloat(frameRateMatch[1]);
        setBackgroundFrameRate(frameRate);
        stateFrameRate.current = frameRate;
      }
    });

    await ffmpeg.load({
      coreURL: `${baseURL}/ffmpeg-core.js`,
      wasmURL: `${baseURL}/ffmpeg-core.wasm`,
    });

    setLoaded(true);
  };
  const getVideoFrameRate = async () => {
    // Execute FFmpeg command to get video information
    const videoData = await fetchFile(videoFile);

    await ffmpegRef.current.writeFile("input.mp4", videoData); // Fetch and write the overlay image to FFmpeg's filesystem
    ffmpegRef.current.exec(["-i", "input.mp4"]);
  };
  const handleMetadataLoaded = useCallback(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const originalWidth = videoElement.videoWidth;
      const originalHeight = videoElement.videoHeight;

      setTimeout(() => {
        getVideoFrameRate();
      }, 2000);
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

  const renderVideo = async (duration) => {
    EventBus.dispatch("setLoading", true);
    const ffmpeg = ffmpegRef.current;

    // Fetch and write the video file to FFmpeg's filesystem
    const videoData = await fetchFile(videoFile);
    await ffmpeg.writeFile("input.mp4", videoData); // Fetch and write the overlay image to FFmpeg's filesystem

    function generateOverlayFilters() {
      var despillRed = 1.0;
      var despillGreen = 1.0;
      var despillBlue = 1.0;
      var despill = `[0:v]unsharp=lx=13:ly=13[ckout];`;
      // var despill = `[0:v]unsharp=lx=13:ly=13[s5];[s5]despill=red=${despillRed}:green=${despillGreen}:blue=${despillBlue}[ckout];`;
      return overlayPositions
        .flatMap((overlayPosition, overlayIndex) =>
          overlayPosition.timeline.map((timeline, index, array) => {
            //TODO: add rotation and size to the overlay
            let radians = (timeline.rotation * Math.PI) / 180; // convert degrees to radians
            let rotateOverlay = `,rotate=${radians}:c=black@0:ow=rotw(iw):oh=roth(ih)`;
            let resizeOverlay = `[${overlayIndex + 1}:v]scale=${
              timeline.width
            }:${timeline.height}${rotateOverlay}[scaled${overlayIndex + 1}];`; //<---THIS WORKS, rotation is breaking it
            // let resizeOverlay = `[1:v]scale=${timeline.width}:${timeline.height},rotate='${timeline.rotation}:c=none:ow=rotw(iw):oh=roth(ih)'[scaled${index}];`;
            let chainStart =
              overlayIndex > 0
                ? `${resizeOverlay}[v${overlayIndex}][scaled${
                    overlayIndex + 1
                  }]`
                : `${despill + resizeOverlay}[ckout][scaled${
                    overlayIndex + 1
                  }]`;
            // : `${despill + resizeOverlay}[ckout][scaled${index}]`;
            let chainSuffix;

            if (overlayPositions.length > 1) {
              chainSuffix =
                overlayIndex > 0 ? `[out]` : `[v${overlayIndex + 1}]`;
            } else {
              chainSuffix = `[out]`;
            }

            // return `${chainStart}overlay=${timeline.x}:${timeline.y}:shortest=1:enable='between(n\\,${timeline.frame}\\,${nextFrame})'${chainSuffix}`;
            return `${chainStart}overlay=${timeline.x}:${timeline.y}${chainSuffix}`;
          })
        )
        .join(";");
    }

    // Include the overlay inputs and the filter in the FFmpeg command
    const ffmpegCommand = [
      "-stream_loop",
      "-1",
      "-i",
      "input.mp4",
      // Include each overlay as an input
      ...overlayPositions
        .map((overlay) => ["-stream_loop", "-1", "-i", overlay.fileNameFFMPEG])
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
      "output.mp4",
    ];

    console.log(ffmpegCommand);
    await ffmpeg.exec(ffmpegCommand);
    // Read the edited video file
    const data = await ffmpeg.readFile("output.mp4");
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

    setVideoFile(null);
    setOverlays([]);

    setVideoFile(edited_video_url);
    EventBus.dispatch("setLoading", false);
  };
  const takeSnapshot = async () => {
    let frameNumber = getVideoFramePosition();

    const ffmpeg = ffmpegRef.current;

    // Fetch and write the video file to FFmpeg's filesystem
    const videoData = await fetchFile(videoFile);
    await ffmpeg.writeFile("input.mp4", videoData);

    function generateOverlayFilters() {
      var despillRed = 1.0;
      var despillGreen = 1.0;
      var despillBlue = 1.0;
      var despill = `[0:v]unsharp=lx=13:ly=13[ckout];`;
      // var despill = `[0:v]unsharp=lx=13:ly=13[s5];[s5]despill=red=${despillRed}:green=${despillGreen}:blue=${despillBlue}[ckout];`;
      return overlayPositions[0].timeline
        .map((timeline, index, array) => {
          let nextFrame =
            index < array.length - 1 ? array[index + 1].frame - 1 : "n+1";
          //TODO: add rotation and size to the overlay
          let resizeOverlay = `[1:v]scale=${timeline.width}:${timeline.height}[scaled${index}];`; //<---THIS WORKS, rotation is breaking it
          // let resizeOverlay = `[1:v]scale=${timeline.width}:${timeline.height},rotate='${timeline.rotation}:c=none:ow=rotw(iw):oh=roth(ih)'[scaled${index}];`;
          let chainStart =
            index > 0
              ? `${resizeOverlay}[v${index - 1}][scaled${index}]`
              : `${despill + resizeOverlay}[ckout][scaled${index}]`;
          // : `${despill + resizeOverlay}[ckout][scaled${index}]`;
          let chainSuffix =
            index === array.length - 1 ? `[out]` : `[v${index}]`;

          return `${chainStart}overlay=${timeline.x}:${timeline.y}${chainSuffix}`;
        })
        .join(";");
    }

    // Include the overlay inputs and the filter in the FFmpeg command
    const ffmpegCommand = [
      // Seek to the specified frame number
      "-i",
      "input.mp4",
      "-ss",
      `${currentVideoTime}`,
      // Include each overlay as an input if overlayPositions has elements
      ...(overlayPositions.length > 0
        ? overlayPositions
            .map((overlay) => ["-i", overlay.fileNameFFMPEG])
            .flat()
        : []),
      // Add filter_complex if overlayPositions has elements
      ...(overlayPositions.length > 0
        ? ["-filter_complex", `${generateOverlayFilters()}`]
        : []),
      "-map",
      "[out]", // Map the final overlay to the output
      "-crf",
      "23", // Lossless compression
      "-frames:v",
      "1", // Extract only one frame
      "outpudsat2.png", // Output file format (PNG)
    ];

    await ffmpeg.exec(ffmpegCommand);
    // Read the generated image file
    const imageData = await ffmpeg.readFile("outpudsat2.png");
    const imageBlob = new Blob([imageData.buffer], { type: "image/png" });

    // Create a URL for the image
    const imageUrl = URL.createObjectURL(imageBlob);

    // Create a link element for downloading the image
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "snapshot.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Log success message
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
    //every time overlay changes, write the new overlay to ffmpeg file system
    overlays?.forEach((overlayPath, index) => {
      // Find the index of the last occurrence of '/'
      const lastIndex = overlayPath.lastIndexOf("/");
      // Extract the substring after the last '/'
      const overlayName = overlayPath.substring(lastIndex + 1);
      const overlayFileName = `${overlayName}.png`;
      // Write the blob URL to the FFmpeg file system with the defined filename
      writeOverlayToFFmpegFS(overlayFileName, overlayPath);
    });
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
    // Check if the file already exists
    const fileExists = overlayPositions.some(
      (position) => position.fileNameFFMPEG == fileName
    );

    // If the file already exists, don't overwrite
    if (fileExists) {
      return;
    }

    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await ffmpegRef.current.writeFile(fileName, uint8Array);
    //init overlay fileName to overlayPositions
    setOverlayPositions((prevPositions) => {
      return [
        ...prevPositions,
        { overlayPath: blobUrl, fileNameFFMPEG: fileName, timeline: [] },
      ];
    });
  }

  const toggleDarkMode = (checked) => {
    if (!darkMode) setDark(new Darkmode());
    else darkMode.toggle();
    setDarkMode(checked);
  };

  const removeOverlay = (url) => {
    setOverlays(overlays.filter((item) => item !== url));
  };
  return (
    <div>
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
        <div>
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

export default ImageEditorInterface;
