import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    message: null,
    status: false,
  },
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

export const { addedMessage } = notificationSlice.actions;
export default notificationSlice.reducer;
