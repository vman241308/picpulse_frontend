import React, { useEffect, useState } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { GlobalStyles } from "@mui/material";

const CircularColor = () => {
  return (
    <Stack sx={{ color: "grey.500" }} spacing={2} direction="row">
      <CircularProgress color="inherit" />
    </Stack>
  );
};

export const BgCategoryList = ({
  setPageType,
  setSelectedCategory,
  BgData,
  BgLoading,
}) => {
  if (BgLoading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="600"
      >
        <CircularColor />
      </Box>
    );

  const preview = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setPageType("background");
    localStorage.setItem("SelectedBgCategory", item.category);
    setSelectedCategory({
      id: item.id,
      category: item.category,
    });
  };
  return (
    <>
      <GlobalStyles
        styles={{
          "*::-webkit-scrollbar": {
            width: "0.6em",
          },
          "*::-webkit-scrollbar-track": {
            WebkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,.1)",
            outline: "1px solid slategrey",
          },
        }}
      />
      <ImageList sx={{ width: 1, height: 600 }} cols={4}>
        {BgData &&
          BgData.map((item, index) => (
            <Box
              sx={{
                "&:hover": {
                  cursor: "pointer",
                  "& .MuiImageListItemBar-root": {
                    backgroundColor: "rgb(133 124 124 / 50%)",
                  },
                },
              }}
              key={index}
            >
              <ImageListItem key={item.id} onClick={(e) => preview(e, item)}>
                <img
                  // srcSet={`${item.thumb_url}?w=248&fit=crop&auto=format&dpr=2 2x`}
                  src={`${item.thumb_url}?w=248&fit=crop&auto=format`}
                  alt={item.category}
                  loading="lazy"
                  style={{ height: "127px" }}
                />
                <ImageListItemBar
                  title={item.category}
                  // subtitle={item.category}
                  sx={{ transition: "0.3s" }}
                />
              </ImageListItem>

              <Box fontSize={12} textAlign={"center"}>
                {localStorage.getItem("subscriptionData") &&
                JSON.parse(localStorage.getItem("subscriptionData")).data
                  .length > 0
                  ? "Purchased"
                  : "Purchase"}
              </Box>
            </Box>
          ))}
      </ImageList>
    </>
  );
};
