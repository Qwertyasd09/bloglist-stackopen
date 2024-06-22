import { createContext, useReducer } from "react";

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      return {
        message: `a new blog ${action.payload.title} by ${action.payload.author} added`,
        status: true,
      };
    case "REMOVE":
      return {
        message: `the blog ${action.payload.title} by ${action.payload.author} has been removed successfully`,
        status: true,
      };
    case "ERROR":
      return {
        message: action.payload.response.data.error,
        status: false,
      };
    case "DISMISS":
      return {
        message: null,
        status: false,
      };
    default:
      return state;
  }
};

const userReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      window.localStorage.setItem(
        "loggedBlogListAppUser",
        JSON.stringify(action.payload),
      );
      return action.payload;
    case "LOGOUT":
      window.localStorage.removeItem("loggedBlogListAppUser");
      return null;
    case "SET_USER":
      return action.payload;
    default:
      return state;
  }
};

const BlogContext = createContext();

export const BlogContextProvider = (props) => {
  const initialStateNotification = {
    message: null,
    status: false,
  };
  const initialStateUser = null;
  const [notification, notificationDispatch] = useReducer(
    notificationReducer,
    initialStateNotification,
  );
  const [user, userDispatch] = useReducer(userReducer, initialStateUser);
  return (
    <BlogContext.Provider
      value={[notification, notificationDispatch, user, userDispatch]}
    >
      {props.children}
    </BlogContext.Provider>
  );
};

// ACTION CREATORS NOTIFICATION

export const createBlogNotification = (messageInfo) => {
  return {
    type: "ADD",
    payload: messageInfo,
  };
};

export const errorBlogNotification = (exception) => {
  return {
    type: "ERROR",
    payload: exception,
  };
};

export const removeBlogNotification = (messageInfo) => {
  return {
    type: "REMOVE",
    payload: messageInfo,
  };
};

export const dismissNotification = () => {
  return {
    type: "DISMISS",
  };
};

// ACTION CREATORS USER

export const loginUser = (credentials) => {
  return {
    type: "LOGIN",
    payload: credentials,
  };
};

export const logoutUser = () => {
  return {
    type: "LOGOUT",
  };
};

export const setUser = (user) => {
  return {
    type: "SET_USER",
    payload: user,
  };
};

export default BlogContext;
