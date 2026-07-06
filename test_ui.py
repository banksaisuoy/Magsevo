from playwright.sync_api import sync_playwright
import time

def test_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3000')
        time.sleep(2)

        # Login
        page.fill('input[name="username"]', 'admin')
        page.fill('input[name="password"]', '123456')
        page.click('button[type="submit"]')
        time.sleep(2)

        # Scroll down to see video cards
        page.mouse.wheel(0, 800)
        time.sleep(1)

        page.screenshot(path='screenshot_after_ui_admin_scroll.png')

        browser.close()

test_ui()
