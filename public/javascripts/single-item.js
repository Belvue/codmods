const puppeteer = require("puppeteer");


async function main(pageId) {
    var output = [];
    const browser = await puppeteer.launch({
        headless: false
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

    const desc = await page.$eval(".workshopItemDescription", description => description.innerText.trim());
    var img = "";
    try {
        img = await page.$eval(".workshopItemPreviewImageEnlargeableContainer img#previewImage", image => image.src);
    } catch (except) {
        img = await page.$eval(".workshopItemPreviewImageMain #previewImageMain", image => image.src);
    }
    const author = await page.$eval(".friendBlockContent", user => user.innerText.trim().split("\n")[0]);
    const itemStats = await page.$$eval(".detailsStatRight", e => e.map((a) => a.innerText));
    var rating = "";
    try {
        rating = await page.$eval(".workshopItemDetailsHeader #detailsHeaderRight .ratingSection .numRatings", sRating => sRating.innerText.trim());
    } catch (except) {
        rating = await page.$eval(".workshopItemDetailsHeader #detailsHeaderRight .ratingSection", sRating => sRating.innerText.trim());
    }
    const stats = await page.$$eval('.stats_table tr td:nth-child(odd)', e => e.map((a) => a.innerText);
    console.log(stats);
    //const commentCount = await page.$eval(".commentthread_count_label span", count => count.innerText);
    //console.log(`Comment Count ${commentCount}`);
    //const maxComments = await page.$eval('.commentthread_pagelink:nth-last-child(1)', size => size.innerText);
    //const comments = [];
    //var getId = await page.$eval(".commentthread_area", id => id.id);
    //console.log(getId);
    //var maxComments =getTotalComments(`https://steamcommunity.com/comment/PublishedFile_Public/render/${getId}/${pageId}/`);
    //if (commentCount > maxComments) {
    //    const commentLength = await page.$$("a.pagebtn:nth-last-child(1)");
    //    const commentList = await page.$$(".commentthread_comments .commentthread_comment");
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
    //output.push({
    //    Title: title,
    //    Author: author,
    //    Desc: desc,
    //    Img: img,
    //    Rating: rating,
    //    Comments: comments,
    //    Info: itemStats
    //});
    await browser.close();
    return new Promise(resolve => {
        resolve(output);
    });
};


function getTotalComments(url) {
    var options = {
        url: url,
        type: 'POST',
        method: 'POST',
        json: true
    };
    request(options, (r, e, b) => {
        if (e) throw e;
        return b.total_count;
    };
}

module.exports = {
    main: main
}