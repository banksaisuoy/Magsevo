
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # 1. Navigate to home page
    print("Navigating to home page...")
    page.goto("http://localhost:3000")

    # 2. Handle Login
    print("Waiting for login modal...")
    page.wait_for_selector("#login-modal", state="visible")

    print("Logging in...")
    page.fill("#username", "admin")
    page.fill("#password", "admin123")
    page.click("button[data-lang-key='loginBtn']")

    # 3. Wait for Main Content
    print("Waiting for dashboard...")
    # Wait for the main content to be visible (removed hidden class)
    page.wait_for_selector("#main-content:not(.hidden)", state="visible", timeout=10000)

    # 4. Check for React root and content
    print("Checking for React root...")
    page.wait_for_selector("#magsevo-root", state="visible")

    # 5. Take screenshot
    print("Taking screenshot...")
    # Wait a bit for animations to settle (Hero orbs etc)
    page.wait_for_timeout(3000)
    page.screenshot(path="verification/dashboard.png", full_page=True)

    browser.close()
    print("Done.")

with sync_playwright() as playwright:
    run(playwright)
