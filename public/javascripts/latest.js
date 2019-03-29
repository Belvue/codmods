const puppeteer = require("puppeteer");
async function main() {
    var output = [];
    const browser = await puppeteer.launch({
        headless: true
    });
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
    await page.goto(`https://steamcommunity.com/workshop/browse/?appid=311210&browsesort=trend&section=readytouseitems&actualsort=trend&p=1&days=7`);
    const elem = "div.workshopItem";
    await page.waitForSelector(elem, {
        timeout: 4000
    });
    const collection = await page.$$(elem);

    for (let i = 0; i < 3; i++) {
        const elemz = collection[i];
        const mod = await elemz.$eval(".workshopItemTitle", modName => modName.innerText);
        const link = await elemz.$eval("a", href => href.href.replace("&searchtext=", ""));
        const author = await elemz.$eval(".workshopItemAuthorName a", authors => authors.innerText);
        const totalItems = await page.$eval(".workshopBrowsePagingInfo", items => parseInt(items.innerText.split(" ")[3].replace(",", "")));
        output.push({
            Mod: mod,
            Author: author,
            Link: link,
            Total: totalItems
        });
    }
    await browser.close();
    return new Promise(resolve => {
        resolve(output);
    });
};

module.exports = {
    main: main
}