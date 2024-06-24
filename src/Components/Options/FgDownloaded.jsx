import React from "react";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";

export const FgDownloaded = ({
  setOverlays,
  downloadedOverlay,
  setDownloadedOverlay,
  selectedCategory,
}) => {
  const removeItem = async (item) => {
    const udpatedOverlays = downloadedOverlay.filter((data) => data !== item);
    setDownloadedOverlay(udpatedOverlays);

    const newOverlays = await Promise.all(
      udpatedOverlays.map(async (overlay) => {
        const response = await fetch(overlay.hover);
        const blob = await response.blob();
        return URL.createObjectURL(blob); // return overlayUrl for each selected image
      })
    );

    // Set overlays to the new array of overlayUrls from the selected images
    setOverlays(newOverlays);
  };
  return (
    <React.Fragment>
      {downloadedOverlay
        .filter((item) => item.category_id == selectedCategory.id)
        .map((item, index) => {
          return (
            <React.Fragment key={index}>
              <Grid item xs={4}>
                <img
                  src={item.thumb_url}
                  style={{ width: "200px", height: "150px", cursor: "pointer" }}
                  loading="lazy"
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
              >
                <IconButton aria-label="FavoriteIcon">
                  <FavoriteIcon />
                </IconButton>
                <IconButton
                  aria-label="DeleteIcon"
                  onClick={() => removeItem(item)}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </React.Fragment>
          );
        })}
    </React.Fragment>
  );
};
