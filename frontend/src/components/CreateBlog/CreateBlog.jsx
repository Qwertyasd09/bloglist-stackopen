import React from 'react'
import { useState } from 'react'

export const CreateBlog = ({
  handleCreate
}) => {

  const [blogInfo, setBlogInfo] = useState({ title: '', author: '', url: '' })

  const addBlog = (e) => {
    e.preventDefault()
    const newBlog = {
      title: blogInfo.title,
      author: blogInfo.author,
      url: blogInfo.url
    }
    handleCreate(newBlog)
    setBlogInfo({ title: '', author: '', url: '' })
  }

  const handleChange = (e) => {
    setBlogInfo({
      ...blogInfo,
      [e.target.name]: e.target.value
    })
  }

  return (
    <form onSubmit={(e) => addBlog(e)} className='formDiv'>
      <h1>create new</h1>
      <p>title:<input data-testid='title' name='title' value={blogInfo.title} onChange={(e) => handleChange(e)}/></p>
      <p>author:<input data-testid='author' name='author' value={blogInfo.author} onChange={(e) => handleChange(e)}/></p>
      <p>url:<input data-testid='url' name='url' value={blogInfo.url} onChange={(e) => handleChange(e)}/></p>
      <button type='submit'>create</button>
    </form>
  )
}
