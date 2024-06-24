import React, { useState } from "react";
import { DropzoneArea } from "material-ui-dropzone";
import { Typography, Paper } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";

export function DragDropBackground({ setVideoFile }) {
  const onBackgroundDrop = (acceptedFiles) => {
    if (
      acceptedFiles &&
      acceptedFiles[0] &&
      (acceptedFiles[0].type.startsWith("video/") ||
        acceptedFiles[0].type.startsWith("image/"))
    ) {
      const videoUrl = URL.createObjectURL(acceptedFiles[0]);
      if (acceptedFiles[0].type.startsWith("image/")) {
        setVideoFile({ url: videoUrl, type: "image" });
      } else {
        setVideoFile({ url: videoUrl, type: "video" });
      }
    } else {
      console.error("Please upload a valid video file.");
    }
  };

  return (
    <div className="p-2 items-center justify-center bg-blue-400">
      <DropzoneArea
        acceptedFiles={["video/*", "image/*"]}
        // dropzoneText={
        //   <Typography variant="h6" style={{ marginBottom: "20px" }}>
        //     Drag 'n' drop a background video here, or click to select
        //   </Typography>
        // }
        Icon={CloudUploadIcon}
        showAlerts={["error"]} // Only show error alerts
        onChange={onBackgroundDrop}
        dropzoneClass="dropzone-style"
        maxFileSize={500000000} // Example: 500MB limit
        filesLimit={1} // Limit number of files
        showPreviewsInDropzone={false} // Do not show file previews inside dropzone
        useChipsForPreview // Use chips to show file previews below dropzone
        previewGridProps={{ container: { spacing: 1, direction: "row" } }}
        previewChipProps={{ classes: { root: "previewChip" } }}
        previewText="Selected video:"
      />
    </div>
  );
}

export function DragDropOverlay({ setOverlays }) {
  const [addedOverlays, setAddedOverlays] = useState([]);
  const onOverlayDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    //only get name of file in array
    const overlaysFileNames = acceptedFiles.map((file) => file.name);
    //filter Out Already Added Overlays
    const uniqueOverlays = overlaysFileNames.filter(
      (overlay) => !addedOverlays.includes(overlay)
    );
    let newOverlayURLs = [];
    acceptedFiles.forEach((file) => {
      if (uniqueOverlays.includes(file.name)) {
        newOverlayURLs.push(URL.createObjectURL(file));
      }
    });
    setOverlays((prevOverlays) => [...prevOverlays, ...newOverlayURLs]);
    setAddedOverlays((prevAddedOverlays) => [
      ...prevAddedOverlays,
      ...uniqueOverlays,
    ]);
  };

  return (
    <div className="p-2 items-center justify-center bg-blue-400">
      <DropzoneArea
        acceptedFiles={["image/*"]}
        // dropzoneText={
        //   <Typography
        //     variant="h6"
        //     style={{
        //       marginLeft: "20px",
        //       marginTop: "40px",
        //       marginRight: "20px",
        //     }}
        //   >
        //     Drag 'n' drop overlay images here, or click to select images
        //   </Typography>
        // }
        Icon={ImageIcon}
        showAlerts={["error"]} // Only show error alerts
        onChange={onOverlayDrop}
        dropzoneClass="overlay-dropzone-style"
        maxFileSize={400000000} // Example: 100MB limit
        filesLimit={10} // Adjust based on how many overlays you want to allow
        showPreviewsInDropzone={false} // Do not show file previews inside dropzone
        useChipsForPreview // Use chips to show file previews below dropzone
        previewGridProps={{ container: { spacing: 1, direction: "row" } }}
        previewChipProps={{ classes: { root: "previewChip" } }}
        previewText="Selected overlays:"
      />
    </div>
  );
}
