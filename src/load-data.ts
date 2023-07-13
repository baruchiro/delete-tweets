type TweetsCollection = {
  [key: string]: {
    tweet: {
      id: string;
    };
  }[];
};

declare global {
  interface Window {
    YTD: {
      twitter_circle_tweet: TweetsCollection;
      tweets: TweetsCollection;
    };
  }
}

// @ts-ignore
global.window = {
  YTD: {
    twitter_circle_tweet: {},
    tweets: {},
  },
} as { YTD: { twitter_circle_tweet: any; tweets: any } };

export const loadData = async (file: string) => {
  await import(file);
  console.log("Data loaded");
  if (Object.keys(global.window.YTD.twitter_circle_tweet).length) {
    console.log("Found twitter_circle_tweet");
    return getCircleTweets();
  }
  if (Object.keys(global.window.YTD.tweets).length) {
    console.log("Found tweets");
    return getTweets();
  }
  console.log("No tweets found");
  throw new Error("No tweets found");
};

const getCircleTweets = () => {
  return Object.values(global.window.YTD.twitter_circle_tweet).flatMap((arr) =>
    arr.map((obj) => obj.tweet.id)
  );
};

const getTweets = () => {
  return Object.values(global.window.YTD.tweets).flatMap((arr) => arr.map((obj) => obj.tweet.id));
};
