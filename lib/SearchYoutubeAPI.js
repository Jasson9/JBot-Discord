const request = require("request");


function parseTimeFromString(TimeString){
    var timeArr = TimeString.split(".");
    var seconds = 0;
    if(timeArr.length == 3){
        seconds += Number(timeArr[0].valueOf())*3600;
        seconds += Number(timeArr[1].valueOf())*60;
        seconds += Number(timeArr[2].valueOf());
    }
    
    if(timeArr.length == 2){
        seconds += Number(timeArr[0].valueOf())*60;
        seconds += Number(timeArr[1].valueOf());
    } 
    return seconds;
}


function SearchKeyword(keyword) {
    return new Promise((resolve, reject) => {
        request({
            uri: "https://www.youtube.com/youtubei/v1/search",
            method: "POST",
            body: `{"context":{"client":{"hl":"id","gl":"ID","remoteHost":"","deviceMake":"","deviceModel":"","visitorData":"","userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36,gzip(gfe)","clientName":"WEB","clientVersion":"2.20220921.08.00","osName":"Windows","osVersion":"10.0","originalUrl":"https://www.youtube.com/results","platform":"DESKTOP","clientFormFactor":"UNKNOWN_FORM_FACTOR","configInfo":{"appInstallData":""},"userInterfaceTheme":"USER_INTERFACE_THEME_DARK","timeZone":"Asia/Jakarta","browserName":"Chrome","browserVersion":"105.0.0.0","screenWidthPoints":950,"screenHeightPoints":932,"screenPixelDensity":1,"screenDensityFloat":1,"utcOffsetMinutes":420,"memoryTotalKbytes":"4000","mainAppWebInfo":{"graftUrl":"/results","pwaInstallabilityStatus":"PWA_INSTALLABILITY_STATUS_CAN_BE_INSTALLED","webDisplayMode":"WEB_DISPLAY_MODE_BROWSER","isWebNativeShareAvailable":true}},"user":{"lockedSafetyMode":false},"request":{"useSsl":true,"internalExperimentFlags":[],"consistencyTokenJars":[]},"clickTracking":{"clickTrackingParams":""}},"query":"${keyword}","category":"music"}`,
            headers: {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,id;q=0.8",
                "content-type": "application/json",
                "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Chromium\";v=\"105\", \"Google Chrome\";v=\"105.0.5195.127\"",
                "sec-ch-ua-arch": "\"x86\"",
                "sec-ch-ua-bitness": "\"64\"",
                "sec-ch-ua-full-version": "\"105.0.1343.42\"",
                "sec-ch-ua-full-version-list": "\"Microsoft Edge\";v=\"105.0.1343.42\", \" Not;A Brand\";v=\"99.0.0.0\", \"Chromium\";v=\"105.0.5195.127\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-model": "",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-ch-ua-platform-version": "\"15.0.0\"",
                "sec-ch-ua-wow64": "?0",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "same-origin",
                "sec-fetch-site": "same-origin",
                "x-goog-authuser": "0",
                "x-origin": "https://www.youtube.com",
                "x-youtube-bootstrap-logged-in": "true",
                "x-youtube-client-name": "1",
                "x-youtube-client-version": "2.20220921.08.00",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            }
        }, function (err, res, body) {
            //console.log(body)
            if(err)reject(err);
            var result = JSON.parse(body).contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
            var videos = [];
            for(var i = 0; i < result.length; i++){
                videos.push({
                    title : result[0].videoRenderer.title.runs[0].text,
                    thumbnail : result[0].videoRenderer.thumbnail.thumbnails[0].url,
                    url: "https://www.youtube.com/watch?v="+result[0].videoRenderer.videoId,
                    duration: parseTimeFromString(result[0].videoRenderer.lengthText.simpleText)
                })
            }
            resolve(videos)
        })
    })
}


module.exports={
    SearchKeyword
}