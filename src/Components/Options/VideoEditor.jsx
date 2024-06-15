import React, { useRef, useState, useEffect } from "react";
import VideoEditorInterface from "./VideoEditorInterface.jsx";

import { Main } from "./Main.jsx";

const VideoEditor = ({ audio }) => {
  const [videoFile, setVideoFile] = useState({ url: null, type: null });
  const [overlays, setOverlays] = useState([]);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [openErrorAlert, setOpenErrorAlert] = useState(false);
  const bgRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (overlays && videoFile.url === null) {
      setOpenErrorAlert(true);
    } else {
      setOpenErrorAlert(false);
    }
  }, [overlays, videoFile]);

  return (
    <>
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
              setAspectRatio={setAspectRatio}
              audio={audio}
            />
          ) : (
            <div className="bg-black w-[80%] h-full border-dashed border-2 border-sky-500 relative flex items-center justify-center">
              <div className="absolute z-50 -bottom-24">
                <div className="w-16 h-16 bg-red-600 rounded-full cursor-pointer hover:bg-red-500" />
              </div>
            </div>
          )}
          {/* <div className="bg-black w-[80%] h-full border-dashed border-2 border-sky-500"></div> */}
        </div>
        <Main
          setVideoFile={setVideoFile}
          setOverlays={setOverlays}
          setAspectRatio={setAspectRatio}
          openErrorAlert={openErrorAlert}
          setOpenErrorAlert={setOpenErrorAlert}
        />
      </div>
    </>
  );
};

export default VideoEditor;
