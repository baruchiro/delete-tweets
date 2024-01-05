# Delete Your Old Tweets, Retweets And Likes

1. this application will require [NodeJS](https://nodejs.org/en/download/current) and [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) to run
1. [Download your Twitter archive](https://twitter.com/settings/download_your_data), which contains all your tweets.
2. Locate the JSON contains your tweets, which is `data/tweet.js` (`data/like.js` or `data/twitter-circle-tweet.js`) in the archive.

3. Choose one of the following

## To Delete tweets
1. Run this project with `yarn && yarn start data/tweet.js`.
2. It will wait you for login
3. After login, it will delete all your tweets.

## To Delete Twitter circle tweets
1. Run this project with `yarn && yarn start data/twitter-circle-tweet.js`.
2. It will wait you for login
3. After login, it will delete all your circle tweets.


## To Unlike previously Liked tweets
1. Run this project with `yarn && yarn start data/like.js`.
2. It will wait you for login
3. After login, it will unlike your likes.


## Commandline Arguments

| argumensts  |  |
| ------------- |:-------------:|
| -d, --debug     			| writes debug information to log file     |
| -l, --log       			| writes log information to log file     |
| -e, --exlog      			| writes all information from log and debug to log file     |
| -n, --nolog      			| forces app to run without making a log file, could be helpful if removing large amounts of tweets/retweets/likes |
| -s, --skip <number>       | skips up to the index given, good if you had to close the app or it crashed and don't have time to rerun the entire file |
| -w, --wait <number>       | the delay used between actions, try not to use below 5000ms as this could cause rate limiting |
| -t, --timeout <number>    | the timeout amount used after tweet is loaded (helpful on low bandwidth connections), try not to use below 5000ms as this could cause rate limiting |