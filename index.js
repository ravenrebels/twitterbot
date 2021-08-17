/*
    Read replies of a tweet.
    If a reply contains a valid Ravencoin address, send an asset to that address

    Store all replies in a JSON file to keep track of which replies we have processed
*/
const axios = require("axios");
const fs = require("fs");

const CONFIG = require("./CONFIG.json");

//HEALTHCHECK
if (!CONFIG.RAVENCOIN_ASSET_NAME) {
  console.error("CONFIG.json does not contain RAVENCOIN_ASSET_NAME");
  process.exit(1);
}
if (!CONFIG.tweetId) {
  console.error("CONFIG.json does not tweetId");
  process.exit(1);
}

const conversationId = CONFIG.tweetId;
const DB_FILENAME = `./db_${conversationId}.json`;

async function getTweetResponses() {
  //More info about Twitter API and conversation id
  //https://developer.twitter.com/en/docs/twitter-api/conversation-id

  //NOTE: we ask for replies for the last 60 minutes
  //Twitter has a limit on 100 replies so 60 min should do
  //Change that how you like
  
  let oneHourBefore = new Date();
  oneHourBefore.setHours(oneHourBefore.getHours() - 1);
  const dateString = oneHourBefore.toISOString();
  console.log("Loading tweet replies from", oneHourBefore);
  const URL =
    "https://api.twitter.com/2/tweets/search/recent?" +
    `query=conversation_id:${conversationId}` +
    `&max_results=100&start_time=${dateString}&tweet.fields=author_id,conversation_id,created_at,in_reply_to_user_id,referenced_tweets` +
    "&expansions=author_id,in_reply_to_user_id,referenced_tweets.id&user.fields=name,username";

  //Authorization Bearer is used to authenticate your Twitter application
  //https://developer.twitter.com/en/docs/authentication/oauth-2-0/bearer-tokens
  const twitterPromise = axios.get(URL, {
    headers: {
      Authorization: `Bearer ${CONFIG.bearer}`,
    },
  });

  const responsePromise = new Promise((resolve, reject) => {
    twitterPromise.then((response) => {
      //Extract what we need, that is the list of replies
      resolve(response.data.data);
    });
    twitterPromise.catch(reject);
  });
  return responsePromise;
}
async function work() {
  //Validate connection to Ravencoin node
  try {
    await rpc("validateaddress", ["fakeaddress"]);
  } catch (e) {
    console.log(e);
    console.error(
      "Could not connect to Ravencoin node, please verify rpcURL/rpcPassword and rpcURL in CONFIG.json",
      e
    );
    process.exit(1);
  }

  //Create DB file if doesn't exist
  if (!fs.existsSync(DB_FILENAME)) {
    const emptyObject = {};
    fs.writeFileSync(DB_FILENAME, JSON.stringify(emptyObject));
  }
  const db = require(DB_FILENAME);

  //Store each reply in DB
  const replies = await getTweetResponses();
  console.log("Replies length", Object.keys(replies).length);
  replies.map(function (reply) {
    //Add reply to DB if does not exist
    if (!db[reply.id]) {
      db[reply.id] = reply;
    }
  });
  saveDB(db);

  //Iterate over each reply and send asset/token if needed
  for (const key in db) {
    const reply = db[key];

    //if we have a transaction id that means that we have sent stuff to this "reply" already
    if (reply.RAVEN_transactionId) {
      continue;
    }

    //Check if tweet contains a Ravencoin address
    for (const text of reply.text.split(/\s+/)) {
      if (text.length < 20) {
        continue;
      }
      const asdf = await rpc("validateaddress", [text]);
      if (asdf.isvalid === true) {
        try {
          console.log("Found valid Ravencoin address in tweet", text, reply.id);
          const asset = CONFIG.RAVENCOIN_ASSET_NAME;
          const quantity = 1;
          const toAddress = text;
          const transactionId = await rpc("transfer", [
            asset,
            quantity,
            toAddress,
          ]);
          reply.RAVEN_transactionId = transactionId;
        } catch (e) {}
      }
    }

    saveDB(db);
  }
}
function saveDB(db) {
  fs.writeFileSync(DB_FILENAME, JSON.stringify(db, null, 4));
}

async function rpc(method, params) {
  const promise = new Promise((resolutionFunc, rejectionFunc) => {
    const options = {
      auth: {
        username: CONFIG.rpcUsername,
        password: CONFIG.rpcPassword,
      },
    };
    const data = {
      jsonrpc: "1.0",
      id: "n/a",
      method,
      params,
    };

    try {
      const rpcResponse = axios.post(CONFIG.rpcURL, data, options);

      rpcResponse.then((re) => {
        const result = re.data.result;
        resolutionFunc(result);
      });
      rpcResponse.catch((e) => {
        rejectionFunc(e.response.data);
      });
    } catch (e) {
      rejectionFunc(e);
    }
  });
  return promise;
}

work();
 
setInterval(work, CONFIG.interval * 1000);
