const puppeteer = require("puppeteer");

async function main(pageId) {
    const browser = await puppeteer.launch({
        headless: true
    });
    console.log(`Loading Page ${pageId}`);
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
    await page.goto(`${pageId}`);
    const elem = "div.workshopItemTitle";
    await page.waitForSelector(elem, {
        timeout: 6000
    });
    var img;
    try {
        img = await page.$$eval(".highlight_strip_item.highlight_strip_screenshot img", e => e.map((a) => a.src));
    } catch (except) {
        img = await page.$eval(".workshopItemPreviewImageMain #previewImageMain", image => image.src);
    }
    if (typeof img == "object") img = img[0];
    await browser.close();
    return new Promise(resolve => {
        resolve(img);
    });
};


module.exports = {
    main: main
}