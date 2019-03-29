const puppeteer = require("puppeteer");
const axios = require('axios');

async function main(pageId, start) {
    console.log(start);
    var output = [];
    const browser = await puppeteer.launch({
        headless: true
    });
    console.log(`Loading PageId ${pageId}`);
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
        if (req.resourceType() === "stylesheet" || req.resourceType() === "font" || req.resourceType() === "image" || req.resourceType() === "script") {
            req.abort();
        } else {
            req.continue();
        }
    });

    page.setUserAgent("Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3571.0 Mobile Safari/537.36");
    await page.goto(`https://steamcommunity.com/sharedfiles/filedetails/?id=${pageId}`);
    const elem = "div.workshopItemTitle";
    await page.waitForSelector(elem, {
        timeout: 4000
    });
    var commentID = await page.$eval(".commentthread_area", id => id.id);
    var commentids = /([0-9]+_[0-9]+)/.exec(commentID);
    var data = "";
    await getTotalComments(`https://steamcommunity.com/comment/PublishedFile_Public/render/${commentids[0].split('_')[0]}/${commentids[0].split('_').pop()}?start=${start}`).then(out => {
        data = out;
    }).catch(e => console.error(e));
    var comments = [];
    comments.push(data);
    await browser.close();
    return new Promise(resolve => {
        resolve(comments);
    });
};

async function getTotalComments(url) {
    console.log(url);
    return new Promise((resolve, reject) => {
        axios.post(url).then((data) => {
            resolve(data.data);
        }).catch(e => reject(e));
    });
}

module.exports = {
    main: main
}