const puppeteer = require("puppeteer");

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
    //const stats = await page.$$eval('.stats_table tr td:nth-child(odd)', data => data);

    const commentList = await page.$$(".commentthread_comments .commentthread_comment");
    const comments = [];
    for (let i = 0; i < commentList.length; i++) {
        const comment = commentList[i];
        const commentAuthor = await comment.$eval(".commentthread_comment_content .commentthread_comment_author .commentthread_author_link bdi", cauthor => cauthor.innerText.trim());
        const commentText = await comment.$eval(".commentthread_comment_content .commentthread_comment_text", text => text.innerText.trim());
        const commentDate = await comment.$eval(".commentthread_comment_content .commentthread_comment_author .commentthread_comment_timestamp", date => date.innerText.trim());
        comments.push({
            Author: commentAuthor,
            Text: commentText,
            Date: commentDate
        });
    }
    output.push({
        Title: title,
        Author: author,
        Desc: desc,
        Img: img,
        Rating: rating,
        Comments: comments,
        Info: itemStats
    });
    await browser.close();
    return new Promise(resolve => {
        resolve(output);
    });
};

module.exports = {
    main: main
}