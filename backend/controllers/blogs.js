const blogsRouter = require("express").Router()
const Blog = require("../models/blog")

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.title || !body.url) {
    return response.status(400).send({
      error: "missing title or url"
    })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes
  })
  savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

module.exports = blogsRouter