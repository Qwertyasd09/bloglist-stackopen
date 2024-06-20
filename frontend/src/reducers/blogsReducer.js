import { createSlice } from "@reduxjs/toolkit"
import blogService from "../services/blogs"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { setNotification } from "./notificationReducer"

export const newVote = createAsyncThunk(
  'blogs/newVote',
  async (newBlog, { dispatch }) => {
    try {
      const response = await blogService.update(newBlog)
      return response
    } catch (exception) {
      dispatchError(dispatch, exception)
    }
  }
)

export const deleteBlog = createAsyncThunk(
  'blogs/deleteBlog',
  async (blogToDelete, { dispatch }) => {
    try {
      const response = await blogService.remove(blogToDelete)
      return response
    } catch (exception) {
      dispatchError(dispatch, exception)
    }
  }
)

const blogSlice = createSlice({
  name: 'blogs',
  initialState: [],
  reducers: {
    setBlogs(state, action) {
      return action.payload.sort(({ likes: a }, { likes: b }) => b - a)
    },
    appendBlog(state, action) {
      state.push(action.payload)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(newVote.fulfilled, (state, action) => {
      const newBlog = action.payload
      return state.map(blog => blog.id === newBlog.id ? newBlog : blog).sort(({ likes: a }, { likes: b }) => b - a)
    }),
    builder.addCase(deleteBlog.fulfilled, (state, action) => {
      const idBlogToDelete = action.meta.arg.id
      return state.filter((blog) => blog.id !== idBlogToDelete)
    })
  }
})

export const { setBlogs, appendBlog } = blogSlice.actions

export const initializeBlogs = () => {
  return async dispatch => {
    const blogs = await blogService.getAll()
    dispatch(setBlogs(blogs))
  }
}

export const createBlog = (content) => {
  return async dispatch => {
    try {
      const newBlog = await blogService.create(content)
      dispatch(appendBlog(newBlog))
      dispatch(
        setNotification(
          {
            message: `a new blog ${newBlog.title} by ${newBlog.author} added`,
            status: true,
          },
          5000,
        ),
      );
    } catch (exception) {
      dispatchError(dispatch, exception)
    }
  }
}

const dispatchError = (dispatch, exception) => {
  dispatch(
    setNotification(
      {
        message: exception.response.data.error,
        status: false,
      },
      5000,
    ),
  );
}

export default blogSlice.reducer