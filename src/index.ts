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

  for (const tweet of tweets) {
    await page.goto(`https://twitter.com/baruchiro/status/${tweet.id}`);
    const options = await page.waitForSelector('article[data-testid="tweet"][tabindex="-1"] div[aria-label=More]', { visible: true });
    // click on the first found selector
    await options?.click();
    await page.click('div[data-testid="Dropdown"] > div[role="menuitem"]');
    await page.click('div[data-testid="confirmationSheetConfirm"]');
  }

  await browser.close();
})();
