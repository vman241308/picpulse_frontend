import MainLyt from "./layouts";
import Error404 from "./pages/error/404";
import Home from "./pages/home";
import SignIn from "./pages/auth/signIn";
import SignUp from "./pages/auth/signUp";
import VerificationCode from "./pages/auth/verificationCode";

const Routes = [
  {
    path: "/",
    element: <MainLyt />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
  {
    path: "signin",
    element: <SignIn />,
  },
  {
    path: "signup",
    element: <SignUp />,
  },
  {
    path: "verification",
    element: <VerificationCode />,
  },
  {
    path: "*",
    element: <Error404 />,
  },
];

export default Routes;
