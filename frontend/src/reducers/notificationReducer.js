import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  message: null,
  status: false,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addedMessage(state, action) {
      return action.payload;
    },
  },
});

export const setNotification = (messageInfo, time = 2500) => {
  return (dispatch) => {
    dispatch(addedMessage(messageInfo));
    setTimeout(() => {
      dispatch(addedMessage({ message: null, status: false }));
    }, time);
  };
};

export const { addedVote, addedMessage } = notificationSlice.actions;
export default notificationSlice.reducer;
