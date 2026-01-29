
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Capture console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

    print("Navigating to home page...")
    response = page.goto("http://localhost:3000")
    print(f"Status: {response.status}")

    print("Waiting 3 seconds...")
    page.wait_for_timeout(3000)

    # Check if main.js is loaded
    is_main_loaded = page.evaluate("typeof checkAuthStatus !== 'undefined' || typeof VisionHub !== 'undefined'")
    print(f"Is main.js loaded (VisionHub defined)? {is_main_loaded}")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
