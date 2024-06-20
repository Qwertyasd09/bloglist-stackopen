import { useState, useEffect, Fragment, useRef } from "react";
import Blog from "./components/Blog/Blog";
import blogService from "./services/blogs";
import { Login } from "./components/Login/Login";
import loginService from "./services/login";
import { Notification } from "./components/Notification/Notification";
import { CreateBlog } from "./components/CreateBlog/CreateBlog";
import { Togglable } from "./components/Togglable/Togglable";
import "./index.css";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [messageInfo, setMessageInfo] = useState({
    message: null,
    status: false,
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogListAppUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const fetchData = async () => {
    if (user !== null) {
      const blogs = await blogService.getAll();
      setBlogs(blogs.sort(({ likes: a }, { likes: b }) => b - a));
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({
        username,
        password,
      });
      window.localStorage.setItem(
        "loggedBlogListAppUser",
        JSON.stringify(user),
      );
      setUser(user);
      blogService.setToken(user.token);
      setUsername("");
      setPassword("");
    } catch (exception) {
      setMessageInfo({
        message: exception.response.data.error,
        status: false,
      });
      setTimeout(() => {
        setMessageInfo({
          message: null,
          status: false,
        });
      }, 5000);
    }
  };

  const handleLogOut = () => {
    window.localStorage.removeItem("loggedBlogListAppUser");
    setUser(null);
  };

  const handleCreate = async (newBlog) => {
    try {
      blogFormRef.current.toggleVisibility();
      const returnedBlog = await blogService.create(newBlog);
      setBlogs(blogs.concat(returnedBlog));
      setMessageInfo({
        message: `a new blog ${newBlog.title} by ${newBlog.author} added`,
        status: true,
      });
      setTimeout(() => {
        setMessageInfo({
          message: null,
          status: false,
        });
      }, 5000);
    } catch (exception) {
      setMessageInfo({
        message: exception.response.data.error,
        status: false,
      });
      setTimeout(() => {
        setMessageInfo({
          message: null,
          status: false,
        });
      }, 5000);
    }
  };

  const updateBlog = async (newInfoBlog) => {
    try {
      const returnedBlog = await blogService.update(newInfoBlog);
      setBlogs(
        blogs
          .map((blog) => (blog.id === newInfoBlog.id ? returnedBlog : blog))
          .sort(({ likes: a }, { likes: b }) => b - a),
      );
    } catch (exception) {
      setMessageInfo({
        message: exception.response.data.error,
        status: false,
      });
      setTimeout(() => {
        setMessageInfo({
          message: null,
          status: false,
        });
      }, 5000);
    }
  };

  const removeBlog = async (blogToDelete) => {
    try {
      if (
        window.confirm(
          `Remove blog ${blogToDelete.title} by ${blogToDelete.author}?`,
        )
      ) {
        await blogService.remove(blogToDelete);
        setBlogs(blogs.filter((blog) => blog.id !== blogToDelete.id));
        setMessageInfo({
          message: `the blog ${blogToDelete.title} by ${blogToDelete.author} has been removed successfully`,
          status: true,
        });
        setTimeout(() => {
          setMessageInfo({
            message: null,
            status: false,
          });
        }, 5000);
      }
    } catch (exception) {
      setMessageInfo({
        message: exception.response.data.error,
        status: false,
      });
      setTimeout(() => {
        setMessageInfo({
          message: null,
          status: false,
        });
      }, 5000);
    }
  };

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
            message={messageInfo.message}
            status={messageInfo.status}
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
            message={messageInfo.message}
            status={messageInfo.status}
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
