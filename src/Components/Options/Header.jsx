import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const Header = () => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
    <div className="h-20 bg-slate-100 flex flex-row justify-between w-full">
      <div className="h-20 w-20 ml-[8%] p-1 cursor-pointer hover:brightness-110">
        <img alt="logo icon" src="src/assets/icons/logo.png" />
      </div>
      <div className="flex flex-row pr-4 gap-2">
        <div className="h-20 w-20 p-1 cursor-pointer rounded-lg hover:brightness-110">
          <img
            alt="question mark icon"
            src="src/assets/icons/question_ico.png"
          />
        </div>
        <div className="h-16 w-16 p-1 cursor-pointer hover:brightness-110">
          <img alt="music icon" src="src/assets/icons/music_ico.png" />
        </div>
        <div className="h-20 w-20 p-1 cursor-pointer hover:brightness-110">
          <img alt="library icon" src="src/assets/icons/library_ico.png " />
        </div>
        <div className="h-20 w-20 p-1.5 cursor-pointer hover:brightness-110">
          <img alt="settings icon" src="src/assets/icons/settings_ico.png" />
        </div>
      </div>
    </div>
  );
};
export default Header;
