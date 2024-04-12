import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import FolderIcon from "@mui/icons-material/Folder";
import { MusicDialog } from "./MusicDialog.jsx";

const Header = ({ audio, setAudio }) => {
  const [open, setOpen] = useState(false);
  const [openMusicDialog, setOpenMusicDialog] = useState(false);
  const [scroll, setScroll] = useState("paper");
  const [MusicCategoryList, setMusicCategoryList] = useState([]);
  const [selectedMusicCategory, setSelectedMusicCategory] = useState({});

  const handleListItemClick = (item) => {
    setOpen(false);
    setSelectedMusicCategory(item);
    setOpenMusicDialog(true);
  };

  useEffect(() => {
    fetchMusicCategory();
  }, []);

  const fetchMusicCategory = async () => {
    const result = await axios(
      "http://18.218.107.206/greenscreen/public/service.php?type=get_music_category"
    );
    setMusicCategoryList(result.data.data);
  };

  const handleClickOpen = (scrollType) => () => {
    setOpen(true);
    setScroll(scrollType);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseMusicDialog = () => {
    setOpenMusicDialog(false);
  };

  const handleSubscription = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const email = formJson.email;
    const response = await fetch(
      `http://18.218.107.206/greenscreen/public/service.php?type=check_email&email=${email}`
    );

    if (response.ok) {
      const data = await response.json();

      localStorage.setItem("subscriptionData", JSON.stringify(data));
    }

    handleClose();
  };

  return (
    <div className="flex flex-row justify-between w-full h-20 bg-slate-100">
      <div className="h-20 w-20 ml-[8%] p-1 cursor-pointer hover:brightness-110">
        <img alt="logo icon" src="src/assets/icons/logo.png" />
      </div>
      <div className="flex flex-row gap-2 pr-4">
        {/* <div className="w-20 h-20 p-1 rounded-lg cursor-pointer hover:brightness-110">
          <img
            alt="question mark icon"
            src="src/assets/icons/question_ico.png"
          />
        </div> */}
        <div
          className=" w-[70px] h-[70px] p-1 cursor-pointer hover:brightness-110"
          onClick={handleClickOpen("paper")}
        >
          <img alt="music icon" src="src/assets/icons/music_ico.png" />
        </div>
        {/* <div className="w-20 h-20 p-1 cursor-pointer hover:brightness-110">
          <img alt="library icon" src="src/assets/icons/library_ico.png " />
        </div>
        <div className="h-20 w-20 p-1.5 cursor-pointer hover:brightness-110">
          <img alt="settings icon" src="src/assets/icons/settings_ico.png" />
        </div> */}
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        PaperProps={{ style: { height: 800, width: 600 } }}
        disableEscapeKeyDown
      >
        <DialogTitle
          id="scroll-dialog-title"
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <span>COLLECTIONS</span>
          <Box
            component="span"
            fontSize="16px"
            color={"#1976d2"}
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Box
              component={"div"}
              onClick={() => localStorage.clear()}
              style={{ cursor: "pointer" }}
            >
              {localStorage.getItem("subscriptionData") &&
              JSON.parse(localStorage.getItem("subscriptionData")).data.length >
                0
                ? "Restore Purchases"
                : ""}
            </Box>
            <IconButton aria-label="delete" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
            <Box sx={{ flexGrow: 1 }}>
              <div className="font-sans text-lg min-w-52">
                <div className="flex flex-col w-full text-left">
                  <Box component="span">Musics</Box>
                  <TextField
                    label={"search"}
                    margin="dense"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon size="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box
                    sx={{
                      width: "100%",
                      bgcolor: "background.paper",
                      height: "620px",
                      overflow: "auto",
                    }}
                  >
                    {MusicCategoryList?.map((item, index) => {
                      return (
                        <List
                          component="nav"
                          aria-label="main mailbox folders"
                          key={index}
                          disablePadding
                        >
                          <ListItemButton
                            onClick={() => handleListItemClick(item)}
                          >
                            <ListItemIcon>
                              <FolderIcon />
                            </ListItemIcon>
                            <ListItemText primary={item.category} />
                          </ListItemButton>
                        </List>
                      );
                    })}
                  </Box>
                </div>
              </div>
            </Box>
          </DialogContentText>
        </DialogContent>
      </Dialog>
      <MusicDialog
        audio={audio}
        setAudio={setAudio}
        setOpen={setOpen}
        openMusicDialog={openMusicDialog}
        selectedMusicCategory={selectedMusicCategory}
        handleCloseMusicDialog={handleCloseMusicDialog}
        scroll={scroll}
      />
    </div>
  );
};
export default Header;
