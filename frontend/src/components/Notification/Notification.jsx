import PropTypes from "prop-types";

export const Notification = ({ message, status }) => {
  if (message === null) {
    return null;
  }

  return (
    <div
      data-testid="notification"
      className={"notification " + (status === true ? "success" : "error")}
    >
      {message}
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string,
  status: PropTypes.bool.isRequired,
};
