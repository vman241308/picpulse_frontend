const TopBar = () => {
  return (
    <>
      <div className="absolute top-0 h-20 bg-slate-100 flex flex-row justify-between w-full">
        <div className="h-20 w-20 ml-[8%] p-1 cursor-pointer">
          <img alt="logo icon" src="src/assets/icons/logo.png" />
        </div>
        <div className="flex flex-row pr-4 gap-2">
          <div className="h-20 w-20 p-1 cursor-pointer">
            <img
              alt="question mark icon"
              src="src/assets/icons/question_ico.png"
            />
          </div>
          <div className="h-16 w-16 p-1 cursor-pointer">
            <img alt="music icon" src="src/assets/icons/music_ico.png" />
          </div>
          <div className="h-20 w-20 p-1 cursor-pointer">
            <img alt="library icon" src="src/assets/icons/library_ico.png" />
          </div>
          <div className="h-20 w-20 p-1.5 cursor-pointer">
            <img alt="settings icon" src="src/assets/icons/settings_ico.png" />
          </div>
        </div>
      </div>
    </>
  );
};

export default TopBar;
