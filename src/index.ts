import puppeteer from "puppeteer";
import { prompt } from "./utils/terminal";
import path from "path";
import { loadData } from "./load-data";

const jsonFileInput = path.resolve(process.cwd(), process.argv[2]);


//only required to write a log
const fs = require('fs');
const log_name = Date.now() + '_log.txt';

//debug functions
const log = false;
const extended_error = true;

//basic delays and timeout
const delay_amount = 5000;
const timeout_amount = 5000;



(async () => {
	//checks for .js files
	var tweets;
	try{
		tweets = await loadData(jsonFileInput);
		console.log(`Found ${tweets.length} tweets`);
	}catch(e){
		console.log("No tweet.js or twitter-circle-tweet.js, Exiting Program");
		process.exit(0);
	}
	
	//browser instance
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto("https://twitter.com/");
	
	delay(delay_amount);
	//click login button
	await page.click('a[data-testid="loginButton"');
	
	//create new log file
	fs.writeFileSync(log_name, 'Process Started');
	
	//wait for interaction
	await prompt("Login and press enter to continue...");
	
	//check if user is logged in by clicking on the profile button
	try{
		await page.click('a[data-testid="AppTabBar_Profile_Link"');
		page.waitForNavigation({ timeout: timeout_amount })
	}catch(error){
		//might not always be a not logged in issue but in the case it's not log the error to see if we can fix it
		if(extended_error)
			fs.appendFileSync(log_name, '\n' + error);
		
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
		await page.goto(`https://twitter.com/baruchiro/status/${tweet.id}`);
		try{
			//check for options menu, if it times out we log the error and contunue to next instance
			const options = await page.waitForSelector('article[data-testid="tweet"][tabindex="-1"] div[aria-label=More]', { visible: true, timeout: timeout_amount });
			await delay(delay_amount);
			try{
				//check if its a retweet if it is un-retweet it
				await page.click('div[data-testid="unretweet"]');
				await delay(delay_amount);
				
				//confirm un-retweet
				await page.click('div[data-testid="unretweetConfirm"]');
				await delay(delay_amount);
				
				//log it
				console.log("Unretweeted, " + tweet_index);
				if(log)
					fs.appendFileSync(log_name, '\n' + 'un-retweeted: #' + tweet_index + ' ID: ' + tweet.id);
				
			}catch(e) //if its not a retweet continue to tweet delete
			{
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
				if(log)
					fs.appendFileSync(log_name, '\n' + 'Deleted: #' + tweet_index + ' ID: ' + tweet.id);
			}
		}catch(error)
		{
			// log error and continue on
			console.log('Error: probably already deleted');
			if(log)
				fs.appendFileSync(log_name, '\n' + 'Errored: #' + tweet_index + ' ID: ' + tweet.id);
			if(extended_error)
				fs.appendFileSync(log_name, '\n' + error);
			console.log(error);
		}
	}
	// close browser
	await browser.close();
})();

// delay function to help avoid any rate limiting or slow connection issues
function delay(ms: number) {
	//only here just to do a quick skip
	if(ms ==0)
		return;
    return new Promise( resolve => setTimeout(resolve, ms) );
}