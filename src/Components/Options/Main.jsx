import GamepadIcon from "@mui/icons-material/Gamepad";
import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import { MainDialog } from "./MainDialog.jsx";
import * as fal from "@fal-ai/serverless-client";
import { DragDropBackground, DragDropOverlay } from "./DragDrop.jsx";
import { ForegroundDialog } from "./ForegroundDialog.jsx";
import { BackgroundDialog } from "./BackgroundDialog.jsx";

import backgroundImage from "@/assets/icons/background_ico.png";
import forgroundImage from "@/assets/icons/forground_ico.png";
import backgroundAddImage from "@/assets/icons/background_add_ico.png";
import forgroundAddImage from "@/assets/icons/forground_add_ico.png";
import bgRemoveIco from "@/assets/icons/scissor_ico.png";

import axios from "axios";
import EventBus from "../../utils/EventBus.jsx";

const screenRatio = ["16:9", "1:1", "4:3"];
let previousRatioOption = 3;

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export const Main = ({
  setVideoFile,
  setOverlays,
  setAspectRatio,
  openErrorAlert,
  setOpenErrorAlert,
}) => {
  const [open, setOpen] = useState(false);
  const [scroll, setScroll] = useState("paper");
  const [pageType, setPageType] = useState("main");
  const [downloadedData, setDownloadedData] = useState([]);
  const [downloadedOverlay, setDownloadedOverlay] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({});
  const [ratio, setRatio] = useState(3);
  const [groundType, setGroundType] = useState("");
  const descriptionElementRef = React.useRef(null);

  useEffect(() => {
    EventBus.on("setRatio", (data) => setRatio(data));

    return () => {
      EventBus.remove("setRatio");
    };
  });

  useEffect(() => {
    switch (ratio) {
      case 0:
        setAspectRatio(16);
        break;
      case 1:
        setAspectRatio(1);
        break;
      case 2:
        setAspectRatio(4);
        break;
      default:
        setAspectRatio(null);
        break;
    }
  }, [ratio]);

  const handleClickOpen = (scrollType, ground) => () => {
    localStorage.setItem("ground", ground);
    if (ground == "fg") {
      localStorage.getItem("SelectedFgCategory") &&
      localStorage.getItem("SelectedForegroundCategoryData")
        ? setPageType("foreground")
        : setPageType("main");
    } else if (ground == "bg") {
      localStorage.getItem("SelectedBgCategory") &&
      localStorage.getItem("SelectedBackgroundCategoryData")
        ? setPageType("background")
        : setPageType("main");
    }
    setGroundType(ground);
    setOpen(true);
    setScroll(scrollType);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fal.config({
      credentials: `${import.meta.env.VITE_REACT_APP_FAL_KEY}`,
    });
  }, []);

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  const onBgSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith("video/") || file.type.startsWith("image/")) {
      let videoFileS3Key =
        file.name.split(".").slice(0, -1).join(".") +
        "-" +
        new Date().getTime() +
        "." +
        file.name.split(".").pop();
      videoFileS3Key = videoFileS3Key.replaceAll(" ", "_");

      EventBus.dispatch("setLoading", true);
      await axios
        .post(
          `https://6ryr2wliwk.execute-api.us-east-2.amazonaws.com/product/presignedURL`,
          {
            fileKey: videoFileS3Key,
          }
        )
        .then(async (res) => {
          const signedUrl = res.data.signedUrl;

          await fetch(signedUrl, {
            method: "PUT",
            body: file,
          });

          // const videoUrl = URL.createObjectURL(file);
          if (file.type.startsWith("image/")) {
            setVideoFile({
              url: "https://picpulsemedia.s3.amazonaws.com/" + videoFileS3Key,
              type: "image",
            });
          } else {
            setVideoFile({
              url: "https://picpulsemedia.s3.amazonaws.com/" + videoFileS3Key,
              type: "video",
            });
          }
          EventBus.dispatch("setLoading", false);
        });
    } else {
      console.error("Please upload a valid video file.");
    }

    // setFileInfo({
    //   url: URL.createObjectURL(file),
    //   type: file.type,
    // });
  };

  const onFgSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      let overlayFileS3Key =
        file.name.split(".").slice(0, -1).join(".") +
        "-" +
        new Date().getTime() +
        "." +
        file.name.split(".").pop();

      overlayFileS3Key = overlayFileS3Key.replaceAll(" ", "_");

      EventBus.dispatch("setLoading", true);
      await axios
        .post(
          `https://6ryr2wliwk.execute-api.us-east-2.amazonaws.com/product/presignedURL`,
          {
            fileKey: overlayFileS3Key,
          }
        )
        .then(async (res) => {
          const signedUrl = res.data.signedUrl;
          await fetch(signedUrl, {
            method: "PUT",
            body: file,
          });
          setOverlays((prevOverlays) => [
            ...prevOverlays,
            "https://picpulsemedia.s3.amazonaws.com/" + overlayFileS3Key,
          ]);
          EventBus.dispatch("setLoading", false);
        });
    } else {
      console.error("Please upload a valid video file.");
    }
  };

  const onBgRemoveSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      let overlayFileS3Key =
        file.name.split(".").slice(0, -1).join(".") +
        "-" +
        new Date().getTime() +
        "." +
        file.name.split(".").pop();

      overlayFileS3Key = overlayFileS3Key.replaceAll(" ", "_");

      if (e.target.files && e.target.files[0]) {
        let reader = new FileReader();

        reader.onload = (e) => {
          let imageUrl = e.target.result; // This is the Data URL
          processImage(imageUrl, overlayFileS3Key);
        };

        // Read the file as Data URL
        reader.readAsDataURL(e.target.files[0]);
      }
    }
  };

  const processImage = async (imgURL, imgS3Key) => {
    EventBus.dispatch("setLoading", true);
    try {
      const result = await fal.subscribe("fal-ai/imageutils/rembg", {
        input: {
          image_url: imgURL,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      const response = await fetch(result.image.url);
      const blobData = await response.blob();

      const imageFile = new File([blobData], result.image.file_name, {
        type: result.image.content_type,
        lastModified: new Date(),
      });

      await axios
        .post(
          `https://6ryr2wliwk.execute-api.us-east-2.amazonaws.com/product/presignedURL`,
          {
            fileKey: imgS3Key,
          }
        )
        .then(async (res) => {
          const signedUrl = res.data.signedUrl;
          await fetch(signedUrl, {
            method: "PUT",
            body: imageFile,
          });
          setOverlays((prevOverlays) => [
            ...prevOverlays,
            "https://picpulsemedia.s3.amazonaws.com/" + imgS3Key,
          ]);
          EventBus.dispatch("setLoading", false);
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex bg-black">
      <div className="flex flex-row items-center justify-center w-full h-36">
        <div className="flex flex-row w-[36%] gap-16 justify-center items-center p-4">
          <div
            className="relative p-1 overflow-hidden rounded-lg cursor-pointer w-28 h-28 hover:brightness-75"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
            onClick={handleClickOpen("paper", "bg")}
          />
          <label
            className="relative p-1 overflow-hidden rounded-lg cursor-pointer w-28 h-28 hover:brightness-75"
            style={{
              backgroundImage: `url(${backgroundAddImage})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*,video/*"
              onChange={onBgSelect}
            />
          </label>
          {/* <DragDropBackground setVideoFile={setVideoFile} className="w-1/2" /> */}
        </div>
        <div className="w-[28%] h-full flex items-end justify-center pb-4 relative">
          <div className="flex flex-row gap-3">
            {screenRatio.map((value, index) => (
              <div
                key={index}
                className={`text-white hover:bg-sky-500 w-28 h-9 items-center flex justify-center cursor-pointer rounded-sm ${
                  ratio == index ? "bg-sky-600" : "bg-black"
                }`}
                onClick={() => {
                  if (previousRatioOption === index) {
                    setRatio(3);
                    previousRatioOption = 3;
                  } else {
                    setRatio(index);
                    previousRatioOption = index;
                  }
                }}
              >
                {value}
              </div>
            ))}
          </div>
          {/* <IconButton color="primary" onClick={handleClickOpen("paper")}>
            <GamepadIcon style={{ minHeight: "100px", minWidth: "100px" }} />
          </IconButton> */}
        </div>
        <div className="flex flex-row w-[36%] gap-16 justify-center items-center p-4">
          <div
            className="relative p-1 overflow-hidden rounded-lg cursor-pointer w-28 h-28 hover:brightness-75"
            style={{
              backgroundImage: `url(${forgroundImage})`, // set image here
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
            onClick={handleClickOpen("paper", "fg")}
          />
          <label
            className="relative p-1 overflow-hidden rounded-lg cursor-pointer w-28 h-28 hover:brightness-75"
            style={{
              backgroundImage: `url(${forgroundAddImage})`, // set image here
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*"
              onChange={onFgSelect}
            />
          </label>
          <label
            className="relative p-1 overflow-hidden rounded-lg cursor-pointer w-[93px] h-[93px] hover:brightness-75"
            style={{
              backgroundImage: `url(${bgRemoveIco})`, // set image here
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*"
              onChange={onBgRemoveSelect}
            />
          </label>
          {/* <DragDropOverlay setOverlays={setOverlays} className="w-1/2" /> */}
        </div>
      </div>

      <MainDialog
        open={open}
        handleClose={handleClose}
        setPageType={setPageType}
        scroll={scroll}
        setSelectedCategory={setSelectedCategory}
        groundType={groundType}
      />
      <BackgroundDialog
        open={open && pageType === "background"}
        handleClose={handleClose}
        setPageType={setPageType}
        setVideoFile={setVideoFile}
        downloadedData={downloadedData}
        setDownloadedData={setDownloadedData}
        selectedCategory={selectedCategory}
      />
      <ForegroundDialog
        open={open && pageType === "foreground"}
        handleClose={handleClose}
        scroll={scroll}
        setPageType={setPageType}
        setOverlays={setOverlays}
        setDownloadedOverlay={setDownloadedOverlay}
        downloadedOverlay={downloadedOverlay}
        selectedCategory={selectedCategory}
        openErrorAlert={openErrorAlert}
        setOpenErrorAlert={setOpenErrorAlert}
      />
    </div>
  );
};
