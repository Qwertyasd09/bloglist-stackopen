const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require("../models/blog")

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })
})

test('blog with most likes', () => {
  const blogWithMostLikes = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    likes: 12
  }
  const result = listHelper.favoriteBlog(helper.initialBlogs)
  assert.deepStrictEqual(result, blogWithMostLikes)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blog with most likes', () => {
  const blogWithMostLikes = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    likes: 12
  }
  const result = listHelper.favoriteBlog(helper.initialBlogs)
  assert.deepStrictEqual(result, blogWithMostLikes)
})

test('blog with id property instead of _id', async () => {
  const result = await helper.blogsInDb()
  assert(Object.keys(result[0]).includes("id") && !Object.keys(result[0]).includes("_id"))
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: "cRINGE",
    author: "DEFEG",
    url: "http://DS.htmll",
    likes: 15
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const titles = response.body.map(r => r.title)

  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
  assert(titles.includes('cRINGE'))
})

test('a blog without likes can be added ', async () => {
  const newBlog = {
    title: "jajajaja",
    author: "ola k ase",
    url: "http://www.mll"
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
  assert.strictEqual(blogsAtEnd.find(blog => blog.title === "jajajaja").likes, 0)
})

test.only('blog without title or url is not added', async () => {
  const newBlog = {
    author: "DEFEG",
    url: "http://DS.htmll",
    likes: 15
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

after(async () => {
  await mongoose.connection.close()
})