import React, { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

import { BgCategoryList } from "./BgCategoryList.jsx";
import { FgCategoryList } from "./FgCategoryList.jsx";

export const MainDialog = ({
  open,
  handleClose,
  setPageType,
  scroll,
  setSelectedCategory,
  groundType,
}) => {
  const descriptionElementRef = useRef(null);
  const [BgData, setBgData] = useState([]);
  const [FgData, setFgData] = useState([]);
  const [BgLoading, setBgLoading] = useState(true);
  const [FgLoading, setFgLoading] = useState(true);

  const fetchBgData = async () => {
    const result = await axios(
      "http://18.218.107.206/greenscreen/public/service.php?type=get_category"
    );
    setBgData(result?.data.data);
    setBgLoading(false);
  };

  const fetchFgData = async () => {
    const result = await axios(
      "http://18.218.107.206/greenscreen/public/service.php?type=get_foreground_category"
    );
    setFgData(result.data.data);
    setFgLoading(false);
  };

  useEffect(() => {
    fetchBgData();
    fetchFgData()
  }, []);

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
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
            JSON.parse(localStorage.getItem("subscriptionData")).data.length > 0
              ? "Restore Purchases"
              : ""}
          </Box>
          <IconButton aria-label="delete" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="scroll-dialog-description"
          ref={descriptionElementRef}
          tabIndex={-1}
        >
          <Box sx={{ flexGrow: 1 }}>
            <div className="min-w-52 font-sans text-lg">
              {groundType == "bg" ? (
                <div className="flex flex-col text-left w-full">
                  <Box component="span">Backgrounds</Box>
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
                  <BgCategoryList
                    setPageType={setPageType}
                    setSelectedCategory={setSelectedCategory}
                    BgData={BgData}
                    BgLoading={BgLoading}
                  />
                </div>
              ) : (
                <div className="flex flex-col text-left w-full">
                  <Box component="span">Foregrounds</Box>
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
                  <FgCategoryList
                    setPageType={setPageType}
                    setSelectedCategory={setSelectedCategory}
                    FgData={FgData}
                    FgLoading={FgLoading}
                  />
                </div>
              )}
            </div>
          </Box>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};
