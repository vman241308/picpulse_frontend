import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import PPSnackbar from "@/components/PPSnackbar";
import PPCopyright from "@/components/PPCopyright";

import { validateEmails } from "@/utils/functions";
import backgroundImage from "@/assets/background.jpg";

const ForgotPwd = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    email: "",
    snack_status: false,
    loading: false,
    action: "success",
    message: "",
  });
  const [isSubmit, setIsSubmit] = useState(false);

  const handleInputchange = (e) => {
    const { id, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSubmit = (event) => {
    setIsSubmit(true);
    event.preventDefault();
    if (state.email != "" && validateEmails(state.email)) {
      console.log("next step to get coode!");
      setState((prev) => ({
        ...prev,
        loading: true,
      }));
    }
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
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <VpnKeyIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Forgot Password
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <Typography component="h1" style={{ textAlign: "start" }}>
              Lost your password? Please enter your email address. You will
              receive a code to create a new password via email.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={state.email}
              error={
                (state.email == "" && isSubmit) ||
                (!validateEmails(state.email) && state.email != "")
              }
              helperText={
                state.email == "" && isSubmit
                  ? "Please enter your email."
                  : !validateEmails(state.email) && state.email != ""
                  ? "Please enter the correct email."
                  : null
              }
              onChange={handleInputchange}
            />
            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              loading={state.loading}
              onClick={handleSubmit}
            >
              Reset Password
            </LoadingButton>
            <Grid container>
              <Grid item xs>
                <Link href="/signin" variant="body2">
                  Remember your password?
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <PPCopyright sx={{ mt: 8 }} />
      </Container>
      <PPSnackbar
        isOpen={state.snack_status}
        message={state.message}
        severity={state.action}
        onClose={() => setState({ ...state, snack_status: false })}
      />
    </div>
  );
};

export default ForgotPwd;
