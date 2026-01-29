
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    print("Navigating to home page...")
    try:
        page.goto("http://localhost:3000")
    except Exception as e:
        print(f"Navigation failed: {e}")
        return

    print("Waiting for login modal...")
    try:
        page.wait_for_selector("#login-modal", state="visible", timeout=5000)
        print("Login modal visible.")
    except:
        print("Login modal not found (maybe already logged in or server error).")
        page.screenshot(path="verification/login_fail.png")
        return

    print("Logging in with admin/123456...")
    page.fill("#username", "admin")
    page.fill("#password", "123456")
    page.click("button[data-lang-key='loginBtn']")

    print("Waiting for dashboard...")
    try:
        page.wait_for_selector("#main-content:not(.hidden)", state="visible", timeout=10000)
        print("Dashboard visible!")

        # Check for React root
        page.wait_for_selector("#magsevo-root", state="visible")

        # Verify Admin Button
        print("Checking for Admin button...")
        admin_btn = page.wait_for_selector("#admin-panel-btn", state="visible")
        if admin_btn:
            print("Admin button found. Clicking...")
            admin_btn.click()

            # Wait for Admin Panel Modal
            print("Waiting for Admin Panel Modal...")
            page.wait_for_selector("#admin-panel-modal.show", state="visible")

            # Click Manage Videos
            print("Clicking Manage Videos...")
            page.click("#admin-manage-videos")

            # Wait for Manage Videos Modal
            print("Waiting for Manage Videos Modal...")
            page.wait_for_selector("#manage-videos-modal.show", state="visible")

            # Check if list is populated (or empty but visible)
            # The list ID is #manage-videos-list
            # It might take a moment to fetch videos
            page.wait_for_timeout(1000)
            list_content = page.inner_html("#manage-videos-list")
            print(f"Manage Videos List Content Length: {len(list_content)}")

            print("Taking admin screenshot...")
            page.screenshot(path="verification/admin_panel.png")

    except Exception as e:
        print(f"FAILED: {e}")
        print("Taking failure screenshot...")
        page.screenshot(path="verification/dashboard_failed.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
