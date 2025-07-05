const puppeteer = require('puppeteer');

async function getRenderedHtml(url) {
  const browser = await puppeteer.launch({ headless: true }); // Set to true for no visible browser window
  const page = await browser.newPage();

  try {
    // Navigate to the URL and wait until the network is idle (page fully loaded)
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Get the full HTML content of the page after JavaScript execution
    const html = await page.content();
    console.log(html);
  } catch (error) {
    console.error('Error fetching page:', error);
  } finally {
    await browser.close();
  }
}

// Call the function with the URL of your running React app
// Ensure your React app is running on http://localhost:3000 before executing this script
getRenderedHtml('http://localhost:3000');
