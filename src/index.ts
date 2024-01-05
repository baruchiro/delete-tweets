import { program } from "commander";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { loadData } from "./load-data";
import { prompt } from "./utils/terminal";


var fileValue;


program
	.arguments("<file>")
	//this is here because for some reason it doesn't parse the file properly?
	.action(function(file) {
		fileValue = file;
	})
	
	.option("-d, --debug",
	"writes debug information to log file"
	)
	
	.option("-l, --log",
	"writes log information to log file",
	false
	)
	
	.option("-e, --exlog",
	"writes all information from log and debug to log file",
	true
	)
	
	.option("-n, --nolog",
	"forces app to run without making a log file, could be helpful if removing large amounts of tweets/retweets/likes"
	)
	
	.option(
	"-s, --skip <number>",
	"skips up to the index given, good if you had to close the app or it crashed and don't have time to rerun the entire file",
	"0"
	)
	
	.option(
	"-t, --timeout <number>",
	"the timeout amount used after tweet is loaded (helpful on low bandwidth connections), try not to use below 5000ms as this could cause rate limiting",
	"5000"
	)
	
	.option("-w, --wait <number>",
	"the delay used between actions, try not to use below 5000ms as this could cause rate limiting",
	"5000");

program.parse();

const options = program.opts();
const log = options.log;
const extended_error = options.exlog;
const skipTo = parseInt(options.skip);
const timeout_amount = parseInt(options.timeout);
const delay_amount = parseInt(options.wait);
const jsonFileInput = path.resolve(process.cwd(), fileValue /*options.file*/);//again not sure if broken or just something wrong with my install
const log_name = Date.now() + "_log.txt";

(async () => {
  

  //create new log file
	if (log || extended_error){
		fs.writeFileSync(log_name, "Process Started");
		fs.appendFileSync(log_name, "\n" + process.argv);
	}
  
  
  var tweets;
  var isLikes;

  //checks for .js files
  try {
    tweets = await loadData(jsonFileInput);
    console.log(`Found ${tweets.length} tweets`);
    isLikes = !(typeof tweets[0].tweetId === "undefined");
  } catch (e) {
    console.log("No tweet.js, twitter-circle-tweet.js or like.js, Exiting Program");
    process.exit(0);
  }

  //browser instance
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://twitter.com/");

  //wait for interaction
  await prompt("Login and press enter to continue...");

  //check if user is logged in by clicking on the profile button
  try {
    await page.click('a[data-testid="AppTabBar_Profile_Link"');
    page.waitForNavigation({ timeout: timeout_amount });
  } catch (error) {
    //might not always be a not logged in issue but in the case it's not log the error to see if we can fix it
    if (extended_error) fs.appendFileSync(log_name, "\n" + error);

    //print to screen and exit log
    console.log("Not logged in, Exiting Program");
    console.log(error);

    //close browser and the process
    await browser.close();
    process.exit(0);
  }

  //only require to see where you are in the list
  var tweet_index = 0;

  for (const tweet of tweets) {
    tweet_index++;
    if (tweet_index < skipTo) continue;
    if (isLikes) {
      await page.goto(`https://twitter.com/x/status/${tweet.tweetId}`);
      try {
        //check for options menu, if it times out we log the error and continue to next instance
        const options = await page.waitForSelector('article[data-testid="tweet"][tabindex="-1"] div[aria-label=More]', {
          visible: true,
          timeout: timeout_amount,
        });
        await delay(delay_amount);

        try {
          //check if its a liked tweet if it is un-like it
          await page.click('div[data-testid="unlike"]');
          await delay(delay_amount * 2);

          //log it
          console.log("unliked, " + tweet_index);
          if (log) fs.appendFileSync(log_name, "\n" + "un-retweeted: #" + tweet_index + " ID: " + tweet.tweetId);
        } catch (error) {
          //log error and continue on
          console.log("Error: probably already unliked");
          if (log) fs.appendFileSync(log_name, "\n" + "Errored: #" + tweet_index + " ID: " + tweet.tweetId);
          if (extended_error) fs.appendFileSync(log_name, "\n" + error);
          console.log(error);
        }
      } catch (error) {
        // log error and continue on
        console.log("Error: tweet unavalible");
        if (log) fs.appendFileSync(log_name, "\n" + "Errored: #" + tweet_index + " ID: " + tweet.tweetId);
        if (extended_error) fs.appendFileSync(log_name, "\n" + error);
        console.log(error);
      }
    } else {
      await page.goto(`https://twitter.com/x/status/${tweet.id}`);
      try {
        //check for options menu, if it times out we log the error and continue to next instance
        const options = await page.waitForSelector('article[data-testid="tweet"][tabindex="-1"] div[aria-label=More]', {
          visible: true,
          timeout: timeout_amount,
        });
        await delay(delay_amount);
        try {
          //check if its a retweet if it is un-retweet it
          await page.click('div[data-testid="unretweet"]');
          await delay(delay_amount);

          //confirm un-retweet
          await page.click('div[data-testid="unretweetConfirm"]');
          await delay(delay_amount);

          //log it
          console.log("Unretweeted, " + tweet_index);
          if (log) fs.appendFileSync(log_name, "\n" + "un-retweeted: #" + tweet_index + " ID: " + tweet.id);
          await delay(delay_amount);
        } catch (
          e //if its not a retweet continue to tweet delete
        ) {
          // click on the first found selector
          await options?.click();
          await delay(delay_amount);

          // select delete
          await page.click('div[data-testid="Dropdown"] > div[role="menuitem"]');
          await delay(delay_amount);

          // confirm delete
          await page.click('div[data-testid="confirmationSheetConfirm"]');
          await delay(delay_amount);

          //log it
          console.log("Deleted, " + tweet_index);
          if (log) fs.appendFileSync(log_name, "\n" + "Deleted: #" + tweet_index + " ID: " + tweet.id);
        }
      } catch (error) {
        // log error and continue on
        console.log("Error: probably already deleted");
        if (log) fs.appendFileSync(log_name, "\n" + "Errored: #" + tweet_index + " ID: " + tweet.id);
        if (extended_error) fs.appendFileSync(log_name, "\n" + error);
        console.log(error);
      }
    }
  }
  // close browser
  await browser.close();
})();

// delay function to help avoid any rate limiting or slow connection issues
function delay(ms: number) {
  //only here just to do a quick skip
  if (ms == 0) return;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
