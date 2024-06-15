const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http:localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Diego Chiri',
        username: 'dgchiri',
        password: '1Barcelona100'
      }
    })
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByText('blogs')
    await expect(locator).toBeVisible()
    await expect(page.getByText('log in to application')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'dgchiri', '1Barcelona100')
      await expect(page.getByText('Diego Chiri logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('username').fill('dgchiri')
      await page.getByTestId('password').fill('wrong')
      await page.getByRole('button', { name: 'login' }).click()
      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('invalid username or password')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
    })

    describe('When logged in', () => {
      beforeEach(async ({ page }) => {
        await loginWith(page, 'dgchiri', '1Barcelona100')
      })
    
      test('a new blog can be created', async ({ page }) => {
        const title = 'La Odisea'
        const author = 'Homero'
        const url = 'https://es.wikipedia.org/wiki/Odisea'
        await createBlog(page, title, author, url)
        const successDiv = page.locator('.success')
        await expect(successDiv).toContainText(`a new blog ${title} by ${author} added`)
        await expect(successDiv).toHaveCSS('border-style', 'solid')
        await expect(successDiv).toHaveCSS('color', 'rgb(0, 128, 0)')
        const newBlogDiv = page.locator('.blog')
        await expect(newBlogDiv).toBeVisible()
        await expect(newBlogDiv).toContainText(`${title} ${author}`)
      })

      describe('When blog created', () => {
        beforeEach(async ({ page }) => {
          const title = 'La Odisea'
          const author = 'Homero'
          const url = 'https://es.wikipedia.org/wiki/Odisea'
          await createBlog(page, title, author, url)
        })

        test('a blog can be liked', async ({ page }) => {
          await page.getByRole('button', { name: 'view' }).click()
          await page.getByRole('button', { name: 'add' }).click()
          await expect(page.getByText('likes 1')).toBeVisible()
        })

        test('a blog can be deleted', async ({ page }) => {
          await page.getByRole('button', { name: 'view' }).click()
          page.on('dialog', async dialog => {
            await dialog.accept()
          })
          await page.getByRole('button', { name: 'remove' }).click()
          const deletedDiv = page.locator('.success')
          await expect(deletedDiv).toContainText('the blog La Odisea by Homero has been removed successfully')
          await expect(deletedDiv).toHaveCSS('border-style', 'solid')
          await expect(deletedDiv).toHaveCSS('color', 'rgb(0, 128, 0)')
        })

        test('only user who added the blog can see delete button', async ({ page }) => {
          await page.getByRole('button', { name: 'Log out' }).click()
          await loginWith(page, 'mluukkai', 'salainen')
          await page.getByRole('button', { name: 'view' }).click()
          await expect(page.getByText('remove')).not.toBeVisible()
        })

        test('blogs are arranged in the order according to the likes, the blog with the most likes first', async ({ page }) => {
          const title = 'El Retrato de Dorian Gray'
          const author = 'Oscar Wilde'
          const url = 'https://es.wikipedia.org/wiki/El_retrato_de_Dorian_Gray'
          await createBlog(page, title, author, url)
          const numViewButtons = (await page.getByRole('button', { name: 'view' }).all()).length
          for (let i = 1; i < numViewButtons+1; i++) {
            await page.getByTestId(`btnView-${i}`).click()
          }
          await page.getByRole('button', { name: 'add' }).last().click()
          const blogsDivs = await page.locator('.blog').all()
          await expect(blogsDivs[0]).toContainText('El Retrato de Dorian Gray', { timeout: 12000 })
        })
      })
    })
  })
  

})