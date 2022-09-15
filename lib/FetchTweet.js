const request = require('request');

function FetchTweet(UserID) {
    var variables = {
        "userId": UserID,
        "count": 5,
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
                "authorization": "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
                "content-type": "application/json",
                "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Microsoft Edge\";v=\"103\", \"Chromium\";v=\"103\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-csrf-token": "0d9f0891b1abe00615bdeb41619a1b12",
                "x-twitter-active-user": "yes",
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-language": "id",
                "cookie": "guest_id_marketing=v1:165864897623384747; guest_id_ads=v1:165864897623384747; personalization_id='v1_l8iMR2K5xdUH0tUSg46HAw=='; guest_id=v1:165864897623384747; ct0=0d9f0891b1abe00615bdeb41619a1b12; gt=1551112385129500673; _ga=GA1.2.849443291.1658648931; _gid=GA1.2.1261699421.1658648931"
            }
        }, function (error, response, body) {
            if(error){
                reject(error);
            }
            try {
                //console.log(body)
                body = JSON.parse(body)
                resolve(body)
            } catch (error) {
                reject(error)
            }
        })
    })
};


FetchTweet("1328277233492844544").then(res=>{
    console.log(res.data.user.result.timeline_v2.timeline.instructions[1].entries[0].content.itemContent.tweet_results.result.legacy)
})