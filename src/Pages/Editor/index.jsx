import React, { useEffect, useState } from "react";
import VideoEditor from "../../Components/Options/VideoEditor";
import Header from "../../Components/Options/Header";
import EventBus from "../../utils/EventBus";

import CircularProgress from "@mui/material/CircularProgress";

function Editor() {
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState(null);

  const setLoading = (data) => {
    setIsLoading(data);
  };
  0;

  useEffect(() => {
    EventBus.on("setLoading", (data) => setLoading(data));

    return () => {
      EventBus.remove("setLoading");
    };
  });

  return (
    <div className="flex flex-col">
      <div
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(10,10,10, 82%)",
          zIndex: 999,
          display: `${isLoading ? "flex" : "none"}`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress style={{ width: "70px", height: "70px" }} />
      </div>
      <Header audio={audio} setAudio={setAudio} />
      <VideoEditor audio={audio}/>
    </div>
  );
}
export default Editor;
