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
const clientData = {}; // Đối tượng để lưu trữ dữ liệu của mỗi clientIP

// Hàm xử lý scrape dữ liệu cho id lẻ
async function scrapeOdd(name, clickXPath, resultXPath, index, clientIP) {
    // Thực hiện scrape data cho trường hợp id là số lẻ
    // Đảm bảo trang web đã được khởi tạo
    if (!clientData[clientIP].page) {
        throw new Error('Page has not been initialized.');
    }

    if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Đợi 3 giây trước khi tiếp tục
    }
    await clientData[clientIP].page.waitForXPath(name);
    await clientData[clientIP].page.waitForXPath(clickXPath);

    // Lấy các phần tử XPath
    const [nameElement] = await clientData[clientIP].page.$x(name);
    const [clickElement] = await clientData[clientIP].page.$x(clickXPath);

    const nameText = await clientData[clientIP].page.evaluate(el => el.textContent, nameElement);
    const clickText = await clientData[clientIP].page.evaluate(el => el.textContent, clickElement);
    await clickElement.click();
    console.log('click: ', index + 1);

    // Click vào phần tử clickXPath
    await clientData[clientIP].page.waitForXPath(resultXPath);
    const [resultElement] = await clientData[clientIP].page.$x(resultXPath);

    const resultText = await clientData[clientIP].page.evaluate(el => el.textContent, resultElement);
    return { name: nameText, click: clickText, result: resultText };
}
// Hàm xử lý scrape dữ liệu cho id chẵn
async function scrapeEven(name, clickXPath, resultXPath, index, clientIP) {
    // if (index > 0) {
    //     await new Promise(resolve => setTimeout(resolve, 3000)); // Đợi 3 giây trước khi tiếp tục
    // }
    // Đảm bảo trang web đã được khởi tạo
    if (!clientData[clientIP].page) {
        throw new Error('Page has not been initialized.');
    }

    await clientData[clientIP].page.waitForXPath(name);
    await clientData[clientIP].page.waitForXPath(clickXPath);
    await clientData[clientIP].page.waitForXPath(resultXPath);
    console.log('index+1: ', index + 1);
    const [nameElement, clickElement, resultElement] = await Promise.all([
        clientData[clientIP].page.$x(name),
        clientData[clientIP].page.$x(clickXPath),
        clientData[clientIP].page.$x(resultXPath)
    ]);
    // Trích xuất thông tin từ các phần tử XPath
    const nameText = await clientData[clientIP].page.evaluate(el => el.textContent, nameElement[0]);
    const clickText = await clientData[clientIP].page.evaluate(el => el.textContent, clickElement[0]);
    const resultText = await clientData[clientIP].page.evaluate(el => el.textContent, resultElement[0]);
    //console.log('resultOut in server: ', nameText, clickText, resultText);
    return { name: nameText, click: clickText, result: resultText };
}

// Hàm xử lý scrape dữ liệu dựa trên id
const scrapeBasedOnId = async (id, paths, clientIP) => {
    const scrapeFunction = id % 2 === 0 ? scrapeEven : scrapeOdd;
    const scrapedData = await Promise.all(paths.map((path, index) => scrapeFunction(path.name, path.clickXPath, path.resultXPath, index, clientIP)));
    return scrapedData;
}


// Hàm crawlData
const crawlData = async (ctx) => {
    try {
        // Lấy địa chỉ IP và port của client
        const clientIP = ctx.req.connection.remoteAddress;
        const clientPort = ctx.req.connection.remotePort;
        console.log('Client IP:', clientIP);
        console.log('Client Port:', clientPort);

        // Khởi tạo dữ liệu của clientIP nếu chưa tồn tại
        if (!clientData[clientIP]) {
            clientData[clientIP] = {};
        }

        // Khởi tạo trình duyệt nếu cần
        if (!clientData[clientIP].browser) {
            clientData[clientIP].browser = await puppeteer.launch({
                headless: false,
                ignoreHTTPSErrors: true,
            });
        }

        // // Khởi tạo trang web nếu cần
        // if (!page) {
        //     page = await browser.newPage();
        // }
        // Khởi tạo trang web nếu cần
        if (!clientData[clientIP].page) {
            clientData[clientIP].page = await clientData[clientIP].browser.newPage();
        }

        // Xử lý yêu cầu đầu tiên
        if (isFirstRequest) {
            //const page = await browser.newPage();
            const searchValue = ctx.request.body.searchValue; // Lấy giá trị từ body của request
            console.log('isFirstRequest 1: ', isFirstRequest);
            //await page.goto('https://vnexpress.net');
            //await page.goto('https://www.thegioididong.com/hoi-dap');
            await clientData[clientIP].page.goto('https://www.thegioididong.com/hoi-dap');

            console.log(`https://${searchValue}`);

            //await page.goto(`https://${searchValue}`);

            //console.log('IP server 2: ', searchValue);
            //const xpathTile = '/html/body/section[2]/nav/ul/li[5]/a';
            const xpathTile = '/html/body/section[1]/aside/div[1]/ul/li[2]/label/h3/a';

            // Send a JSON response using ctx.send
            await clientData[clientIP].page.waitForXPath(xpathTile);
            const [element2] = await clientData[clientIP].page.$x(xpathTile);
            const subTitle = await clientData[clientIP].page.evaluate(el => el.textContent, element2);
            console.log('Gia trị xPath: ', subTitle);
            const responseData = {
                pageTitle: subTitle,
            };
            ctx.body = responseData;
        }
        //scraping   
        console.log('isFirstRequest 5: ', isFirstRequest);
        if (!isFirstRequest) {
            const { id, paths } = ctx.request.body; // Lấy id và các đường dẫn XPath từ body của request
            if (!paths || paths.length === 0) {
                throw new Error('Paths array is empty or undefined.');
            }
            const resultScrape = await scrapeBasedOnId(id, paths, clientIP);
            ctx.body = { resultScrape };
        }
        console.log('isFirstRequest 7: ', isFirstRequest);
        isFirstRequest = false; // Đặt cờ thành false sau lần gọi đầu tiên
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
