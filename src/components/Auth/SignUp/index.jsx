import { useState } from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Snackbar,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import LoadingButton from "@mui/lab/LoadingButton";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { validateEmails } from "../../../utils/functions";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="#">
        PicPulse Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function SignUpSide() {
  const [state, setState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: null,
    password: "",
    confirm_pwd: "",
    loading: false,
    action: 1,
    message: "",
    snack_status: false,
  });
  const [isPressed, setIsPressed] = useState(false);

  const handleInputchange = (e) => {
    const { id, value } = e.target;
    setState((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (event) => {
    setIsPressed(true);
    event.preventDefault();

    if (
      state.firstName != "" &&
      state.lastName != "" &&
      state.email != "" &&
      state.dob != null &&
      state.password != "" &&
      state.confirm_pwd != "" &&
      validateEmails(state.email)
    ) {
      setState({
        ...state,
        loading: true,
      });
      let data = {
        firstName: state.firstName,
        lastName: state.lastName,
        dob: state.dob,
        email: state.email,
        password: state.password,
        confirm_pwd: state.confirm_pwd,
      };
      console.log("uset data for signup", data);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container
        component="main"
        maxWidth="xs"
        className="w-full border border-solid border-gray-50 py-6 shadow-lg rounded-lg bg-white"
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
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  error={state.firstName == "" && isPressed}
                  helperText={
                    state.firstName == "" && isPressed
                      ? "Please enter your name."
                      : null
                  }
                  value={state.firstName}
                  onChange={handleInputchange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  error={state.lastName == "" && isPressed}
                  helperText={
                    state.lastName == "" && isPressed
                      ? "Please enter your name."
                      : null
                  }
                  value={state.lastName}
                  onChange={handleInputchange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  error={
                    (state.email == "" && isPressed) ||
                    (!validateEmails(state.email) && state.email != "")
                  }
                  helperText={
                    state.email == "" && isPressed
                      ? "Please enter your email."
                      : !validateEmails(state.email) && state.email != ""
                      ? "Please enter the correct email."
                      : null
                  }
                  value={state.email}
                  onChange={handleInputchange}
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  className="w-full"
                  label="Date of Birth *"
                  id="dob"
                  inputFormat="MM/dd/yyyy"
                  value={state.dob}
                  onChange={(val) => {
                    setState((prevState) => ({
                      ...prevState,
                      dob: val,
                    }));
                  }}
                  slotProps={{
                    textField: {
                      error: state.dob == null && isPressed,
                      helperText:
                        state.dob == null && isPressed
                          ? "Please enter your birthday."
                          : "",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  error={state.password == "" && isPressed}
                  helperText={
                    state.password == "" && isPressed
                      ? "Please enter your password."
                      : null
                  }
                  value={state.password}
                  onChange={handleInputchange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Confirm Password"
                  type="password"
                  id="confirm_pwd"
                  autoComplete="new-password"
                  error={
                    (state.confirm_pwd == "" && isPressed) ||
                    state.password != state.confirm_pwd
                  }
                  helperText={
                    state.confirm_pwd == "" && isPressed
                      ? "Please enter the confirm password."
                      : state.password != state.confirm_pwd
                      ? "Please enter the same password."
                      : null
                  }
                  value={state.confirm_pwd}
                  onChange={handleInputchange}
                />
              </Grid>
            </Grid>
            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              loading={state.loading}
              onClick={handleSubmit}
            >
              Sign Up
            </LoadingButton>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/signin" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
      <Snackbar
        open={state.snack_status}
        autoHideDuration={3000}
        onClose={() => {
          setState({ ...state, snack_status: false });
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={state.action == 1 ? "success" : "warning"}
          sx={{ width: "100%" }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
