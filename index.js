const express = require('express');
const puppeteer = require('puppeteer');

const PORT = process.env.PORT || 3000;
const app = express();

app.get('/', (req, res) => res.send('Puppeteer automation is running!'));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

async function runTask() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://testingimp.great-site.net', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
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
    function clickLaunchButton() {
      let launchButton = document.querySelector("button.btn.btn-primary.w-100pc.m-2");
      if (launchButton) {
        launchButton.click();
        console.log("Launch button clicked!");
        setTimeout(clickExitButton, 15000);
      } else {
        console.error("Launch button not found!");
      }
    }
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
    function clickDeleteButton() {
      let deleteButton = document.querySelector('button.col.btn.btn-outline-danger');
      if (deleteButton) {
        deleteButton.click();
        console.log("Delete button clicked.");
      } else {
        console.error("Delete button not found!");
      }
    }
    setInputValue();
  });
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
