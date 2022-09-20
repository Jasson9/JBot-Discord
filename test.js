const ytsr = require("yt-search");

async function search(keyword){
    var res = await ytsr(keyword);
    console.log(res)
} 
search("bad guy")