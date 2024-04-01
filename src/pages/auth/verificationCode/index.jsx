import React, { useState } from "react";
import { Avatar, CssBaseline, Box, Container, Typography } from "@mui/material";
import PPCopyright from "@/components/PPCopyright";
import { motion } from "framer-motion";

import { MuiOtpInput } from "mui-one-time-password-input";
import backgroundImage from "@/assets/background.jpg";
import check from "@/assets/check.png";
import PPSnackbar from "@/components/PPSnackbar";

const VerificationCode = () => {
  const [otp, setOtp] = useState("");
  const [isSuccessed, setIsSuccessed] = useState(false);
  const [state, setState] = useState({
    email: "",
    password: "",
    snack_status: false,
    loading: false,
    action: 1,
    message: "",
  });
  const handleOtpChange = (newValue) => {
    setOtp(newValue);
  };

  const handleComplete = (finalValue) => {
    setIsSuccessed(true);
  };

  return (
    <div
      className="w-full h-full bg-white text-black flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`, // set image here
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <Container
        component="main"
        maxWidth="xs"
        className="w-full border border-solid border-gray-100 py-6 shadow-lg rounded-lg bg-white"
      >
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <VpnKeyIcon />
          </Avatar> */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width="70"
            height="70"
          >
            <path
              fill="#9c27b0"
              d="M469.599 141.887H42.401C19.021 141.887 0 160.908 0 184.288v143.425c0 23.38 19.021 42.401 42.401 42.401h427.198c23.38 0 42.401-19.021 42.401-42.401V184.288c0-23.38-19.021-42.401-42.401-42.401zM146.52 286.436c-16.809 0-30.436-13.626-30.436-30.436 0-16.809 13.626-30.436 30.436-30.436 16.81 0 30.437 13.626 30.437 30.436s-13.627 30.436-30.437 30.436zm109.331 0c-16.81 0-30.436-13.626-30.436-30.436 0-16.809 13.626-30.436 30.436-30.436 16.809 0 30.436 13.626 30.436 30.436s-13.627 30.436-30.436 30.436zm149.758-12.265H346.86c-10.036 0-18.172-8.136-18.172-18.172 0-10.036 8.136-18.172 18.172-18.172h58.749c10.036 0 18.172 8.136 18.172 18.172 0 10.036-8.136 18.172-18.172 18.172z"
            ></path>
          </svg>
          <Typography component="h1" variant="h5">
            Email Verification
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            {!isSuccessed ? (
              <MuiOtpInput
                length={6}
                display="flex"
                gap={1}
                autoFocus
                value={otp}
                onChange={handleOtpChange}
                onComplete={handleComplete}
                className="w-[200px] sm:w-[300px]"
              />
            ) : (
              <motion.div
                animate={{ scale: 1 }}
                transition={{
                  duration: 1,
                }}
                initial={{ scale: 0.1 }}
              >
                <img src={check} className="w-20 h-20" alt="" />
              </motion.div>
            )}
          </Box>
        </Box>
        <PPCopyright sx={{ mt: 8 }} />
      </Container>
      <PPSnackbar
        isOpen={state.snack_status}
        message={state.message}
        severity={state.action === 1 ? "success" : "warning"}
        onClose={() => setState({ ...state, snack_status: false })}
      />
    </div>
  );
};

export default VerificationCode;
