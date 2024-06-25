import MovieIcon from "@mui/icons-material/Movie";
import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SearchIcon from "@mui/icons-material/Search";

import InputBase from "@mui/material/InputBase";
import { styled, alpha } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useTheme } from "@mui/material/styles";

import { BgCategoryList } from "./BgCategoryList.jsx";
import { FgCategoryList } from "./FgCategoryList.jsx";

import { BgVideoPreview } from "./BgVideoPreview.jsx";
import { BgPhotoPreview } from "./BgPhotoPreview.jsx";
import { FgPreview } from "./FgPreview.jsx";
import { BgDownloaded } from "./BgDownloaded.jsx";
import { FgDownloaded } from "./FgDownloaded.jsx";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

const a11yProps = (index) => {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
};

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

export const BackgroundDialog = ({
  open,
  handleClose,
  setPageType,
  setVideoFile,
  downloadedData,
  setDownloadedData,
  selectedCategory,
}) => {
  const [value, setValue] = useState(0);

  const descriptionElementRef = React.useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleChangeIndex = (index) => setValue(index);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll={"paper"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      PaperProps={{ style: { height: 800, width: 600 } }}
    >
      <DialogTitle
        id="scroll-dialog-title"
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Box display={"flex"} alignItems={"center"}>
          <IconButton
            aria-label="delete"
            onClick={() => {
              setPageType("main");
              localStorage.setItem("SelectedBackgroundCategoryData", "");
              localStorage.setItem("SelectedBgCategory", "");
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          Collections
        </Box>
        <IconButton aria-label="delete" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="scroll-dialog-description"
          ref={descriptionElementRef}
          tabIndex={-1}
          textAlign={"left"}
          fontSize={18}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Toolbar style={{ padding: "0px" }}>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
              >
                {localStorage.getItem("SelectedBgCategory")}
              </Typography>
              {/* <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ "aria-label": "search" }}
                />
              </Search> */}
            </Toolbar>
          </Box>
          <Box sx={{ bgcolor: "background.paper" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="secondary"
              textColor="inherit"
              variant="fullWidth"
              aria-label="full width tabs example"
            >
              <Tab label="Video Preview" {...a11yProps(0)} />
              <Tab label="Photo Preview" {...a11yProps(1)} />
              <Tab label="Downloadeded" {...a11yProps(2)} />
            </Tabs>
            <SwipeableViews
              axis={theme.direction === "rtl" ? "x-reverse" : "x"}
              index={value}
              onChangeIndex={handleChangeIndex}
            >
              <TabPanel value={value} index={0} dir={theme.direction}>
                <Box height={600}>
                  <Grid container spacing={1}>
                    <BgVideoPreview
                      setVideoFile={setVideoFile}
                      setDownloadedData={setDownloadedData}
                      selectedCategory={selectedCategory}
                      setPageType={setPageType}
                    />
                  </Grid>
                </Box>
              </TabPanel>
              <TabPanel value={value} index={1} dir={theme.direction}>
                <Box height={600}>
                  <Grid container spacing={1}>
                    <BgPhotoPreview
                      setVideoFile={setVideoFile}
                      setDownloadedData={setDownloadedData}
                      selectedCategory={selectedCategory}
                    />
                  </Grid>
                </Box>
              </TabPanel>
              <TabPanel value={value} index={2} dir={theme.direction}>
                <Box height={600}>
                  <Grid container spacing={1}>
                    <BgDownloaded
                      downloadedData={downloadedData}
                      setDownloadedData={setDownloadedData}
                      selectedCategory={selectedCategory}
                    />
                  </Grid>
                </Box>
              </TabPanel>
            </SwipeableViews>
          </Box>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};
