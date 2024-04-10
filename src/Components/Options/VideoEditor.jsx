import React, { useRef, useState } from "react";
import VideoEditorInterface from "./VideoEditorInterface.jsx";

import { Main } from "./Main.jsx";

const VideoEditor = () => {
  const [videoFile, setVideoFile] = useState({ url: null, type: null });
  const [overlays, setOverlays] = useState([]);
  const [aspectRatio, setAspectRatio] = useState(null);
  const bgRef = useRef(null);
  const playerRef = useRef(null);

  return (
    // <Grid container spacing={2} className="bg-black">
    <div>
      <div className="w-full h-[calc(100vh-224px)] bg-black justify-center items-center flex py-14">
        {videoFile.url ? (
          <VideoEditorInterface
            backgroundType={videoFile.type}
            videoFile={videoFile.url}
            bgRef={bgRef}
            overlays={overlays}
            playerRef={playerRef}
            setOverlays={setOverlays}
            aspectRatio={aspectRatio}
          />
        ) : (
          <div className="bg-black w-[80%] h-full border-dashed border-2 border-sky-500 relative flex items-center justify-center">
            <div className="absolute -bottom-24 z-50">
              <div className="w-16 h-16 bg-red-600 hover:bg-red-500 rounded-full cursor-pointer" />
            </div>
          </div>
        )}
        {/* <div className="bg-black w-[80%] h-full border-dashed border-2 border-sky-500"></div> */}
      </div>
      <Main
        setVideoFile={setVideoFile}
        setOverlays={setOverlays}
        setAspectRatio={setAspectRatio}
      />
    </div>
  );
};

export default VideoEditor;
