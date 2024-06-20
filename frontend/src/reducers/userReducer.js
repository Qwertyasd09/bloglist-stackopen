import { createSlice } from "@reduxjs/toolkit";
import loginService from "../services/login";
import blogService from "../services/blogs";
import { setNotification } from "./notificationReducer";
import { dispatchError } from "./blogsReducer";

const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    setUser(state, action) {
      return action.payload;
    },
  },
});

export const login = (username, password) => {
  return async (dispatch) => {
    try {
      const user = await loginService.login({
        username,
        password,
      });
      window.localStorage.setItem(
        "loggedBlogListAppUser",
        JSON.stringify(user),
      );
      blogService.setToken(user.token);
      dispatch(setUser(user));
      dispatch(
        setNotification(
          { message: `${user.username} successfully logged in`, status: true },
          5000,
        ),
      );
    } catch (exception) {
      dispatchError(dispatch, exception);
    }
  };
};

export const logout = () => {
  return async (dispatch) => {
    window.localStorage.removeItem("loggedBlogListAppUser");
    dispatch(setUser(null));
  };
};

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
