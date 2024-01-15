declare global {
  interface Window {
    YTD: {
      twitter_circle_tweet: TweetsCollection;
      tweets: TweetsCollection;
    };
  }
}

type TweetsCollection = {
  [key: string]: {
    tweet: {
      id: string;
      in_reply_to_status_id?: string;
    };
  }[];
};

// @ts-expect-error - We don't care about the window object
global.window = {
  YTD: {
    twitter_circle_tweet: {},
    tweets: {},
  },
} as Window;

export const loadData = async (file: string) => {
  await import(file);
  console.log("Data loaded");
  if (Object.keys(global.window.YTD.twitter_circle_tweet).length) {
    console.log("Found twitter_circle_tweet");
    return extractTweets(global.window.YTD.twitter_circle_tweet);
  }
  if (Object.keys(global.window.YTD.tweets).length) {
    console.log("Found tweets");
    return extractTweets(global.window.YTD.tweets);
  }
  console.log("No tweets found");
  throw new Error("No tweets found");
};

const extractTweets = (tweets: TweetsCollection) => {
  return Object.values(tweets).flatMap((arr) =>
    arr.map((obj) => ({
      id: obj.tweet.id,
      isReply: !!obj.tweet.in_reply_to_status_id,
    })),
  );
};
