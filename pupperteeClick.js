
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
            //await page.goto('https://vnexpress.net');
            await page.goto('https://www.thegioididong.com/hoi-dap');

            console.log(`https://${searchValue}`);

            //await page.goto(`https://${searchValue}`);

            //const pageTitle = await page.title();
            console.log('IP server 2: ', searchValue);
            console.log('isFirstRequest 3: ', isFirstRequest);
            //const xpathTile = '/html/body/section[2]/nav/ul/li[5]/a';
            const xpathTile = '/html/body/section[1]/aside/div[1]/ul/li[1]/label/h3/a';
            //const xpathExpression = '/html/body/section[5]/div/div/div/div/div/div/ul/li[1]/h3/a';
            //const xpathExpression = '/html/body/div[1]/nav/div[1]/ul/li[2]/a';

            // Send a JSON response using ctx.send
            await page.waitForXPath(xpathTile);
            const [element2] = await page.$x(xpathTile);
            const subTitle = await page.evaluate(el => el.textContent, element2);
            console.log('Gia trị xPath: ', subTitle);

            //const [element] = await page.$x(xpathExpression);


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
            //let listenXPathData = [];
            try {
                const { id, paths } = ctx.request.body; // Lấy id và các đường dẫn XPath từ body của request
                //const requestData = ctx.request.body;
                //console.log('Dữ liệu từ client:', paths);
                //await page.waitForNavigation(); // Chờ trang load hoàn toàn (nếu cần)
                // Kiểm tra paths có tồn tại và có phần tử không
                if (!paths || paths.length === 0) {
                    throw new Error('Paths array is empty or undefined.');
                }
                // Lặp qua mảng paths và thực hiện scrape data
                const resultScrape = await Promise.all(paths.map(async (path, index) => {
                    if (!path || !path.name || !path.clickXPath || !path.resultXPath) {
                        throw new Error('Invalid path object.');
                    }
                    const { name, clickXPath, resultXPath } = path;
                    // Chờ cho mỗi lần duyệt qua phần tử mới
                    if (index > 0) {
                        await new Promise(resolve => setTimeout(resolve, 3000)); // Đợi 3 giây trước khi tiếp tục
                    }

                    // Thực hiện scrape data với mỗi đường dẫn XPath và trả về kết quả
                    await page.waitForXPath(name);
                    await page.waitForXPath(clickXPath);

                    //Lấy các phần tử XPath
                    const [nameElement] = await page.$x(name);
                    const [clickElement] = await page.$x(clickXPath);

                    const nameText = await page.evaluate(el => el.textContent, nameElement);
                    const clickText = await page.evaluate(el => el.textContent, clickElement);
                    await clickElement.click();
                    console.log('click: ', index+1);
                    //console.log('clickXPath1:', clickElement);

                    // Click vào phần tử clickXPath
                    await page.waitForXPath(resultXPath);
                    const [resultElement] = await page.$x(resultXPath);
                    

                    const resultText = await page.evaluate(el => el.textContent, resultElement);
                    //console.log('resultXPath1:', resultElement);
                    return { name: nameText, click: clickText, result: resultText };
                }));

                // Gửi kết quả scrape data về client
                ctx.body = { resultScrape };
                //ctx.body = responseData;
            } catch (error) {
                console.error('Error:', error);
                ctx.status = 500;
                ctx.body = {
                    error: 'An error occurred during scraping.',
                };
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
