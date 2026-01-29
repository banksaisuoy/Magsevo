
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to home page...")
    page.goto("http://localhost:3000")

    print("Waiting 5 seconds for JS to execute...")
    page.wait_for_timeout(5000)

    print("Taking debug screenshot...")
    page.screenshot(path="verification/debug_state.png", full_page=True)

    # Check classes
    classes = page.evaluate("document.getElementById('login-modal').className")
    print(f"Login modal classes: {classes}")

    main_classes = page.evaluate("document.getElementById('main-content').className")
    print(f"Main content classes: {main_classes}")

    # Check visible text
    text = page.inner_text("body")
    print(f"Body text snippet: {text[:200]}")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
