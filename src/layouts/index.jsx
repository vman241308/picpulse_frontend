import { Outlet } from "react-router-dom";

import NavBar from "./NavBar";
import SideBar from "./SideBar";
import TopBar from "./TopBar";
import EditBar from "./EditBar";

const MainLyt = () => {
  return (
    <>
      {/* <NavBar /> */}
      {/* <SideBar /> */}
      <TopBar />
      <EditBar />
      <Outlet />
    </>
  );
};

export default MainLyt;
