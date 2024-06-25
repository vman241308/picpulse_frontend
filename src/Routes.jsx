// import MainLyt from "./layouts";
// import Error404 from "./pages/error/404";
import React from "react";
import Editor from "./Pages/Editor";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import ConfirmCode from "./Pages/ConfirmCode";

const Routes = [
  {
    path: "/",
    element: <Editor />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/confirmcode",
    element: <ConfirmCode />,
  },
];

export default Routes;
