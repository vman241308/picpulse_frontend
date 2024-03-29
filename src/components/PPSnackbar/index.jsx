import { Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";

export default function PPSnackbar({ isOpen, message, severity, onClose }) {
  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
