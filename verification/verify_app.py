from playwright.sync_api import sync_playwright

def verify_game_interface():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:5173")

        # Wait for key elements to be visible
        page.wait_for_selector("text=ป่าทมิฬ")
        page.wait_for_selector("text=ยินดีต้อนรับสู่อาณาจักรแห่งความมืด")

        # Verify status card
        page.wait_for_selector("text=100") # HP
        page.wait_for_selector("text=50") # MP

        # Take initial screenshot
        page.screenshot(path="verification/initial_state.png")
        print("Initial state screenshot captured.")

        # Interact: Click 'Attack' button (โจมตี)
        # Assuming the button has text "โจมตี"
        attack_btn = page.get_by_text("โจมตี")
        if attack_btn.is_visible():
            attack_btn.click()
            # Wait for dice overlay or chat update (logic has timeouts, so wait a bit)
            page.wait_for_timeout(3000)

            # Take action screenshot
            page.screenshot(path="verification/after_attack.png")
            print("After attack screenshot captured.")
        else:
            print("Attack button not found!")

        browser.close()

if __name__ == "__main__":
    verify_game_interface()
