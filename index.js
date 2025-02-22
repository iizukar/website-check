const puppeteer = require('puppeteer');

async function runTask() {
  // Launch Puppeteer with flags suitable for cloud environments
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Navigate to the target URL and wait until the network is idle
  await page.goto('http://testingimp.great-site.net', { waitUntil: 'networkidle0' });

  // Inject your code into the page
  await page.evaluate(() => {
    // Function to set input field value and dispatch events
    function setInputValue() {
      let inputField = document.querySelector("input.form-control.text-center");

      if (inputField) {
        let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(inputField, "http://testingimp.great-site.net");

        inputField.dispatchEvent(new Event("input", { bubbles: true }));
        inputField.dispatchEvent(new Event("change", { bubbles: true }));

        console.log("URL set successfully!");

        // Wait for 3 seconds before clicking the launch button
        setTimeout(clickLaunchButton, 3000);
      } else {
        console.error("Input field not found!");
      }
    }

    // Function to click the "Launch a new Workspace" button
    function clickLaunchButton() {
      let launchButton = document.querySelector("button.btn.btn-primary.w-100pc.m-2");

      if (launchButton) {
        launchButton.click();
        console.log("Launch button clicked!");

        // Wait for 15 seconds before running the exit button code (adjusted from 10 minutes to 15 seconds)
        setTimeout(clickExitButton, 15000);
      } else {
        console.error("Launch button not found!");
      }
    }

    // Function to click the exit button and schedule the delete button click
    function clickExitButton() {
      const exitButton = document.querySelector('button[data-tooltip-id="exit-tooltip"]');
      if (exitButton) {
        exitButton.click();
        console.log("Exit button clicked.");

        // Wait for 5 seconds before clicking the delete button
        setTimeout(clickDeleteButton, 5000);
      } else {
        console.error("Exit button not found!");
      }
    }

    // Function to click the delete button
    function clickDeleteButton() {
      let deleteButton = document.querySelector('button.col.btn.btn-outline-danger');
      if (deleteButton) {
        deleteButton.click();
        console.log("Delete button clicked.");
      } else {
        console.error("Delete button not found!");
      }
    }

    // Run the function to start the process
    setInputValue();
  });

  // Wait for 30 seconds to allow all scheduled actions to complete
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Close the browser instance
  await browser.close();
}

(async () => {
  // Repeat the process indefinitely
  while (true) {
    try {
      console.log("Starting new iteration...");
      await runTask();
    } catch (error) {
      console.error("Error during task execution:", error);
    }
  }
})();
