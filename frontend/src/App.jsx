import { useState, useEffect, Fragment, useRef } from "react";
import Blog from "./components/Blog/Blog";
import blogService from "./services/blogs";
import { Login } from "./components/Login/Login";
import { Notification } from "./components/Notification/Notification";
import { CreateBlog } from "./components/CreateBlog/CreateBlog";
import { Togglable } from "./components/Togglable/Togglable";
import "./index.css";
import { useDispatch, useSelector } from "react-redux";
import {
  createBlog,
  deleteBlog,
  initializeBlogs,
  newVote,
} from "./reducers/blogsReducer";
import { logout, setUser, login } from "./reducers/userReducer";
import { Routes, Route, useMatch, Link } from "react-router-dom";
import userService from "./services/users";
import { initializeUsersDatabase } from "./reducers/usersDatabaseReducer";

const App = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const notification = useSelector((state) => state.notification);
  const blogs = useSelector((state) => state.blogs);
  const user = useSelector((state) => state.user);
  const usersDatabase = useSelector((state) => state.usersDatabase);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogListAppUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      blogService.setToken(user.token);
      dispatch(setUser(user));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const match = useMatch("/users/:id");
  const currentUser = match
    ? usersDatabase.find((userDatabase) => userDatabase.id === match.params.id)
    : null;

  const matchBlog = useMatch("/blogs/:id");
  const currentBlog = matchBlog
    ? blogs.find((blog) => blog.id === matchBlog.params.id)
    : null;

  const fetchData = async () => {
    if (user !== null) {
      dispatch(initializeBlogs());
      dispatch(initializeUsersDatabase());
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    dispatch(login(username, password));
    setUsername("");
    setPassword("");
  };

  const handleLogOut = () => {
    dispatch(logout());
  };

  const handleCreate = async (newBlog) => {
    blogFormRef.current.toggleVisibility();
    dispatch(createBlog(newBlog));
  };

  const updateBlog = async (newInfoBlog) => {
    dispatch(newVote(newInfoBlog), { dispatch });
  };

  const removeBlog = async (blogToDelete) => {
    if (
      window.confirm(
        `Remove blog ${blogToDelete.title} by ${blogToDelete.author}?`,
      )
    ) {
      dispatch(deleteBlog(blogToDelete), { dispatch });
    }
  };

  const BlogList = () => {
    return (
      <>
        <Togglable buttonLabel="new blog" ref={blogFormRef}>
          <CreateBlog handleCreate={handleCreate} />
        </Togglable>
        {blogs.map((blog, index) => (
          <Link to={`/blogs/${blog.id}`} key={blog.id}>
            <Blog
              index={index}
              blog={blog}
              user={user}
              updateBlog={updateBlog}
              removeBlog={removeBlog}
              selectedBlog={currentBlog}
            />
          </Link>
        ))}
      </>
    );
  };

  const BlogView = ({ blog }) => {
    const btnStyle = {
      marginLeft: "2px",
      borderRadius: "4px",
    };
    const [updatedBlog, setUpdatedBlog] = useState(blog);

    const increaseLikes = () => {
      const newBlog = {
        ...blog,
        likes: blog.likes + 1,
      };
      updateBlog(newBlog);
      setUpdatedBlog(newBlog);
    };

    if (!blog) return null;

    return (
      <>
        <h2>
          {updatedBlog.title} {updatedBlog.author}
        </h2>
        <a href={updatedBlog.url}>{updatedBlog.url}</a>
        <div className="likesDiv">
          <p style={{ display: "inline-block" }}>{updatedBlog.likes} likes</p>
          <button onClick={increaseLikes} style={btnStyle}>
            add
          </button>
        </div>
        <p>added by {updatedBlog.user.name}</p>
        {/* {updatedBlog.user.username === user.username && (
          <button onClick={() => removeBlog(updatedBlog)} style={btnStyle}>
            remove
          </button>
        )} */}
      </>
    );
  };

  const HomePage = () => {
    return (
      <Fragment>
        <Notification
          message={notification.message}
          status={notification.status}
        />

        <Routes>
          <Route path="/blogs/:id" element={<BlogView blog={currentBlog} />} />
          <Route path="/" element={<BlogList />} />
        </Routes>
      </Fragment>
    );
  };

  const User = ({ user }) => {
    return (
      <tr>
        <th scope="row">
          <Link to={`/users/${user.id}`} key={user.id}>
            {user.name}
          </Link>
        </th>
        <td>{user.blogs.length}</td>
      </tr>
    );
  };

  const Users = ({ usersDatabase }) => {
    return (
      <>
        <h2 style={{ marginTop: "0" }}>Users</h2>
        <table>
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">
                <strong>blogs created</strong>
              </th>
            </tr>
          </thead>
          <tbody>
            {usersDatabase.map((user) => (
              <User key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </>
    );
  };

  const UserView = ({ user }) => {
    if (!user) {
      return null;
    }
    return (
      <>
        <h2>{user.name}</h2>
        <h3>added blogs</h3>
        <ul>
          {user.blogs.length !== 0 ? (
            user.blogs.map((blog) => <li key={blog.id}>{blog.title}</li>)
          ) : (
            <p>No blogs</p>
          )}
        </ul>
      </>
    );
  };

  const blogFormRef = useRef();

  if (!blogs) return null;

  const navbarStyles = {
    display: "flex",
    gap: "8px",
    fontSize: "18px",
    backgroundColor: "gray",
    alignItems: "center",
    padding: "0.5rem 5px",
  };

  return (
    <div>
      {user ? (
        <Fragment>
          <div style={navbarStyles}>
            <Link to={"/"}>blogs</Link>
            <Link to={"/users"}>users</Link>
            <div style={{ display: "flex", gap: "4px" }}>
              <p style={{ margin: "0" }}>{user.name} logged in</p>
              <button onClick={handleLogOut}>Log out</button>
            </div>
          </div>
          <h2>blog app</h2>
          <Routes>
            <Route
              path="/users/:id"
              element={<UserView user={currentUser} />}
            />
            <Route path="/*" element={<HomePage />} />
            <Route
              path="/users"
              element={<Users usersDatabase={usersDatabase} />}
            />
          </Routes>
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
