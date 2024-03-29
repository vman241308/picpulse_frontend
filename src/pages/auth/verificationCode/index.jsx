import React, { useState } from "react";
import { motion } from "framer-motion";

import { Box } from "@mui/material";

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
    <>
      <div
        className="w-full h-full bg-white text-black flex items-center justify-center flex-col gap-5 font-sans"
        style={{
          backgroundImage: `url(${backgroundImage})`, // set image here
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p className="text-3xl">E-mail verification</p>
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
      </div>
    </>
  );
};

export default VerificationCode;
