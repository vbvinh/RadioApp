
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const puppeteer = require('puppeteer');

const app = new Koa();
app.use(bodyParser());
app.use(cors());

let browser; // Biến global để lưu trữ trình duyệt
let page; // Biến global để lưu trữ trang web
let isFirstRequest = true; // Biến cờ để kiểm tra xem yêu cầu là lần đầu tiên hay không

//the ctx (context) object is commonly used instead of res and req
const crawlData = async (ctx) => {
    try {
        // Kiểm tra nếu trình duyệt chưa được khởi tạo thì khởi tạo nó
        if (!browser) {
            browser = await puppeteer.launch({
                headless: false,
                ignoreHTTPSErrors: true,
            });
        }

        if (!page) {
            page = await browser.newPage();
        }

        if (isFirstRequest) {
            //const page = await browser.newPage();
            const searchValue = ctx.request.body.searchValue; // Lấy giá trị từ body của request
            console.log('isFirstRequest 1: ', isFirstRequest);
            await page.goto('https://vnexpress.net');

            console.log(`https://${searchValue}`);

            //await page.goto(`https://${searchValue}`);

            //const pageTitle = await page.title();
            console.log('IP server 2: ', searchValue);
            console.log('isFirstRequest 3: ', isFirstRequest);
            const xpathTile = '/html/body/section[2]/nav/ul/li[5]/a';
            const xpathExpression = '/html/body/section[5]/div/div/div/div/div/div/ul/li[1]/h3/a';

            // Send a JSON response using ctx.send
            await page.waitForXPath(xpathTile);
            const [element2] = await page.$x(xpathTile);
            const subTitle = await page.evaluate(el => el.textContent, element2);
            console.log('Gia trị xPath: ', subTitle);

            const [element] = await page.$x(xpathExpression);
            //let nodeBText;

            // if (element) {
            //     let nodeBText = await page.evaluate(el => el.textContent, element);
            // } else {
            //     console.error('Element not found with the given XPath');
            //     ctx.status = 404; // Set HTTP status code to 404
            //     ctx.body = {
            //         error: 'Element not found with the given XPath',
            //     };
            //     await browser.close();
            //     return;
            // }

            // //console.log('nodeBText:', nodeBText);
            // ctx.body = {
            //     //nodeB: nodeBText,
            //     pageTitle: subTitle,
            // };

            const responseData = {
                //nodeB: nodeBText,
                pageTitle: subTitle,
            };
            ctx.body = responseData;
        }
        //scraping
        // Lắng nghe cho yêu cầu với listenXPath từ client
        // Nếu đây là lần gọi yêu cầu POST đầu tiên, thực hiện lắng nghe cho listenXPath    
        console.log('isFirstRequest 5: ', isFirstRequest);

        if (!isFirstRequest) {
            let listenXPathData = [];
            try {

                listenXPathData = await new Promise((resolve) => {
                    const selectedId = ctx.request.body.id;
                    const listenXPath1 = ctx.request.body.path1;
                    const listenXPath2 = ctx.request.body.path2;
                    const listenXPath3 = ctx.request.body.path3;
                    console.log('listenId: ', selectedId);
                    console.log('listenXPath1: ', listenXPath1);
                    console.log('listenXPath2: ', listenXPath2);
                    console.log('listenXPath3: ', listenXPath3);
                    resolve([selectedId,listenXPath1, listenXPath2, listenXPath3]);
                });

                const [selectedId,listenXPath1, listenXPath2, listenXPath3] = listenXPathData;
                await page.waitForXPath(listenXPath1);
                await page.waitForXPath(listenXPath2);
                await page.waitForXPath(listenXPath3);
                const [valueXpath1] = await page.$x(listenXPath1);
                const [valueXpath2] = await page.$x(listenXPath2);
                const [valueXpath3] = await page.$x(listenXPath3);
                if (valueXpath1 && valueXpath2 && valueXpath3) {
                    //let resultOutId;
                    let resultOut1 = await page.evaluate(el => el.textContent, valueXpath1);
                    let resultOut2 = await page.evaluate(el => el.textContent, valueXpath2);
                    let resultOut3 = await page.evaluate(el => el.textContent, valueXpath3);
                    console.log('resultOut: ',selectedId, resultOut1, resultOut2, resultOut3);
                    const responseData = {
                        resultScrape: [ resultOut1, resultOut2, resultOut3], // Return an array of resultOut
                        //resultScrape: [selectedId, resultOut1, resultOut2, resultOut3],
                    };
                    ctx.body = responseData;
                } else {
                    ctx.status = 404;
                    ctx.body = {
                        error: 'Element not found with the given XPath',
                    };
                    isFirstRequest = true;
                    await browser.close();
                    return;
                }
            } catch (error) {
                console.error('Error:', error);
                isFirstRequest = true;
                listenXPathData = []; // Đặt lại listenXPath thành undefined nếu có lỗi
                return;
            }
        }
        console.log('isFirstRequest 7: ', isFirstRequest);
        isFirstRequest = false; // Đặt cờ thành false sau lần gọi đầu tiên
        console.log('isFirstRequest 7a: ', isFirstRequest);
    } catch (error) {
        console.error('Error:', error);
        ctx.status = 500; // Set HTTP status code to 500
        ctx.body = {
            error: 'An error occurred during crawling.',
        };
        console.log('isFirstRequest 9: ', isFirstRequest);
        isFirstRequest = true;
        await browser.close();
        //moi them catch loi
        return;
    }
};

module.exports = {
    crawlData
};
