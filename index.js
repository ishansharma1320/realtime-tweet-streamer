const request = require("request");
const { SNSClient, AddPermissionCommand } = require("@aws-sdk/client-sns");
require('dotenv').config();

const {PubSub} = require('@google-cloud/pubsub');
const process = require('process');

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
// const ACCESS_KEY = process.env.AWS_SERVER_PUBLIC_KEY;
// const ACCESS_SECRET = process.env.AWS_SERVER_SECRET_KEY;
const token = BEARER_TOKEN;
// const topicNameOrId = 'tweet-extractor';
let pubSubClient = new PubSub();
let timeout = 0;

const streamURL = new URL(
  "https://api.twitter.com/2/tweets/sample/stream?tweet.fields=created_at,lang"
);





async function publishMessage(data,pubSubClient) {
// Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
const dataBuffer = Buffer.from(JSON.stringify(data));
const topic = 'tweet-extractor';
try {
    const messageId = await pubSubClient
    .topic(topic)
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

const streamTweets = (token,pubSubClient) => {
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
                  publishMessage(json,pubSubClient);
                  console.log('Tweet added');
                }
                
                // firebase or pubsub
                
            } else {

                console.log('Auth Error');
		            reconnect(stream, token);
            }
          }
        } catch (e) {
            console.log('heartbeat');
        }
      })
      .on("error", (error) => {
        console.log({error: error})
        reconnect(stream, token);
      });
  } catch (e) {
    console.log('Auth Error');
    reconnect(stream, token);
  }
  return stream;
};

const reconnect = async (stream, token) => {
  timeout++;
  stream.abort();
  await sleep(2 ** timeout * 1000);
  pubSubClient = new PubSub();
  streamTweets(token,pubSubClient);
};

(function(){
    let stream = streamTweets(token,pubSubClient);
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
