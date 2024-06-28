import React, { useRef, useEffect } from "react";
import Moveable from "react-moveable";
import axios from "axios";
import parseAPNG from "apng-js";

import EventBus from "../../utils/EventBus.jsx";

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
  overlayID,
  selectOverlay,
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
      // targetRect.width * scaleX,
      // targetRect.height * scaleY,
      targetRef.current.clientWidth * scaleX,
      targetRef.current.clientHeight * scaleY,
      rotation,
      index
    );
  };

  const handleMetadataLoaded = () => {
    const targetRect = targetRef.current.getBoundingClientRect();
    const parentRect = document
      .querySelector(".video-js")
      .getBoundingClientRect();

    let finalX = (targetRect.left - parentRect.left) * scaleX;
    let finalY = (targetRect.top - parentRect.top) * scaleY;

    handleMovement(
      image,
      finalX,
      finalY,
      targetRef.current.clientWidth * scaleX,
      targetRef.current.clientHeight * scaleY,
      0,
      index
    );
  };

  // useEffect(() => {
  //   let img = new window.Image();
  //   img.onload = () => {
  //     if (targetRef.current) {
  //       targetRef.current.style.backgroundImage = `url(${img.src})`;
  //     }
  //   };
  //   img.src = image;
  //   handleMetadataLoaded();
  // }, [image]);

  const getImageBuffer = async (url) => {
    return await fetch(url).then((response) => response.arrayBuffer());
  };

  const playPng = async (buffer, canvas) => {
    const apng = parseAPNG(buffer);
    const player = await apng.getPlayer(canvas.getContext("2d"));

    if (apng instanceof Error) {
      console.error("Failed to parse APNG:", apng.message);
      return;
    }

    player.numPlays = 0;

    const { width, height } = apng.frames[0];
    canvas.width = width;
    canvas.height = height;

    const scaleWidth = canvas.clientWidth / width;
    const scaleHeight = canvas.clientHeight / height;
    const scale = Math.min(scaleWidth, scaleHeight);

    const context = canvas.getContext("2d");
    context.scale(scale, scale);

    player.play();
    return player;
  };

  useEffect(() => {
    const canvas = targetRef.current;
    canvas.width = 640; // Set initial width
    canvas.height = 480; // Set initial height

    getImageBuffer(image).then(async (b) => {
      await playPng(b, targetRef.current);
    }, []);

    handleMetadataLoaded();
  }, [image]);

  return (
    <>
      {/* <div
        ref={targetRef}
        style={{
          position: "absolute",
          top: "0px",
          background: `url(${image}) no-repeat`,
          backgroundSize: "100% 100%",
          width: "640px",
          height: "480px",
        }}
        onDoubleClick={() => {
          removeOverlay(index, image);
        }}
      /> */}
      <canvas
        ref={targetRef}
        style={{
          position: "absolute",
          top: "0px",
          // width: "640px",
          // height: "480px",
        }}
        onDoubleClick={() => {
          removeOverlay(index, image);
        }}
      />
      <Moveable
        target={targetRef}
        draggable={true}
        scalable={true}
        rotatable={true}
        resizable={true}
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
        onClick={() => selectOverlay(overlayID)}
      />
    </>
  );
}

export default Image;
