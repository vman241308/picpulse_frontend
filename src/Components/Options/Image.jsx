import React, { useRef, useEffect } from "react";
import Moveable from "react-moveable";

let prevWidth = 0;
let prevHeight = 0;

function Image({
  image,
  index,
  scaleX,
  scaleY,
  handleMovement,
  handleResize,
  removeOverlay,
}) {
  const targetRef = useRef(null);

  const rotationExtractAndRound = (translate) => {
    const match = translate.match(/rotate\((.*?)deg\)/);
    if (match && match[1]) {
      const number = parseFloat(match[1]);
      return number.toFixed(3);
    }
    return null; // or any default value you prefer
  };

  const handleNewUserInteraction = async (e) => {
    const targetRect = targetRef.current.getBoundingClientRect();
    const parentRect = document
      .querySelector(".video-js")
      .getBoundingClientRect();

    let rotation = rotationExtractAndRound(e.transform)
      ? rotationExtractAndRound(e.transform)
      : 0;

    let finalX = (targetRect.left - parentRect.left) * scaleX;
    let finalY = (targetRect.top - parentRect.top) * scaleY;

    handleMovement(
      image,
      finalX,
      finalY,
      (e.width || prevWidth) * scaleX,
      (e.height || prevHeight) * scaleY,
      rotation
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "0px",
      }}
      className={`draggable-${index}`}
      id={`draggable${index}`}
    >
      <img
        className="target"
        ref={targetRef}
        src={image}
        onDoubleClick={() => {
          removeOverlay(image);
        }}
      />
      <Moveable
        target={targetRef}
        draggable={true}
        resizable={true}
        originDraggable={true}
        rotatable={true}
        throttleDrag={1}
        edgeDraggable={false}
        startDragRotate={0}
        throttleDragRotate={0}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        onDrag={(e) => {
          e.target.style.transform = e.transform;
          handleNewUserInteraction(e);
          prevHeight = e.height;
          prevWidth = e.width;
        }}
        onResize={(e) => {
          e.target.style.width = `${e.width}px`;
          e.target.style.height = `${e.height}px`;
          e.target.style.transform = e.drag.transform;
          handleNewUserInteraction(e);
          prevHeight = e.height;
          prevWidth = e.width;
        }}
        onRotate={(e) => {
          e.target.style.transform = e.drag.transform;
          handleNewUserInteraction(e);
        }}
      />
    </div>
  );
}

export default Image;
