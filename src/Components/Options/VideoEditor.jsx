import React, { useRef, useState, useEffect } from "react";
import VideoEditorInterface from "./VideoEditorInterface.jsx";
import axios from "axios";

import { Main } from "./Main.jsx";

const VideoEditor = ({ audio }) => {
  const [videoFile, setVideoFile] = useState({ url: null, type: null });
  const [overlays, setOverlays] = useState([]);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [openErrorAlert, setOpenErrorAlert] = useState(false);
  const [openServerWarning, setOpenServerWarning] = useState(false);
  const bgRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    apiTest();
    if (overlays && videoFile.url === null) {
      setOpenErrorAlert(true);
    } else {
      setOpenErrorAlert(false);
    }
  }, [overlays, videoFile]);

  const apiTest = async () => {
    try {
      await axios
        .get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/test`)
        .then(async (res) => {
          if (res.data.status === "success") setOpenServerWarning(false);
        });
    } catch (error) {
      setOpenServerWarning(true);
    }
  };

  const handleOk = async () => {
    await apiTest();
  };

  return (
    <>
      <div>
        <div className="w-full h-[calc(100vh-224px)] bg-black justify-center items-center flex py-14">
          {openServerWarning && (
            <div
              id="popup-modal"
              tabindex="-1"
              className="flex fixed inset-0 z-50 justify-center items-center overflow-x-hidden overflow-y-auto"
            >
              <div className="relative p-3 w-full max-w-xl max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                  <div className="p-4 md:p-5 text-center">
                    <svg
                      className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                      This site is being restored on to fix an error.
                    </h3>
                    <button
                      data-modal-hide="popup-modal"
                      type="button"
                      onClick={handleOk}
                      className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                    >
                      Okay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
