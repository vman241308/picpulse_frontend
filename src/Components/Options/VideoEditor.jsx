import React, { useRef, useState } from "react";
import VideoEditorInterface from "./VideoEditorInterface.jsx";
import ImageEditorInterface from "./ImageEditorInterface.jsx";

import { Main } from "./Main.jsx";

const VideoEditor = () => {
  const [videoFile, setVideoFile] = useState({ url: null, type: null });
  const [overlays, setOverlays] = useState([]);
  const [isDarkMode, setDarkMode] = useState(false);
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const playerRef = useRef(null);

  return (
    // <Grid container spacing={2} className="bg-black">
    <div>
      <div className="w-full h-[calc(100vh-224px)] bg-black justify-center items-center flex py-14">
        {videoFile.url ? (
          <VideoEditorInterface
            backgroundType={videoFile.type}
            videoFile={videoFile.url}
            videoRef={videoRef}
            overlays={overlays}
            playerRef={playerRef}
            setOverlays={setOverlays}
          />
        ) : (
          <div className="bg-black w-[80%] h-full border-dashed border-2 border-sky-500"></div>
        )}
        {/* <div className="bg-black w-[80%] h-full border-dashed border-2 border-sky-500"></div> */}
      </div>
      <Main setVideoFile={setVideoFile} setOverlays={setOverlays} />
    </div>
  );
};

export default VideoEditor;
