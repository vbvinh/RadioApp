const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const puppeteer = require('puppeteer');

const app = new Koa();
app.use(bodyParser());
app.use(cors());

let browser; // Biến global để lưu trữ trình duyệt
//let session; // Biến global để lưu trữ phiên làm việc
let page; // Biến global để lưu trữ trang web

let sessionBrowsers = {};


// Hàm để kiểm tra xem session đã mở trình duyệt chưa
const isSessionBrowserOpen = (sessionId) => {
    return !sessionBrowsers[sessionId];
    //return true
};

// Hàm để mở trình duyệt dựa trên session ID
const openSessionBrowser = async (sessionId) => {
    if (!sessionBrowsers[sessionId]) {
        sessionBrowsers[sessionId] = await puppeteer.launch({
            headless: false,
            ignoreHTTPSErrors: true,
        });
    }
    return sessionBrowsers[sessionId];
};
// Hàm để xóa tất cả các phiên trình duyệt khỏi sessionBrowsers
// const clearSessionBrowsers = () => {
//     sessionBrowsers = {};
// };

// Hàm để đóng trình duyệt dựa trên session ID
const closeSessionBrowser = async (sessionId) => {
    if (sessionBrowsers[sessionId]) {
        await sessionBrowsers[sessionId].close();
        delete sessionBrowsers[sessionId];
        sessionBrowsers = {};
    }
};


// Hàm xử lý scrape dữ liệu cho id lẻ
async function scrapeOdd(name, clickXPath, resultXPath, index) {
    // Thực hiện scrape data cho trường hợp id là số le
    if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Đợi 3 giây trước khi tiếp tục
    }
    await page.waitForXPath(name);
    await page.waitForXPath(clickXPath);

    //Lấy các phần tử XPath
    const [nameElement] = await page.$x(name);
    const [clickElement] = await page.$x(clickXPath);

    const nameText = await page.evaluate(el => el.textContent, nameElement);
    const clickText = await page.evaluate(el => el.textContent, clickElement);
    await clickElement.click();
    console.log('click: ', index + 1);
    await page.waitForTimeout(3000);

    // Click vào phần tử clickXPath
    await page.waitForXPath(resultXPath);
    const [resultElement] = await page.$x(resultXPath);

    const resultText = await page.evaluate(el => el.textContent, resultElement);
    return { name: nameText, click: clickText, result: resultText };
}

// Hàm xử lý scrape dữ liệu cho id chẵn
async function scrapeEven(name, clickXPath, resultXPath, index) {
    // if (index > 0) {
    //     await new Promise(resolve => setTimeout(resolve, 3000)); // Đợi 3 giây trước khi tiếp tục
    // }
    await page.waitForXPath(name);
    await page.waitForXPath(clickXPath);
    await page.waitForXPath(resultXPath);
    console.log('index+1: ', index + 1);
    const [nameElement, clickElement, resultElement] = await Promise.all([
        page.$x(name),
        page.$x(clickXPath),
        page.$x(resultXPath)
    ]);
    // Trích xuất thông tin từ các phần tử XPath
    const nameText = await page.evaluate(el => el.textContent, nameElement[0]);
    const clickText = await page.evaluate(el => el.textContent, clickElement[0]);
    const resultText = await page.evaluate(el => el.textContent, resultElement[0]);
    //console.log('resultOut in server: ', nameText, clickText, resultText);
    return { name: nameText, click: clickText, result: resultText };
}

// Hàm xử lý scrape dữ liệu dựa trên id
const scrapeBasedOnId = async (id, paths) => {
    const scrapeFunction = id % 2 === 0 ? scrapeEven : scrapeOdd;
    const scrapedData = await Promise.all(paths.map((path, index) => scrapeFunction(path.name, path.clickXPath, path.resultXPath, index)));
    return scrapedData;
}

let isFirstRequest = true; // Biến cờ để kiểm tra xem yêu cầu là lần đầu tiên hay không
// Hàm crawlData
const crawlData = async (ctx) => {
    const { isDisconnectRequest, session } = ctx.request.body;
    console.log('session 1: ', session);
    try {
        // Lấy địa chỉ IP và port của client
        // const clientIP = ctx.req.connection.remoteAddress;
        // const clientPort = ctx.req.connection.remotePort;
        // console.log('Client IP:', clientIP);
        // console.log('Client Port:', clientPort);
        if (isDisconnectRequest) {
            // Xử lý logic khi yêu cầu ngắt kết nối
            if (browser) {
                await browser.close();
                browser = null;
            }
            page = null;
            isFirstRequest = true;
            console.log('page: ', page);
            console.log('browser: ', browser);
            console.log('isFirstRequest: ', isFirstRequest);
            return;
        }
        // Khởi tạo trình duyệt nếu cần
        if (!browser) {
            browser = await puppeteer.launch({
                headless: false,
                ignoreHTTPSErrors: true,
            });
        }
        // Khởi tạo trang web nếu cần
        if (!page) {
            page = await browser.newPage();
        }

        // Xử lý yêu cầu đầu tiên
        if (isFirstRequest) {
            //const page = await browser.newPage();
            const searchValue = ctx.request.body.searchValue; // Lấy giá trị từ body của request
            console.log('isFirstRequest 1: ', isFirstRequest);
            //await page.goto('https://vnexpress.net');
            await page.goto('https://www.thegioididong.com/hoi-dap');

            console.log(`https://${searchValue}`);

            //await page.goto(`https://${searchValue}`);

            const xpathTile = '/html/body/section[1]/aside/div[1]/ul/li[2]/label/h3/a';

            // Send a JSON response using ctx.send
            await page.waitForXPath(xpathTile);
            const [element2] = await page.$x(xpathTile);
            const subTitle = await page.evaluate(el => el.textContent, element2);
            console.log('Gia trị xPath: ', subTitle);
            const responseData = {
                pageTitle: subTitle,
            };
            ctx.body = responseData;
            //isFirstRequest = false;

        } else {
            const { id, paths } = ctx.request.body; // Lấy id và các đường dẫn XPath từ body của request
            if (!paths || paths.length === 0) {
                throw new Error('Paths array is empty or undefined.');
            }
            const resultScrape = await scrapeBasedOnId(id, paths);
            ctx.body = { resultScrape };
            console.log('isFirstRequest 7: ', isFirstRequest);
            //isFirstRequest = false; // Đặt cờ thành false sau lần gọi đầu tiên
        }

        isFirstRequest = false;
    } catch (error) {
        console.error('Error:', error);
        ctx.status = 500; // Set HTTP status code to 500
        ctx.body = {
            error: 'An error occurred during crawling.',
        };
        console.log('isFirstRequest 9: ', isFirstRequest);
        isFirstRequest = true;
        // await browser.close();
        return;
    }
};
module.exports = {
    crawlData
};
