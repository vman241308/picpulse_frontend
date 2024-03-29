import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  initialState: "initialState",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setInitialState: (state, action) => {
      return { ...state, initialState: action.payload };
    },
  },
});

const { reducer, actions } = userSlice;

export const { setInitialState } = actions;
export default reducer;
