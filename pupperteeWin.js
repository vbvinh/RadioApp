
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

// Hàm xử lý scrape dữ liệu cho id lẻ
async function scrapeOdd(name, click, result, index) {
    try {
        // Thực hiện scrape data cho trường hợp id là số le
        if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Đợi 3 giây trước khi tiếp tục
        }
        await Promise.race([
            page.waitForXPath(name),
            new Promise(resolve => setTimeout(resolve, 10000)) // Timeout sau 10 giây
        ]);
        await Promise.race([
            page.waitForXPath(click),
            new Promise(resolve => setTimeout(resolve, 10000)) // Timeout sau 10 giây
        ]);

        //Lấy các phần tử XPath
        const [nameElement] = await page.$x(name);
        const [clickElement] = await page.$x(click);

        const nameText = nameElement ? await page.evaluate(el => el.textContent, nameElement) : null;
        const clickText = clickElement ? await page.evaluate(el => el.textContent, clickElement) : null;
        if (clickElement) await clickElement.click();
        console.log('click: ', index);

        // Click vào phần tử clickXPath
        await Promise.race([
            page.waitForXPath(result),
            new Promise(resolve => setTimeout(resolve, 10000)) // Timeout sau 10 giây
        ]);
        const [resultElement] = await page.$x(result);

        const resultText = resultElement ? await page.evaluate(el => el.textContent, resultElement) : null;
        return { name: nameText, click: clickText, result: resultText };
    } catch (error) {
        console.error('Error occurred during scraping:', error);
        return { name: null, click: null, result: null };
    }
}

// Hàm xử lý scrape dữ liệu cho id chẵn
async function scrapeEven(name, click, result, index) {
    try {
        // Chờ các phần tử XPath hoặc timeout
        const [nameElement, clickElement, resultElement] = await Promise.all([
            Promise.race([page.waitForXPath(name), new Promise(resolve => setTimeout(resolve, 5000))]),
            Promise.race([page.waitForXPath(click), new Promise(resolve => setTimeout(resolve, 5000))]),
            Promise.race([page.waitForXPath(result), new Promise(resolve => setTimeout(resolve, 5000))])
        ]);

        // Kiểm tra xem các phần tử đã được tìm thấy thành công hay không
        if (!nameElement || !clickElement || !resultElement) {
            throw new Error('One or more elements not found');
        }

        // Trích xuất nội dung của các phần tử
        const nameText = nameElement ? await page.evaluate(el => el.textContent, nameElement) : null;
        const clickText = clickElement ? await page.evaluate(el => el.textContent, clickElement) : null;
        const resultText = resultElement ? await page.evaluate(el => el.textContent, resultElement) : null;
        console.log('index: ', index);
        return { name: nameText, click: clickText, result: resultText };
    } catch (error) {
        console.error('Error occurred during scraping:', error);
        // Tránh đóng trình duyệt khi có lỗi
        return { name: null, click: null, result: null };
    }
}


// Hàm xử lý scrape dữ liệu dựa trên id
const scrapeBasedOnId = async (id, paths) => {
    const scrapeFunction = id % 2 === 0 ? scrapeEven : scrapeOdd;
    try {
        const scrapedData = await Promise.all(paths.map((path, index) => scrapeFunction(path.name, path.click, path.result, index)));
        return scrapedData;
    } catch (error) {
        console.error('Error occurred during scraping:', error);
        return Array(paths.length).fill({ name: null, click: null, result: null });
    }
}


// Hàm crawlData
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
            await page.goto(`https://${searchValue}`);
            //await page.goto('https://vnexpress.net');

            console.log(`https://${searchValue}`);  

            //const pageTitle = await page.title();
            console.log('isFirstRequest 1: ', isFirstRequest);

             //xPath Login
            const userXPath = '//*[@id="login-username"]';
            const passwordXPath = '//*[@id="login-password"]';
            const loginBtnXPath = '/html/body/login-root/div/login/div/div/div[1]/p-card/div/div[2]/div/form/div[3]/p-button/button/span';
            //xPath Scrape
            const detailSiteViewXPath ='//*[@id="main-view"]/div/div[1]/div[3]/ng-view/wf-panel/wf-panel-section/div/div/site-runtime-views/div/ul/li[2]/a';
            const btsidXpath ='//*[@id="main-view"]/div/div[1]/div[2]/div/div[1]/div[1]/div[2]/div[2]'
  
             //Login
            // Đợi các trường input và nút đăng nhập xuất hiện trên trang
            await page.waitForXPath(userXPath);
            await page.waitForXPath(passwordXPath);
            await page.waitForXPath(loginBtnXPath);

            // Tìm và nhập thông tin user và password vào các trường input
            const userInput = await page.$x(userXPath);
            const passwordInput = await page.$x(passwordXPath);

            if (userInput[0] && passwordInput[0]) {
                await userInput[0].type('Nemuadmin');
                await passwordInput[0].type('nemuuser');
            } else {
                console.error('Không tìm thấy trường input với XPath đã cho');
            }

            // Tìm và click vào nút đăng nhập
            const [loginBtn] = await page.$x(loginBtnXPath);
            if (loginBtn) {
                await loginBtn.click();
            } else {
                console.error('Không tìm thấy nút đăng nhập với XPath đã cho');
            }

            const confirmLegalNoticeXPath = '/html/body/div[1]/div/div/ui-modal-renderer/login-banner-modal/ui-modal/div/div/div[3]/div/ui-footer/div/ui-button[1]/button';
            await page.waitForXPath(confirmLegalNoticeXPath);
            const [button] = await page.$x(confirmLegalNoticeXPath);
            if (button) {
                await button.click();
            } else {
                console.error('Không tìm thấy phần tử với XPath đã cho');
            }

            //Xpath smallIcon
            await page.waitForXPath(detailSiteViewXPath);
            const [detailSiteView] = await page.$x(detailSiteViewXPath);
            if (detailSiteView) {
                await detailSiteView.click();
            } else {
                console.error('Không tìm thấy detailSiteView với XPath đã cho.');
            }  
            //Xpath BTS ID
            await page.waitForXPath(btsidXpath);
            const [btsid] = await page.$x(btsidXpath);
            const NodeB = await page.evaluate(el => el.textContent, btsid);
            console.log('Đang login trạm:', NodeB);     
        
            let nodeBText;

            if (btsid) {
                nodeBText = await page.evaluate(el => el.textContent, btsid);
            } else {
                console.error('Element not found with the given XPath');
                ctx.status = 404; // Set HTTP status code to 404
                ctx.body = {
                 error: 'Element not found with the given XPath',
                };
                await browser.close();
                return;
            }

            console.log('nodeBLogin:', nodeBText);
            const responseData = {
                nodeB: nodeBText,
            // pageTitle: subTitle,
            };
            ctx.body = responseData;
        }
        //scraping
        console.log('!isFirstRequest 2: ', isFirstRequest);

        if (!isFirstRequest) {
            const { id, paths } = ctx.request.body; // Lấy id và các đường dẫn XPath từ body của request
            if (!paths || paths.length === 0) {
                throw new Error('Paths array is empty or undefined.');
            }
            const resultScrape = await scrapeBasedOnId(id, paths);
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
        await browser.close();
        return;
    }
};

module.exports = {
    crawlData
};
