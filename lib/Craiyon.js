const request = require('request');
const fs = require('fs');

/**
 * 
 * @param {string} text 
 * @returns {Objects} Array of Buffers
 */
function GenerateImage(text, amount = 9) {
    const payload = {
        "prompt": text
    }
    return new Promise((resolve, reject) => {
        request.post(`https://backend.craiyon.com/generate`, {
            body: JSON.stringify(payload),
            headers: {
                'Host': 'backend.craiyon.com',
                'Sec-Ch-Ua': '" Not;A Brand";v="99", "Microsoft Edge";v="103", "Chromium";v="103"',
                'Accept': 'application/json',
                'Dnt': '1',
                'Content-Type': 'application/json',
                'Sec-Ch-Ua-Mobile': '?0',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36 Edg/103.0.1264.62',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Origin': 'https://www.craiyon.com',
                'Sec-Fetch-Site': 'same-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'en-US,en;q=0.9,id;q=0.8'
            },
            gzip: true
        },
            function (err, res, body) {
                if (err) {
                    reject(err);
                }
                try {
                    var images = JSON.parse(body)['images'];
                    var decodedimg = [];
                    var counter = 0;
                    images.forEach(image => {
                        if (counter < amount) {
                            decodedimg.push(Buffer.from(image, 'base64'));
                        }
                        counter++;
                    });
                    resolve(decodedimg)
                } catch (error) {
                    reject(error)
                }
            })
    })
}

/**
 * @param {Objects} Buffers
 * @param {String} Name 
 */
function SaveImage(Buffers, Name) {
    if (!Name) {
        Name = Date.now();
    }
    for (var i = 0; i < Buffers.length; i++) {
        fs.writeFileSync(`${Name}-${i}.png`, Buffers[i])
    }
}

module.exports = {
    GenerateImage,
    SaveImage
}

