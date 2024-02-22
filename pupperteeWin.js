
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
                listenXPathData = [];
                return;
            }
        }
        console.log('isFirstRequest 3: ', isFirstRequest);
        isFirstRequest = false;
    } catch (error) {
        console.error('Error:', error);
        ctx.status = 500;
        ctx.body = {
            error: 'An error occurred during crawling.',
        };
        isFirstRequest = true;
        await browser.close();
        return;
    }
};


module.exports = {
    crawlData
}
