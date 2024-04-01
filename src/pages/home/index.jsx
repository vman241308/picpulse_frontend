import { useState } from "react";
import "../../App.css";
import backgroundImage from "@/assets/background.jpg";

const Home = () => {
  const [count, setCount] = useState(0);

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`, // set image here
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
      className="w-[60%] h-[50%] top-[calc(30vh-100px)] absolute"
    ></div>
  );
};

export default Home;
