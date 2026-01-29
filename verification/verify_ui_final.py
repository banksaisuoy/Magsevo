
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    # page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    print("Navigating to home page...")
    page.goto("http://localhost:3000")

    print("Waiting for login modal...")
    page.wait_for_selector("#login-modal", state="visible")

    print("Logging in with admin/123456...")
    page.fill("#username", "admin")
    page.fill("#password", "123456")
    page.click("button[data-lang-key='loginBtn']")

    print("Waiting for dashboard...")
    try:
        # Wait for main content to be visible
        page.wait_for_selector("#main-content:not(.hidden)", state="visible", timeout=10000)
        print("Dashboard visible!")

        # Check for React root
        page.wait_for_selector("#magsevo-root", state="visible")

        print("Taking success screenshot...")
        # Give it a moment to render the Bento Grid
        page.wait_for_timeout(3000)
        page.screenshot(path="verification/dashboard_success.png", full_page=True)

    except Exception as e:
        print(f"FAILED: {e}")
        print("Taking failure screenshot...")
        page.screenshot(path="verification/dashboard_failed.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
