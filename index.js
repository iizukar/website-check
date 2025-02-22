const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const LOG_FILE = 'process.log';

const app = express();

// Dummy route to satisfy Render's port binding
app.get('/', (req, res) => {
  res.send('Puppeteer automation is running!');
});

// Start the Express server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// Utility function to log messages with a timestamp.
// Each message is appended to the log file and printed to the console.
function logMessage(msg) {
  const timestamp = new Date().toISOString();
  const message = `${timestamp} - ${msg}\n`;
  fs.appendFileSync(LOG_FILE, message);
  console.log(message);
}

async function runTask() {
  logMessage("Launching Puppeteer browser...");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  logMessage("Navigating to target URL...");
  await page.goto('https://browser.lol/create', { waitUntil: 'networkidle0' });
  
  logMessage("Waiting 10 seconds after page load...");
  await page.waitForTimeout(20000);

  logMessage("Injecting automation code...");
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

  logMessage("Automation code injected. Waiting 30 seconds for scheduled events...");
  await page.waitForTimeout(30000);

  logMessage("Closing browser...");
  await browser.close();
  logMessage("Browser closed. Task iteration complete.");
}

(async () => {
  while (true) {
    try {
      // Clear the log file at the start of each iteration so that logs don't accumulate
      fs.writeFileSync(LOG_FILE, '');
      logMessage("Starting new iteration...");
      await runTask();
    } catch (error) {
      logMessage("Error during task execution: " + error);
    }
  }
})();
