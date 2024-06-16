import { useState } from 'react'
import PropTypes from 'prop-types'

const Blog = ({ user, blog, updateBlog, removeBlog, index }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }
  const btnStyle = {
    marginLeft: '2px',
    borderRadius: '4px'
  }
  const [visible, setVisible] = useState(false)
  const showWhenVisible = { display: visible ? '' : 'none' }
  const [updatedBlog, setUpdatedBlog] = useState(blog)

  const increaseLikes = () => {
    const newBlog = {
      ...blog,
      likes: blog.likes + 1
    }
    updateBlog(newBlog)
    setUpdatedBlog(newBlog)
  }

  return (
    <div className='blog' style={blogStyle}>
      <div className='visibleByDefault'>
        <p style={{ display: 'inline-block' }}>{updatedBlog.title} {updatedBlog.author}</p>
        <button data-testid={`btnView-${index+1}`} onClick={() => setVisible(prevState => !prevState)} style={{ borderRadius: '4px' }}>{visible ? 'hide': 'view'}</button>
      </div>
      <div className='notVisibleByDefault' style={showWhenVisible}>
        <p>{updatedBlog.url}</p>
        <div className='likesDiv'>
          <p data-testid={`likesCount-${index+1}`} style={{ display: 'inline-block' }}>likes {updatedBlog.likes}</p>
          <button data-testid={`btnAdd-${index+1}`} onClick={increaseLikes} style={btnStyle}>add</button>
        </div>
        <p>{updatedBlog.user.name}</p>
        {(updatedBlog.user.username === user.username) && <button onClick={() => removeBlog(updatedBlog)} style={btnStyle}>remove</button>}
      </div>
    </div>
  )
}

export default Blog

// Blog.propTypes = {
//   user: PropTypes.object.isRequired,
//   blog: PropTypes.object.isRequired,
//   updateBlog: PropTypes.func.isRequired,
//   removeBlog: PropTypes.func.isRequired
// }