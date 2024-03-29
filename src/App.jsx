import { useRoutes } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";

import { Provider } from "react-redux";
import Routes from "./Routes";
import { store } from "./redux-toolkit/store";

function App() {
  const pages = useRoutes(Routes);
  return (
    <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {pages}
      </LocalizationProvider>
    </Provider>
  );
}

export default App;
