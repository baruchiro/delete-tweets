import puppeteer from "puppeteer";
import { prompt } from "./utils/terminal";
import path from "path";
import { loadData } from "./load-data";

const jsonFileInput = path.resolve(process.cwd(), process.argv[2]);

(async () => {
  const tweets = await loadData(jsonFileInput);
  console.log(`Found ${tweets.length} tweets`);
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://twitter.com/");

  await prompt("Login and press enter to continue...");

  for (const tweetId of tweets) {
    await page.goto(`https://twitter.com/baruchiro/status/${tweetId}`);
    await page.waitForSelector('article[role="article"] div[aria-label=More]');
    // click on the first found selector
    await page.click('article[role="article"] div[aria-label=More]');
    await page.click('div[data-testid="Dropdown"] > div[role="menuitem"]');
    await page.click('div[data-testid="confirmationSheetConfirm"]');
  }

  await browser.close();
})();
