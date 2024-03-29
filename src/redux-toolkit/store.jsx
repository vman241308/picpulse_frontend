import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/User";

const reducer = {
  user: userReducer,
};

export const store = configureStore({
  reducer: reducer,
  devTools: true,
});
