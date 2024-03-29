import { useState } from "react";
import {
  Avatar,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Snackbar,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoadingButton from "@mui/lab/LoadingButton";
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

export default function SignIn() {
  const [state, setState] = useState({
    email: "",
    password: "",
    snack_status: false,
    loading: false,
    action: 1,
    message: "",
  });
  const [validateEmail, setValidateEmail] = useState({
    flag: 0,
    text: "",
  });
  const [validatePassword, setValidatePassword] = useState({
    flag: 0,
    text: "",
  });

  const handleInputchange = (e) => {
    const { id, value } = e.target;

    switch (e.target.id) {
      case "email":
        setValidateEmail({
          flag: 0,
          text: "",
        });
        break;
      case "password":
        setValidatePassword({
          flag: 0,
          text: "",
        });
        break;
      default:
        break;
    }
    setState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (state.email == "" || state.password == "") {
      if (state.email == "") {
        setValidateEmail({
          flag: 1,
          text: "Please enter your Email.",
        });
      }
      if (state.password == "") {
        setValidatePassword({
          flag: 1,
          text: "Please enter your Password.",
        });
      }
    } else {
      if (validateEmails(state.email)) {
        setState({
          ...state,
          loading: true,
        });

        let data = {
          email: state.email,
          password: state.password,
        };
        console.log("form data for signin:", data);
      } else {
        setValidateEmail({
          flag: 1,
          text: "Incorrect Email!",
        });
        setState({
          ...state,
          loading: false,
          snack_status: true,
          action: 0,
          message: "The email or password incorrect!",
        });
      }
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
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
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={state.email}
              error={validateEmail.flag == 0 ? false : true}
              helperText={validateEmail.text}
              onChange={handleInputchange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={state.password}
              error={validatePassword.flag == 0 ? false : true}
              helperText={validatePassword.text}
              onChange={handleInputchange}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              loading={state.loading}
              onClick={handleSubmit}
            >
              Sign In
            </LoadingButton>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8 }} />
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
