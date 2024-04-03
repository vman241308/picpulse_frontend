import Logo from "/logo48.png";
// import "./style.css";

function Popup() {
  return (
    <>
      <div>
        <a target="_blank">
          <img src={Logo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Picpulse</h1>
    </>
  );
}

export default Popup;
