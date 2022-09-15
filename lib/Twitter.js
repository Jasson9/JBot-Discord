const request = require('request');
const config = require('../Config.json' )
var oauth = {
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    token: config.accessToken,
    token_secret: config.secrettoken
}

function TweetLookup(id) {
    return new Promise((resolve, reject) => {
        request.get(`https://api.twitter.com/2/tweets/${id}?expansions=author_id`, {
            oauth: oauth,
            headers: {
                "user-agent": 'node-twitter/1.1',
                Accept: '*/*'
            }
        }, function (err, res, body) {
            if (err) {
                reject(err)
            }
            resolve(body)
        })
    })
}

function uploadpicture(mediabuffer) {
    return new Promise((resolve, reject) => {
        request.post("https://upload.twitter.com/1.1/media/upload.json", {
            oauth: oauth,
            headers: {
                "user-agent": 'node-twitter/1.1',
                Accept: '*/*',
                Connection: 'close',
                "Content-Type": 'application/octet-stream'
            },
            formData: {
                media: mediabuffer
            }
        }, function (err, res, body) {
            if (err) {
                reject(err);
            }
            resolve(body)
        })
    })
}

function Tweet(text, mediaids) {
    var payload = {
        "text": text
    };
    if (mediaids!=null) { //probably will be change later
        payload["media"] = {
            media_ids: [mediaids]
        }
    }
    //console.log(payload)
    return new Promise((resolve, reject) => {
        request.post("https://api.twitter.com/2/tweets", {
            oauth: oauth,
            json: payload,
            headers: {
                "user-agent": 'node-twitter/1.1',
                Accept: 'application/json',
                "Content-Type": 'application/json'
            }
        }, function (err, res, body) {
            if (err) {
                console.log(err)
                reject(err);
            }
            console.log(body)
            resolve(body)
        })
    })
}

function Getsettings() {
    return new Promise((resolve, reject) => {
        request.get("https://api.twitter.com/1.1/account/settings.json", {
            oauth: oauth,
            headers: {
                "user-agent": 'node-twitter/1.1',
                Accept: 'application/json'
            }
        }, function (err, res, body) {
            console.log(body)
            if (err) {
                reject(err);
            }
            resolve(body);
        })
    })
}

//not using twitter dev api, use twitter graphql api instead. planned on changing this
function FetchTweet(UserID) {
    var variables = {
        "userId": UserID,
        "count": 1,
        "includePromotedContent": true,
        "withQuickPromoteEligibilityTweetFields": true,
        "withSuperFollowsUserFields": true,
        "withDownvotePerspective": false,
        "withReactionsMetadata": false,
        "withReactionsPerspective": false,
        "withSuperFollowsTweetFields": true,
        "withVoice": true,
        "withV2Timeline": true
    }

    return new Promise((resolve, reject) => {
        request.get(`https://twitter.com/i/api/graphql/gsEplCtOddY7tiK6cCZe9g/UserTweets?variables=${encodeURIComponent(JSON.stringify(variables))}&features=%7B%22dont_mention_me_view_api_enabled%22%3Atrue%2C%22interactive_text_enabled%22%3Atrue%2C%22responsive_web_uc_gql_enabled%22%3Afalse%2C%22vibe_api_enabled%22%3Afalse%2C%22responsive_web_edit_tweet_api_enabled%22%3Afalse%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D`, {
            headers: {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,id;q=0.8",
                "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
                "content-type": "application/json",
                "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Microsoft Edge\";v=\"103\", \"Chromium\";v=\"103\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-csrf-token": "ca70f83de5851b4dd830a12389393b6a0587b16423e9083b95f1afa0f9be6a742fdd4b7de588f403ae3698a65a948236b018909aef2c705f485733279957ad4ca436eca1ba6c4644d8d775327df62c82",
                "x-twitter-active-user": "yes",
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-language": "id",
                "cookie": "guest_id_marketing=v1%3A165485249288634167; guest_id_ads=v1%3A165485249288634167; g_state={\"i_l\":0}; kdt=PTZXHffjIv8a5wHyXfYeoMwuAH4wICrgPhXjjPq7; des_opt_in=Y; _gcl_au=1.1.364876809.1658291858; _ga_BYKEBDM7DS=GS1.1.1658306425.2.1.1658306546.0; mbox=PC#b3528da1237b4b1993e6f6014c173030.38_0#1721730620|session#663adad1a99a4f4f980141d238039e3b#1658487680; _ga_34PHSZMC42=GS1.1.1658485828.12.0.1658485828.0; _ga=GA1.2.795940999.1654852497; ads_prefs=\"HBERAAA=\"; auth_multi=\"1549615012469420033:98357c3ff14285acf9d9c53660a5209e9d1cb6cc\"; auth_token=0ccaf8350736fa5f0a584ef8d1e791e72738837b; personalization_id=\"v1_NuHvVLn3egTZWjgISOlYpw==\"; guest_id=v1%3A165848790816720134; twid=u%3D1232336303364034562; ct0=ca70f83de5851b4dd830a12389393b6a0587b16423e9083b95f1afa0f9be6a742fdd4b7de588f403ae3698a65a948236b018909aef2c705f485733279957ad4ca436eca1ba6c4644d8d775327df62c82; _gid=GA1.2.1500552117.1658595272; external_referer=padhuUp37zjgzgv1mFWxJ12Ozwit7owX|0|8e8t2xd8A2w%3D; lang=id"
            }
        }, function (error, response, body) {
            if(error){
                reject(error);
            }
            resolve(body);
        })
    })
};

function getUserIDfromScreenName(){
    
}
module.exports = {
    Tweet,
    FetchTweet,
    uploadpicture,
    TweetLookup,
    Getsettings
}