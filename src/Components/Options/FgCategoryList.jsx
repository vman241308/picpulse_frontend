import React, { useEffect, useState, useRef, useCallback } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

const CircularColor = () => (
  <Stack sx={{ color: "grey.500" }} spacing={2} direction="row">
    <CircularProgress color="inherit" />
  </Stack>
);

export const FgCategoryList = ({
  setPageType,
  setSelectedCategory,
  FgData,
  FgLoading,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const loader = useRef();

  const lastItemElementRef = useCallback(
    (node) => {
      if (loader.current) loader.current.disconnect();

      loader.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !FgLoading) {
          setCurrentPage((prev) => prev + 1);
        }
      });

      if (node) loader.current.observe(node);
    },
    [FgLoading]
  );

  useEffect(() => {
    const observer = loader.current;
    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  if (FgLoading)
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
    setPageType("foreground");
    localStorage.setItem('SelectedFgCategory', item.category)
    setSelectedCategory({
      id: item.id,
      category: item.category,
    });
  };

  return (
    <ImageList sx={{ width: 1, height: 600 }} cols={4}>
      {FgData?.slice(0, currentPage * itemsPerPage).map((item, index, self) => (
        <Box
          key={index}
          sx={{
            "&:hover": {
              cursor: "pointer",
              "& .MuiImageListItemBar-root": {
                backgroundColor: "rgb(133 124 124 / 50%)",
              },
            },
          }}
          ref={self.length === index + 1 ? lastItemElementRef : null}
        >
          <ImageListItem key={item.id} onClick={(e) => preview(e, item)}>
            <img
              // srcSet={`${item.thumb_url}?w=248&fit=crop&auto=format&dpr=2 2x`}
              src={`${item.thumb_url}?w=248&fit=crop&auto=format`}
              alt={item.category}
              FgLoading="lazy"
              style={{ height: "127px" }}
            />
            <ImageListItemBar
              title={item.category}
              sx={{ transition: "0.3s" }}
            />
          </ImageListItem>
          <Box fontSize={12} textAlign={"center"}>
            {localStorage.getItem("subscriptionData") &&
            JSON.parse(localStorage.getItem("subscriptionData")).data.length > 0
              ? "Purchased"
              : "Purchase"}
          </Box>
        </Box>
      ))}
    </ImageList>
  );
};
