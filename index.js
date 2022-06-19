const request = require("request");
require('dotenv').config();

const {PubSub} = require('@google-cloud/pubsub');
const process = require('process');

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

let timeout = 0;

const streamURL = new URL(
  "https://api.twitter.com/2/tweets/sample/stream?tweet.fields=created_at,lang"
);





async function publishMessage(data,topicNameOrId,pubSubClient) {
// Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
const dataBuffer = Buffer.from(JSON.stringify(data));

try {
    const messageId = await pubSubClient
    .topic(topicNameOrId)
    .publishMessage({data: dataBuffer});
    console.log(`Message ${messageId} published.`);
    
} catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
}
// process.emit('SIGINT');
}




const sleep = async (delay) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), delay));
};

const streamTweets = (token,pubSubClient,topicNameOrId) => {
  let stream;

  const config = {
    url: streamURL,
    auth: {
      bearer: token,
    },
    timeout: 31000,
  };

  try {
    stream = request.get(config);

    stream
      .on("data", (data) => {
        try {
          const json = JSON.parse(data);
          if (json.connection_issue) {
            reconnect(stream, token);
          } else {
            if (json.data) {
                // console.log(json);
                if(json.data.lang === 'hi'){
                  // console.log(json.data.lang);
                  publishMessage(json,topicNameOrId,pubSubClient);
                  console.log('Tweet added');
                }
                
                // firebase or pubsub
                
            } else {
                console.log('Auth Error');
            }
          }
        } catch (e) {
            console.log('heartbeat');
        }
      })
      .on("error", (error) => {
        console.log({error: error})
        reconnect(stream, token,pubSubClient,topicNameOrId);
      });
  } catch (e) {
    console.log('Auth Error');
  }
  return stream;
};

const reconnect = async (stream, token,pubSubClient,topicNameOrId) => {
  timeout++;
  stream.abort();
  await sleep(2 ** timeout * 1000);
  streamTweets(token,pubSubClient,topicNameOrId);
};

(function(){
    const token = BEARER_TOKEN;
    const topicNameOrId = 'tweet-extractor';
    const pubSubClient = new PubSub();
    // publishMessage({"data":{"created_at":"2022-06-18T16:17:04.000Z","id":"test","lang":"hi","text":"test"}},topicNameOrId,pubSubClient)
    let stream = streamTweets(token,pubSubClient,topicNameOrId);
    process.on('SIGINT', function () {
        try{
            stream.abort();
        }catch(e){
            process.exit();
        } 
    }); 
    process.on('SIGTERM', function () {
        try{
            stream.abort();
        }catch(e){
            process.exit();
        } 
    }); 
    process.on('uncaughtException', function(e) {
        try{
            stream.abort();
        }catch(e){
            process.exit();
        } 
      }); 
})();
