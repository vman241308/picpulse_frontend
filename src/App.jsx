import React from "react";
import { useRoutes } from "react-router-dom";
import Routes from "./Routes";
import "./App.css";

function App() {
  const pages = useRoutes(Routes);
  return <div>{pages}</div>;
}

export default App;
