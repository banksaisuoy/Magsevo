from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000")

    page.fill('input[name="username"]', 'admin')
    page.fill('input[name="password"]', '123456')
    page.click('button[type="submit"]')
    page.wait_for_timeout(2000)

    # Try opening a video
    page.click('.video-card:first-child')
    page.wait_for_timeout(3000)
    page.screenshot(path="screenshot_video5.png")

    browser.close()
