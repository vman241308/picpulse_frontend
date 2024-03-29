import React, { useState } from "react";
import { CssBaseline, Box, Container, Typography } from "@mui/material";
import PPCopyright from "@/components/PPCopyright";
import { motion } from "framer-motion";

import { MuiOtpInput } from "mui-one-time-password-input";
import backgroundImage from "@/assets/background.jpeg";
import check from "@/assets/check.png";

const VerificationCode = () => {
  const [otp, setOtp] = useState("");
  const [isSuccessed, setIsSuccessed] = useState(false);

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
      <div
        component="main"
        className="w-full md:w-2/3 lg:w-1/2 xl:w-1/3 border border-solid border-gray-100 py-6 shadow-lg rounded-lg bg-white"
      >
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          className="flex gap-5"
        >
          <Typography component="h1" variant="h5">
            E-mail verification
          </Typography>
          {!isSuccessed ? (
            <p className="text-xl">
              We've e-mailed your a 6 digit code. Please check your e-mail.
            </p>
          ) : (
            <p className="text-xl">Successfully verified.</p>
          )}

          {!isSuccessed ? (
            <MuiOtpInput
              length={6}
              display="flex"
              gap={3}
              autoFocus
              value={otp}
              onChange={handleOtpChange}
              onComplete={handleComplete}
              className="w-[450px]"
            />
          ) : (
            <motion.div
              animate={{ scale: 1 }}
              transition={{
                duration: 1,
              }}
              initial={{ scale: 0.1 }}
            >
              <img src={check} alt="" />
            </motion.div>
          )}
        </Box>
        <PPCopyright sx={{ mt: 3 }} />
      </div>
    </div>
  );
};

export default VerificationCode;
