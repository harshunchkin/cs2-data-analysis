// const pup = require("puppeteer");
// "use client";
// import {setTimeout} from "node:timers/promises";
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require("fs");
const https = require("https");
const AdmZip = require("adm-zip");
const { type } = require("os");
const path = require('path');
const { error } = require("console");
puppeteer.use(StealthPlugin());

links = [];

(async () => {
        
        const browser = await puppeteer.launch({ headless: false });  // Set to false if you want to see the browser
        const page = await browser.newPage();

        const HLTV_URL = "https://www.hltv.org/results?event=8034";  // Update event ID if needed

        await page.goto(HLTV_URL, {
            waitUntil: 'load',
        });
        // await page.waitForTimeout(5000);

        // take page screenshot
        // await page.screenshot({ path: 'screenshot.png' });

        const title  = await page.title();
        console.log("Page Title: ", title);

        // await page.waitForSelector(".result-con a", { visible: true, timeout: 10000 });
        // await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
        // const links = [];
        const matchIDs = await page.evaluate(() => {
            return  Array.from( document.querySelectorAll(".result-con a")).map(a => a.href);
        });
        // for (const key in matchIDs) {
        //         const element = matchIDs[key];
        //         links.push(element);
        // }

        const ifmatches = await getdemos(page, matchIDs);
        // console.log("inf mataches: ",ifmatches.length);

        // await ddldemos(page,ifmatches);
    await browser.close();
})();


async function getdemos(page, matchIDs) {
    console.log("...gathering data")
    for (const key in matchIDs) {
        const matchurl = matchIDs[key];
        // console.log("ahah: ", matchurl);
        await page.goto(matchurl, { waitUntil: 'load' });
        const checkinferno = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".stream-box .spoiler ")).map(span => span.innerHTML).toString().search("Dust");
        });
        if (checkinferno !=- 1){
            // const linksinf = await page.evaluate(() => {
            //     return Array.from(document.querySelectorAll(".stream-box .spoiler ")).map(span => span.innerHTML);
            // });
            
            const demolink = await page.evaluate(() => {
                return document.querySelectorAll(".stream-box")[0].dataset.demoLink.toString();
            });
            console.log("Demo Link: ", demolink);    
            console.log("Inferno found in: ", matchurl);
            await ddldemos(demolink);
        }


        // await page.goto(matchurl,{waitUntil:'load'});
    }
}

async function ddldemos(demoLink) {
    const link = "https://www.hltv.org"+demoLink.trim();
    console.log("Demo full Link: ", link);

    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage();

    // await page.goto(link, { waitUntil: 'load' });
    try {
        await page.goto(link, { waitUntil: 'load' });
        console.log("Successfully navigated to:", link);
    } catch (error) {
        console.error("Failed to navigate to URL:", link, error);
    }
    // await page.waitForTimeout(5000); 
    // const client = await page.target().createCDPSession();
    // await client.send('Page.setDownloadBehavior', {
    //     behavior: 'allow',
    //     downloadPath: path.resolve(__dirname, 'downloads')
    //   });
    // // await page.goto(matchurl);
    // await page.click(".left-right-padding")
    // const cssselctor = ".left-right-padding";
    // await page.evaluate(cssselctor) => {
    //     console.log("Clicking on download button");
    //     document.querySelector(cssselctor).click();
    //     console.log("Clicked on download button");
    // });

    // client.on('Page.downloadProgress', (event) => {
    //     if (event.state === 'completed') {
    //       console.log('Download completed');
    //     }
    //   });      
      await new Promise(resolve => setTimeout(resolve, 5000)); // Replace page.waitForTimeout
}
