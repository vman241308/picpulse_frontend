import { useState } from "react";

const screenRatio = ["16:9", "1:1", "4:3"];

const EditBar = () => {
  const [ratio, setRatio] = useState(0);
  return (
    <>
      <div className="absolute bottom-0 flex flex-row w-full h-32 bg-black">
        <div className="w-1/3 h-full px-2 flex flex-row gap-2 items-center justify-center">
          <img
            alt="magic_bg_ico"
            src="src/assets/icons/magic_bg_ico.png"
            className="w-28 h-28 p-1 hover:bg-slate-900 cursor-pointer rounded-lg"
          />
          <img
            alt="scissor_ico"
            src="src/assets/icons/scissor_ico.png"
            className="w-28 h-28 p-1 hover:bg-slate-900 cursor-pointer rounded-lg"
          />
          <img
            alt="background_ico"
            src="src/assets/icons/background_ico.png"
            className="w-28 h-28 p-1 hover:bg-slate-900 cursor-pointer rounded-lg"
          />
        </div>
        <div className="w-1/3 h-full flex items-end justify-center pb-4 relative">
          <div className="flex flex-row gap-3">
            {screenRatio.map((value, index) => (
              <div
                key={index}
                className={`text-white hover:bg-sky-500 w-28 h-9 items-center flex justify-center cursor-pointer rounded-sm ${
                  ratio == index ? "bg-sky-600" : "bg-black"
                }`}
                onClick={() => {
                  setRatio(index);
                }}
              >
                {value}
              </div>
            ))}
          </div>
          <div className="bg-red-600 absolute top-[-50px] rounded-full w-24 h-24 hover:bg-red-500 cursor-pointer"></div>
        </div>
        <div className="w-1/3 h-full px-2 flex flex-row items-center justify-center gap-20">
          <img
            alt="drop_ico"
            src="src/assets/icons/drop_ico.png"
            className="w-28 h-28 p-1 hover:bg-slate-900 cursor-pointer rounded-lg"
          />
          <img
            alt="magic_fg_ico"
            src="src/assets/icons/magic_fg_ico.png"
            className="w-28 h-28 p-1 hover:bg-slate-900 cursor-pointer rounded-lg"
          />
        </div>
      </div>
    </>
  );
};

export default EditBar;
