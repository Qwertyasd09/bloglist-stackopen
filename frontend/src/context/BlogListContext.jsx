import { createContext, useReducer, useContext } from "react";

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

const NotificationContext = createContext();

export const NotificationContextProvider = (props) => {
  const initialState = {
    message: null,
    status: false,
  };
  const [notification, notificationDispatch] = useReducer(
    notificationReducer,
    initialState,
  );
  return (
    <NotificationContext.Provider value={[notification, notificationDispatch]}>
      {props.children}
    </NotificationContext.Provider>
  );
};

// NOT NEEDED, BUT JUST IN CASE
export const useNotificationValue = () => {
  const notificationAndDispatch = useContext(NotificationContext);
  return notificationAndDispatch[0];
};

export const useNotificationDispatch = () => {
  const notificationAndDispatch = useContext(NotificationContext);
  return notificationAndDispatch[1];
};

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

export default NotificationContext;
