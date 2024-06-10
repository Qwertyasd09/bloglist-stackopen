const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require("../models/blog")
const bcrypt = require('bcryptjs')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test("blogs are returned as json", async () => {
  const loginInfo = {
    username: "root",
    password: "sekret"
  }
  const tokenResponse = await api.post("/api/login").send(loginInfo)
  const token = tokenResponse.body.token
  await api
    .get('/api/blogs')
    .set({ Authorization: `Bearer ${token}` })
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: "cRINGE",
    author: "DEFEG",
    url: "http://DS.htmll",
    likes: 15
  }
  const loginInfo = {
    username: "root",
    password: "sekret"
  }
  const tokenResponse = await api.post("/api/login").send(loginInfo)
  const token = tokenResponse.body.token
  await api
    .post('/api/blogs')
    .set({ Authorization: `Bearer ${token}` })
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api
    .get('/api/blogs')
    .set({ Authorization: `Bearer ${token}` })
  
  const titles = response.body.map(r => r.title)
  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
  assert(titles.includes('cRINGE'))
})

test('a blog without likes can be added ', async () => {
  const loginInfo = {
    username: "root",
    password: "sekret"
  }
  const tokenResponse = await api.post("/api/login").send(loginInfo)
  const token = tokenResponse.body.token
  const newBlog = {
    title: "jajajaja",
    author: "ola k ase",
    url: "http://www.mll"
  }
  await api
    .post('/api/blogs')
    .set({ Authorization: `Bearer ${token}` })
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  const response = await api.get('/api/blogs').set({ Authorization: `Bearer ${token}` })
  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
  assert.strictEqual(blogsAtEnd.find(blog => blog.title === "jajajaja").likes, 0)
})

test('blog without title or url is not added', async () => {
  const loginInfo = {
    username: "root",
    password: "sekret"
  }
  const tokenResponse = await api.post("/api/login").send(loginInfo)
  const token = tokenResponse.body.token
  const newBlog = {
    author: "DEFEG",
    url: "http://DS.htmll",
    likes: 15
  }

  await api
    .post('/api/blogs')
    .set({ Authorization: `Bearer ${token}` })
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs').set({ Authorization: `Bearer ${token}` })

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test.only('a blog can be deleted', async () => {
  const loginInfo = {
    username: "root",
    password: "sekret"
  }
  const tokenResponse = await api.post("/api/login").send(loginInfo)
  const token = tokenResponse.body.token
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]
  console.log(await Blog.find({}))
  // await api
  //   .delete(`/api/blogs/${blogToDelete.id}`)
  //   .set({ Authorization: `Bearer ${token}` })
  //   .expect(204)
  // const blogsAtEnd = await helper.blogsInDb()
  // console.log(blogsAtEnd)
  // const titles = blogsAtEnd.map(r => r.title)
  // assert(!titles.includes(blogToDelete.title))
  // assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

test('a blog can be updated', async () => {
  const loginInfo = {
    username: "root",
    password: "sekret"
  }
  const tokenResponse = await api.post("/api/login").send(loginInfo)
  const token = tokenResponse.body.token
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  const newBlog = {...blogToUpdate, title: "Actualizado"}

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set({ Authorization: `Bearer ${token}` })
    .send(newBlog)
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()
  const titles = blogsAtEnd.map(r => r.title)
  assert(titles.includes("Actualizado"))
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

test('creation fails with proper statuscode if username or password missing', async () => {
  
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: "hoalslals",
    name: 'Superuser',
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await helper.usersInDb()
  assert(result.body.error.includes('required'))
  assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails with username or password less than 3 characters', async () => {
  
  const usersAtStart = await helper.usersInDb()

  const newUser = {
    username: "hsdfdfsfds",
    name: 'Superuser',
    password: "l"
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await helper.usersInDb()
  assert(result.body.error.includes('shorter'))
  assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

after(async () => {
  await mongoose.connection.close()
})