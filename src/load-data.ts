declare global {
  interface Window {
    YTD: {
      twitter_circle_tweet: TweetsCollection;
      tweets: TweetsCollection;
	  like: LikesCollection
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

type LikesCollection = {
  [key: string]: {
    like: {
      tweetId: string;
      expandedUrl: string;
    };
  }[];
};

// @ts-ignore
global.window = {
  YTD: {
    twitter_circle_tweet: {},
    tweets: {},
	like:{},
  },
} as { YTD: { twitter_circle_tweet: any; tweets: any; like: any} };

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
  if (Object.keys(global.window.YTD.like).length) {
    console.log("Found likes");
    return extractLikes(global.window.YTD.like);
  }
  console.log("No tweets found");
  throw new Error("No tweets found");
};

const extractTweets = (tweets: TweetsCollection) => {
  return Object.values(tweets).flatMap((arr) =>
    arr.map((obj) => ({
      id: obj.tweet.id,
      isReply: !!obj.tweet.in_reply_to_status_id,
    }))
  );
};
const extractLikes = (like: LikesCollection) => {
  return Object.values(like).flatMap((arr) =>
    arr.map((obj) => ({
      tweetId: obj.like.tweetId,
	  expandedUrl: obj.like.expandedUrl,
    }))
  );
};
