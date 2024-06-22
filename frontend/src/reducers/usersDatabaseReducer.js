import { createSlice } from "@reduxjs/toolkit";
import userService from "../services/users";

const usersDatabaseSlice = createSlice({
  name: "usersDatabase",
  initialState: [],
  reducers: {
    setUsers(state, action) {
      return action.payload.sort((a, b) => b.blogs.length - a.blogs.length);
    },
  },
});

export const { setUsers } = usersDatabaseSlice.actions;

export const initializeUsersDatabase = () => {
  return async (dispatch) => {
    const users = await userService.getAll();
    dispatch(setUsers(users));
  };
};

export default usersDatabaseSlice.reducer;
