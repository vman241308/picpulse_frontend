import React, { useEffect, useState, useRef, useCallback } from "react";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import axios from "axios";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { GlobalStyles } from "@mui/material";

const CircularColor = () => {
  return (
    <Stack sx={{ color: "grey.500" }} spacing={2} direction="row">
      <CircularProgress color="inherit" />
    </Stack>
  );
};

export const BgVideoPreview = ({
  setVideoFile,
  setDownloadedData,
  selectedCategory,
}) => {
  const [LinerIndex, setLinerIndex] = useState(null);
  const [isDownloadinng, setIsDownloadinng] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const loader = useRef();

  const fetchData = async () => {
    var result = [];
    var videoData = [];
    if (localStorage.getItem("SelectedCategoryId") == selectedCategory.id) {
      result = JSON.parse(localStorage.getItem("SelectedBackgroundCategoryData"));
      setData(result);
    } else {
      if (localStorage.getItem('BgList')) {
        result = JSON.parse(localStorage.getItem("BgList"));
        videoData = result.filter((item) =>
            (item.s3_url.endsWith(".mp4") || item.s3_url.endsWith(".mov")) &&
            item.category_id == selectedCategory.id
        );
      } else {
        result = await axios(
          `http://18.218.107.206/greenscreen/public/service.php?type=get_assets`
        );
        videoData = result.data.data.filter((item) =>
            (item.s3_url.endsWith(".mp4") || item.s3_url.endsWith(".mov")) &&
            item.category_id == selectedCategory.id
        );
      }
      
      setData(videoData);
      localStorage.setItem("SelectedCategoryId", selectedCategory.id);
      localStorage.setItem("SelectedBackgroundCategoryData", JSON.stringify(videoData));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const lastItemElementRef = useCallback(
    (node) => {
      if (loader.current) loader.current.disconnect();

      loader.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !loading) {
          setCurrentPage((prev) => prev + 1);
        }
      });

      if (node) loader.current.observe(node);
    },
    [loading]
  );

  useEffect(() => {
    const observer = loader.current;
    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="600"
        width={1}
      >
        <CircularColor />
      </Box>
    );

  const download = async (item, index) => {
    setLinerIndex(index);
    setIsDownloadinng(true);
    setVideoFile({ url: item.s3_url, type: "video" });
    setDownloadedData((prevDownloaded) => [...prevDownloaded, item]);
    setIsDownloadinng(false);
  };

  return (
    <React.Fragment>
      <GlobalStyles
        styles={{
          "*::-webkit-scrollbar": {
            width: "0.6em",
          },
          "*::-webkit-scrollbar-track": {
            "-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,0.00)",
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,.1)",
            outline: "1px solid slategrey",
          },
        }}
      />
      <Grid container>
        {data?.slice(0, currentPage * itemsPerPage).map((item, index, self) => (
          <React.Fragment key={index}>
            <Grid
              item
              xs={4}
              ref={self.length === index + 1 ? lastItemElementRef : null}
            >
              <video
                src={item.s3_url}
                controls
                style={{ width: "180px", height: "140px" }}
              />
            </Grid>
            <Grid
              item
              xs={4}
              justifyContent={"center"}
              display={"flex"}
              alignItems={"center"}
            >
              <span>{item.title}</span>
            </Grid>
            <Grid
              item
              xs={4}
              justifyContent={"center"}
              display={"flex"}
              alignItems={"center"}
              flexDirection={"column"}
            >
              <Box display={"flex"} flexDirection={"row"}>
                <IconButton aria-label="FavoriteIcon">
                  <FavoriteIcon />
                </IconButton>
                <IconButton
                  aria-label="CloudDownloadIcon"
                  onClick={() => {
                    download(item);
                    setLinerIndex(index);
                  }}
                >
                  <CloudDownloadIcon />
                </IconButton>
              </Box>
              {isDownloadinng && LinerIndex === index ? (
                <Box sx={{ width: "100%" }}>
                  <LinearProgress />
                </Box>
              ) : null}
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </React.Fragment>
  );
};
