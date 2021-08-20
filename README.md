# Ravencoin Twitter Bot

**Elevator Pitch**: This example uses the Twitter API to send Ravencoin assets/tokens to anyone who reply with their address.

Purely for educational purposes.

Brought to you by RavenRebels https://github.com/ravenrebels

Getting started video: https://www.youtube.com/watch?v=DZMrnjVQQzs

## Getting started summary
- register a developer account over at Twitter
- Setup a full Ravencoin node
- Download Node.js
- Checkout/Download the code

## Register as developer over at Twitter

Register as developer at https://developer.twitter.com/ \
It takes some time to be approved

## Setup a Ravencoin full node

The node has to run in server mode, here is an example configuration

```# Accept command line and JSON-RPC commands.
server=1
whitelist=127.0.0.1
rpcallowip=127.0.0.1
txindex=1
addressindex=1
assetindex=1
timestampindex=1
dbcache=2048
# Username for JSON-RPC connections
rpcuser=notsharingthatone

# Password for JSON-RPC connections
rpcpassword=notsharingthatone
```

## Node.js

You need to have Node.js https://nodejs.org/en/ installed

## GIT CLONE

You need to have git installed

To download the code run\
`git clonse GITHUB_URL`

## Install code dependencies

In the "git cloned" directy, run\
```npm install ```

## Configure your project
Create a file called CONFIG.json.\
Example
```
{
  "bearer": "FAKE_FAKE_AAAAAasdfasdfyMSAEAAAAABQasdfasdfeIasdfasdfDincauODaKCasdfasdffXkA3001KLcQUps02bAeasdfasdf4g",
  "interval": 20,
  "rpcUsername": "myVerySecretUsername",
  "rpcPassword": "myMegaSecretPassword",
  "rpcURL": "http://127.0.0.1:8766",
  "RAVENCOIN_ASSET_NAME": "HOPIUM",
  "scanMinutesBackInTime": 5,
  "tweetId": "1111222233334444"
}
```
- **scanMinutesBackInTime** dictates how far back in time (history) in minutes Twitter should give us replies. 10 means give us all replies for the last 10 minutes. Try to keep this low because Twitter has a cap limit, how many tweets you can read.
- **interval** dictates how often (seconds) you want to check for new replies over at Twitter.
- **bearer** is your Twitter project/apps Bearer token

NOTE: we ask twitter every **interval** seconds to give us all the tweet/replies for the last **scanMinutesBackInTime** minutes.
This affects your quota, performance cap over at Twitter.
Twitter has a limit for about 500.000 reads per month.
Try to keep **scanMinutesBackInTime** low.

## Start
- Your Ravencoin node should be up and running
- Publish a tweet, copy the id and add it to CONFIG.json under "tweetId"

Start the script, from the command prompt

```node index ```
