const https = require('https');
function download(url) {
    return new Promise((resolve, reject) => {
        https.get(url, function (res) {
            const bufferarray = [];
            res.on("data", (chunk) => {
                console.log(bufferarray);
                bufferarray.push(chunk);
            }).on("end", chunk => {
                var finalbuffer = Buffer.concat(bufferarray);
                resolve(finalbuffer);
            }).on("error", error => {
                reject(error);
            })
        });
    })
}

module.exports = {
    download
}