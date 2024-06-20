import { useState, useEffect, Fragment, useRef } from "react";
import Blog from "./components/Blog/Blog";
import blogService from "./services/blogs";
import { Login } from "./components/Login/Login";
import loginService from "./services/login";
import { Notification } from "./components/Notification/Notification";
import { CreateBlog } from "./components/CreateBlog/CreateBlog";
import { Togglable } from "./components/Togglable/Togglable";
import "./index.css";
import { useDispatch, useSelector } from "react-redux";
import { createBlog, deleteBlog, dispatchError, initializeBlogs, newVote } from "./reducers/blogsReducer";
import { logout, setUser, login } from "./reducers/userReducer";

const App = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const notification = useSelector((state) => state.notification);
  const blogs = useSelector((state) => state.blogs);
  const user = useSelector((state) => state.user)

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogListAppUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      blogService.setToken(user.token);
      dispatch(setUser(user))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    if (user !== null) {
      dispatch(initializeBlogs())
    }
  };
  
  const handleLogin = async (event) => {
    event.preventDefault();
    dispatch(login(username, password))
    setUsername("");
    setPassword("");
  };

  const handleLogOut = () => {
    dispatch(logout())
  };

  const handleCreate = async (newBlog) => {
    blogFormRef.current.toggleVisibility();
    dispatch(createBlog(newBlog))
  };

  const updateBlog = async (newInfoBlog) => {
    dispatch(newVote(newInfoBlog), { dispatch })
  };

  const removeBlog = async (blogToDelete) => {
    if (window.confirm(`Remove blog ${blogToDelete.title} by ${blogToDelete.author}?`)) {
      dispatch(deleteBlog(blogToDelete), { dispatch })
  }};

  const blogFormRef = useRef();

  if (!blogs) return null;

  return (
    <div>
      <h2>blogs</h2>
      {user ? (
        <Fragment>
          <p style={{ margin: "0" }}>{user.name} logged in</p>
          <button onClick={handleLogOut} style={{ marginBottom: "1rem" }}>
            Log out
          </button>
          <Notification
            message={notification.message}
            status={notification.status}
          />
          <Togglable buttonLabel="new blog" ref={blogFormRef}>
            <CreateBlog handleCreate={handleCreate} />
          </Togglable>
          {blogs.map((blog, index) => (
            <Blog
              index={index}
              key={blog.id}
              blog={blog}
              user={user}
              updateBlog={updateBlog}
              removeBlog={removeBlog}
            />
          ))}
        </Fragment>
      ) : (
        <Fragment>
          <h2>log in to application</h2>
          <Notification
            message={notification.message}
            status={notification.status}
          />
          <Login
            handleLogin={handleLogin}
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
          />
        </Fragment>
      )}
    </div>
  );
};

export default App;
