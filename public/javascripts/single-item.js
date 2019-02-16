const puppeteer = require("puppeteer");
const axios = require('axios');

async function main(pageId) {
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
    const title = await page.$eval("div.workshopItemTitle", name => name.innerText.trim());
    const desc = await page.$eval(".workshopItemDescription", description => description.innerHTML.trim());
    var img;
    try {
        img = await page.$eval(".workshopItemPreviewImageEnlargeableContainer img#previewImage", image => image.src);
    } catch (except) {
        img = await page.$eval(".workshopItemPreviewImageMain #previewImageMain", image => image.src);
    }
    const author = await page.$eval("#ig_bottom > div.breadcrumbs > a:nth-child(3)", user => user.innerText.trim().split('\'')[0]);
    console.log(author);
    const itemStats = await page.$$eval(".detailsStatRight", e => e.map((a) => a.innerText));
    var rating;
    try {
        rating = await page.$eval(".workshopItemDetailsHeader #detailsHeaderRight .ratingSection .numRatings", sRating => sRating.innerText.trim());
    } catch (except) {
        rating = await page.$eval(".workshopItemDetailsHeader #detailsHeaderRight .ratingSection", sRating => sRating.innerText.trim());
    }
    var ratingImg;
    try {
        ratingImg = await page.$eval(".workshopItemDetailsHeader #detailsHeaderRight .ratingSection .fileRatingDetails img", sRating => sRating.src);
    } catch (except) {
        ratingImg = "";
    }
    var commentID = await page.$eval(".commentthread_area", id => id.id);
    var commentids = /([0-9]+_[0-9]+)/.exec(commentID);
    var count = 0;
    await getTotalComments(`https://steamcommunity.com/comment/PublishedFile_Public/render/${commentids[0].split('_')[0]}/${commentids[0].split('_').pop()}/`).then(out => {
        count = parseInt(out);
    }).catch(e => console.error(e));
    const stats = await page.$$eval(".stats_table tr td:nth-child(odd)", e => e.map((a) => a.innerText));
    console.log(stats);
    output.push({
        Title: title,
        Author: author,
        Desc: desc,
        Img: img,
        Rating: rating,
        Info: itemStats,
        Stats: stats,
        RatingImg: ratingImg,
        Count: count
    });
    await browser.close();
    return new Promise(resolve => {
        resolve(output);
    });
};


async function getTotalComments(url) {
    return new Promise((resolve, reject) => {
        axios.post(url).then((data) => {
            resolve(data.data.total_count);
        }).catch(e => reject(e));
    });
}

module.exports = {
    main: main
}

//TODO: Finish Comment Section
//var commentCount = await page.$eval(".commentthread_count_label span", count => parseInt(count.innerText));
//console.log(`Comment Count ${commentCount}`);
//const comments = [];
//var getId = await page.$eval(".commentthread_area", id => id.id);
//getId = getId.replace(/commentthread_PublishedFile_Public_(.*)_area/gm, "$1").split("_")[0];
//console.log(getId);
//var count;
//await getTotalComments(`https://steamcommunity.com/comment/PublishedFile_Public/render/${getId}/${pageId}/`).then(out => {
//    count = parseInt(out);
//}).catch(e => console.error(e));
//while (count == undefined) { console.log(count) }
//const commentLength = await page.$$("a.pagebtn:nth-last-child(1)");
//var coms = 0;
//while (coms < count) {
//    const commentList = await page.$$(".commentthread_comments .commentthread_comment");
//    coms += commentList.length;
//    for (let i = 0; i < commentList.length; i++) {
//        const comment = commentList[i];
//        const commentAuthor =
//            await comment.$eval(
//                ".commentthread_comment_content .commentthread_comment_author .commentthread_author_link bdi",
//                cauthor => cauthor.innerText.trim());
//        const commentText = await comment.$eval(".commentthread_comment_content .commentthread_comment_text",
//            text => text.innerText.trim());
//        const commentDate =
//            await comment.$eval(
//                ".commentthread_comment_content .commentthread_comment_author .commentthread_comment_timestamp",
//                date => date.innerText.trim());
//        comments.push({
//            Author: commentAuthor,
//            Text: commentText,
//            Date: commentDate
//        });
//        console.log(comments);
//    }
//    commentLength[1].click();
//}