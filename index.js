const express = require('express');
const puppeteer = require('puppeteer');

const PORT = process.env.PORT || 3000;
const app = express();

// Dummy route to satisfy Render's port binding
app.get('/', (req, res) => {
  res.send('Puppeteer automation is running!');
});

// Start the Express server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

async function runTask() {
  // Launch Puppeteer with the installed Chromium executable
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Navigate to the target URL and wait until the network is idle
  await page.goto('http://testingimp.great-site.net', { waitUntil: 'networkidle0' });

  // Inject your automation code into the page
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
        // Wait 3 seconds before clicking the launch button
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
        // Wait 15 seconds before clicking the exit button
        setTimeout(clickExitButton, 600000);
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
        // Wait 5 seconds before clicking the delete button
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

    // Start the sequence
    setInputValue();
  });

  // Wait for 30 seconds to allow all scheduled events to complete
  await new Promise(resolve => setTimeout(resolve, 30000));

  await browser.close();
}

(async () => {
  while (true) {
    try {
      console.log("Starting new iteration...");
      await runTask();
    } catch (error) {
      console.error("Error during task execution:", error);
    }
  }
})();
