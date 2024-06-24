import React from "react";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";

export const BgDownloaded = ({
  downloadedData,
  setDownloadedData,
  selectedCategory,
}) => {
  const removeItem = (item) => {
    setDownloadedData(downloadedData.filter((data) => data != item));
  };

  return (
    <React.Fragment>
      {downloadedData
        ? downloadedData
            .filter((item) => item.category_id == selectedCategory.id)
            .map((item, index) => (
              <React.Fragment key={index}>
                <Grid item xs={4}>
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
                      aria-label="DeleteIcon"
                      onClick={() => {
                        removeItem(item);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </React.Fragment>
            ))
        : ""}
    </React.Fragment>
  );
};
