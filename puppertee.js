//'use strict';
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const app = new Koa();
app.use(bodyParser());
//CORS

app.use(bodyParser());

// Cấu hình CORS
app.use(cors());

const puppeteer = require('puppeteer');
//the ctx (context) object is commonly used instead of res and req
const crawlData = async (ctx) => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            ignoreHTTPSErrors: true,
        });
        const page = await browser.newPage();
        const searchValue = ctx.request.body.searchValue; // Lấy giá trị từ body của request

        //await page.goto('https://vnexpress.net');
        console.log(`https://${searchValue}`);

        await page.goto(`https://${searchValue}`);

        // const pageTitle = await page.title();
        console.log('IP server 2: ', searchValue);

        const xpathTile = '/html/body/section[2]/nav/ul/li[4]/a';
        const xpathExpression = '/html/body/section[5]/div/div/div/div/div/div/ul/li[1]/h3/a';

        // Send a JSON response using ctx.send
        await page.waitForXPath(xpathTile);
        const [element2] = await page.$x(xpathTile);
        const subTitle = await page.evaluate(el => el.textContent, element2);
        console.log('Gia trị xPath: ', subTitle);



        const [element] = await page.$x(xpathExpression);
        let nodeBText;

        if (element) {
            nodeBText = await page.evaluate(el => el.textContent, element);
        } else {
            console.error('Element not found with the given XPath');
            ctx.status = 404; // Set HTTP status code to 404
            ctx.body = {
                error: 'Element not found with the given XPath',
            };
            await browser.close();
            return;
        }

        console.log('nodeBText:', nodeBText);

        ctx.body = {
            nodeB: nodeBText,
            pageTitle: subTitle,
        };

        await browser.close();
    } catch (error) {
        console.error('Error:', error);
        ctx.status = 500; // Set HTTP status code to 500
        ctx.body = {
            error: 'An error occurred during crawling.',
        };
    }
};

module.exports = {
    crawlData
};
