import { useState, useEffect, Fragment, useRef, useContext } from "react";
import Blog from "./components/Blog/Blog";
import blogService from "./services/blogs";
import { Login } from "./components/Login/Login";
import loginService from "./services/login";
import { Notification } from "./components/Notification/Notification";
import { CreateBlog } from "./components/CreateBlog/CreateBlog";
import { Togglable } from "./components/Togglable/Togglable";
import "./index.css";
import NotificationContext, {
  createBlogNotification,
  dismissNotification,
  errorBlogNotification,
  removeBlogNotification,
} from "./context/BlogListContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [messageInfo, dispatch] = useContext(NotificationContext);

  const queryClient = useQueryClient()

  const { isPending, isError, data: blogs, error } = useQuery({
    queryKey: ["blogs"],
    queryFn: blogService.getAll,
    retry: 1,
    enabled: user !== null
  },)
  
  const newBlogMutation = useMutation({ 
    mutationFn: blogService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] })
    } 
  })

  const updateBlogMutation = useMutation({
    mutationFn: blogService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    }
  })

  const removeBlogMutation = useMutation({
    mutationFn: blogService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    }
  })
  
  const blogFormRef = useRef();

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogListAppUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

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
      dispatch(errorBlogNotification(exception));
      setTimeout(() => {
        dispatch(dismissNotification());
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
      newBlogMutation.mutate(newBlog)
      dispatch(createBlogNotification(newBlog));
      setTimeout(() => {
        dispatch(dismissNotification());
      }, 5000);
    } catch (exception) {
      dispatch(errorBlogNotification(exception));
      setTimeout(() => {
        dispatch(dismissNotification());
      }, 5000);
    }
  };

  const updateBlog = async (newInfoBlog) => {
    try {
      updateBlogMutation.mutate(newInfoBlog)
    } catch (exception) {
      dispatch(errorBlogNotification(exception));
      setTimeout(() => {
        dispatch(dismissNotification());
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
        removeBlogMutation.mutate(blogToDelete)
        dispatch(removeBlogNotification(blogToDelete));
        setTimeout(() => {
          dispatch(dismissNotification());
        }, 5000);
      }
    } catch (exception) {
      dispatch(errorBlogNotification(exception));
      setTimeout(() => {
        dispatch(dismissNotification());
      }, 5000);
    }
  };

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
