const { test, expect, beforeEach, describe } = require('@playwright/test')
const frontendUrl = 'http://localhost:5173'
const backendUrl = 'http://localhost:3003'

describe('Blog app', () => {
    beforeEach(async ({ page, request }) => {
        await request.post(`${backendUrl}/api/test/reset`)
        await page.goto(frontendUrl)
    })

    test('Login form is shown', async ({ page }) => {
        const loginForm = await page.getByTestId('login-form')
        await expect(loginForm).toBeVisible()
    })

    describe('Login', () => {
        const user = { username: 'aaa', password: 'aaa', name: 'aaa' }
        beforeEach(async ({ page, request }) => {
            await request.post(`${backendUrl}/api/users`, {data: user})
        })
        test('succeeds with correct credentials', async ({ page }) => {
            await page.getByTestId('username-input').fill(user.username)
            await page.getByTestId('password-input').fill(user.password)
            await page.getByTestId('login-button').click()
            const msg = await page.getByTestId('notification').getByText(
                `Logged in as ${user.username}`)
            await expect(msg).toBeVisible()
        })

        test('fails with wrong credentials', async ({ page }) => {
            await page.getByTestId('username-input').fill(user.username)
            await page.getByTestId('password-input').fill(user.password + 'x')
            await page.getByTestId('login-button').click()
            const msg = await page.getByTestId('notification').getByText(
                    'Error when logging in: invalid username or password')
            await expect(msg).toBeVisible()
        })
    })

    describe('When logged in', () => {
        const user = { username: 'aaa', password: 'aaa', name: 'aaa' };
        beforeEach(async ({ page, request }) => {
            await request.post(`${backendUrl}/api/users`, {data: user})
            await page.getByTestId('username-input').fill(user.username)
            await page.getByTestId('password-input').fill(user.password)
            await page.getByTestId('login-button').click()
        })
        
        test('a new blog can be created', async ({ page }) => {
            const blog = { title: 'Test Title', author: 'Test Author', url: 'http://test.url' }
            await page.getByRole("button").getByText('new blog').click()
            await page.getByTestId('title-input').fill(blog.title)
            await page.getByTestId('author-input').fill(blog.author)
            await page.getByTestId('url-input').fill(blog.url)
            await page.getByTestId('create-button').click()
            const msg = await page.getByTestId('notification').getByText(
                    `new blog ${blog.title} by ${blog.author} added`)
            await expect(msg).toBeVisible()
            await expect(page.getByText(`${blog.title} ${blog.author}`)).toBeVisible()
        })

        test('a blog can be liked', async ({ page }) => {
            const blog = { title: 'Test Title 1', author: 'Test Author 1', url: 'http://test.url' }
            await page.getByText('new blog').click()
            await page.getByTestId('title-input').fill(blog.title)
            await page.getByTestId('author-input').fill(blog.author)
            await page.getByTestId('url-input').fill(blog.url)
            await page.getByTestId('create-button').click()
            const blogElement = await page.getByText(`${blog.title} ${blog.author}`)
            await blogElement.getByText('view').click()
            await expect(blogElement.getByText('likes: 0')).toBeVisible()
            await blogElement.getByTestId('like-button').click()
            await expect(blogElement.getByText('likes: 1')).toBeVisible()
            await blogElement.getByTestId('like-button').click()
            await expect(blogElement.getByText('likes: 2')).toBeVisible()
        })

        test('a blog can be deleted', async ({ page }) => {
            const blog = { title: 'Test Title 1', author: 'Test Author 1', url: 'http://test.url' }
            await page.getByText('new blog').click()
            await page.getByTestId('title-input').fill(blog.title)
            await page.getByTestId('author-input').fill(blog.author)
            await page.getByTestId('url-input').fill(blog.url)
            await page.getByTestId('create-button').click()
            page.on('dialog', dialog => dialog.accept());
            const blogElement = await page.getByText(`${blog.title} ${blog.author}`)
            await blogElement.getByText('view').click()
            await blogElement.getByText('remove').click()
            await expect(page.getByText(`${blog.title} ${blog.author}`)).not.toBeVisible()
        })

        test('blogs only show delete button for the user who created them', async ({ page, request }) => {
            const blog = { title: 'Test Title 1', author: 'Test Author 1', url: 'http://test.url' }
            await page.getByText('new blog').click()
            await page.getByTestId('title-input').fill(blog.title)
            await page.getByTestId('author-input').fill(blog.author)
            await page.getByTestId('url-input').fill(blog.url)
            await page.getByTestId('create-button').click()
            const blogElement = await page.getByText(`${blog.title} ${blog.author}`)
            await blogElement.getByText('view').click()
            await expect(blogElement.getByText('remove')).toBeVisible()
            await page.getByRole("button").getByText('logout').click()
            const user2 = { username: 'bbb', password: 'bbb', name: 'bbb' }
            await request.post(`${backendUrl}/api/users`, {data: user2})
            await page.getByTestId('username-input').fill(user2.username)
            await page.getByTestId('password-input').fill(user2.password)
            await page.getByTestId('login-button').click()
            await expect(blogElement.getByText('remove')).not.toBeVisible()
        })

        test('blogs are ordered by likes', async ({ page }) => {
            const blogs = [
                { title: 'Test Title 1', author: 'Test Author 1', url: 'http://test.url', likes: 1 },
                { title: 'Test Title 2', author: 'Test Author 2', url: 'http://test.url', likes: 2 },
                { title: 'Test Title 3', author: 'Test Author 3', url: 'http://test.url', likes: 3 }
            ]
            for (const blog of blogs) {
                await page.getByRole("button").getByText('new blog').click()
                await page.getByTestId('title-input').fill(blog.title)
                await page.getByTestId('author-input').fill(blog.author)
                await page.getByTestId('url-input').fill(blog.url)
                await page.getByTestId('create-button').click()

                const blogElement = await page.getByText(`${blog.title} ${blog.author}`)
                await blogElement.getByText('view').click()

                for (let i = 0; i < blog.likes; i++) {
                    const blogElement = await page.getByText(`${blog.title} ${blog.author}`)
                    await blogElement.getByTestId('like-button').click()
                    // Need to wait for the likes to propagate to backend
                    await page.waitForTimeout(200)
                }
            }
            const blogElements = await page.locator('.blog-entry')
            expect(blogElements.nth(0)).toContainText(`${blogs[2].title} ${blogs[2].author}`)
            expect(blogElements.nth(1)).toContainText(`${blogs[1].title} ${blogs[1].author}`)
            expect(blogElements.nth(2)).toContainText(`${blogs[0].title} ${blogs[0].author}`)
        })
    })
})