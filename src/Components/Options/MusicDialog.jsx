import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
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
import axios from "axios";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from "@mui/icons-material/Delete";



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

export const MusicDialog = ({
  setOpen,
  openMusicDialog,
  selectedMusicCategory,
  handleCloseMusicDialog,
  scroll,
}) => {
  const [value, setValue] = useState(0);
  const [data, setData] = useState([]);
  const descriptionElementRef = React.useRef(null);
  const theme = useTheme();
  const [selectedMusic, setSelectedMusic] = useState(localStorage.getItem('SelectedMusic'))

  useEffect(() => {
    if (openMusicDialog) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [openMusicDialog]);

  useEffect(() => {
    fetchMusicByCategory();
  }, [selectedMusicCategory]);

  useEffect(() => {
    setSelectedMusic(selectedMusic)
  }, [selectedMusic])

  const fetchMusicByCategory = async () => {
    // setLoading(true)
    var result = [];
    var musicData = [];
    if (localStorage.getItem("SelectedMusicCategory") === JSON.stringify(selectedMusicCategory)) {
      result = JSON.parse(localStorage.getItem("SelectedMusicData"));
      setData(result);
    } else {
      
      result = await axios(
        `http://18.218.107.206/greenscreen/public/service.php?type=get_music_assets&category_id=${selectedMusicCategory.id}`
      );
      musicData = result.data.data;
      setData(musicData);
      localStorage.setItem("SelectedMusicCategory", JSON.stringify(selectedMusicCategory));
      localStorage.setItem("SelectedMusicCategoryData", JSON.stringify(musicData));
    }
    // setLoading(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleChangeIndex = (index) => setValue(index);

  const handleToggle = (value) => () => {
    console.log('valule::', value)
  };

  const download = async (item, index) => {
    localStorage.setItem('SelectedMusic', JSON.stringify(item))
    // setLinerIndex(index);
    // setIsDownloading(true);
    // setMusicFile({ url: item.s3_url, type: "video" });
    // setDownloadedData((prevDownloaded) => [...prevDownloaded, item]);
    // setIsDownloading(false);
  };

  return (
    <Dialog
      open={openMusicDialog}
      onClose={handleCloseMusicDialog}
      scroll={scroll}
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
              handleCloseMusicDialog()
              setOpen(true)
              // localStorage.setItem("SelectedForegroundCategoryData", "")
              // localStorage.setItem('SelectedFgCategory', "")
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          Collections
        </Box>
        <IconButton aria-label="delete" onClick={handleCloseMusicDialog}>
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
                {selectedMusicCategory.category}
              </Typography>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
            </Toolbar>
          </Box>
          <Box sx={{ bgcolor: "background.paper", padding:'0' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="secondary"
              textColor="inherit"
              variant="fullWidth"
              aria-label="full width tabs example"
            >
              <Tab label="Preview" {...a11yProps(0)} />
            </Tabs>
            <SwipeableViews
              axis={theme.direction === "rtl" ? "x-reverse" : "x"}
              index={value}
              onChangeIndex={handleChangeIndex}
            >
              <TabPanel value={value} index={0} dir={theme.direction}>
                <Box height={530} disablePadding>
                    <List sx={{ width: '100%', bgcolor: 'background.paper'}} disablePadding>
                      {data?.map((item, index) => {
                        const labelId = `checkbox-list-label-${index}`;
                        return (
                          <ListItem
                            key={index}
                            secondaryAction={
                              <div>
                                <IconButton onClick={() => {download(item, index);}} edge="end" aria-label="CloudDownLoadIcon" style={{margin:'10px'}}>
                                  <CloudDownloadIcon />
                                </IconButton>
                              </div>
                            }
                            disablePadding
                          >
                            <ListItemButton onClick={handleToggle(value)} dense>
                              <ListItemText id={labelId} primary={`${index+1} - ${item.title}`} />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                </Box>
              </TabPanel>
              
            </SwipeableViews>
          </Box>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};
