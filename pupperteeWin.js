//'use strict';
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
app.use(bodyParser());

// const readline = require('readline').createInterface({
//   input: process.stdin,
//   output: process.stdout
// });


const puppeteer = require('puppeteer');
// puppertee.crawlData
//the ctx (context) object is commonly used instead of res and req
const crawlData = async (ctx) => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            ignoreHTTPSErrors: true,
        });
        const page = await browser.newPage();
        const searchValue = ctx.request.body.searchValue; // Lấy giá trị từ body của request

       await page.goto(`https://${searchValue}`);

       //Login
  const userXPath = '//*[@id="login-username"]';
  const passwordXPath = '//*[@id="login-password"]';
  const loginBtnXPath = '/html/body/login-root/div/login/div/div/div[1]/p-card/div/div[2]/div/form/div[3]/p-button/button/span';
  //Scrape
  const detailSiteViewXPath ='//*[@id="main-view"]/div/div[1]/div[3]/ng-view/wf-panel/wf-panel-section/div/div/site-runtime-views/div/ul/li[2]/a';
  const btsidXpath ='//*[@id="main-view"]/div/div[1]/div[2]/div/div[1]/div[1]/div[2]/div[2]'
  
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
  //  const NodeB = await page.evaluate(el => el.textContent, btsid);
  //  console.log('Đang login trạm:', NodeB); 

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

        console.log('nodeBText:', nodeBText);

        ctx.body = {
            nodeB: nodeBText,
        };

        // //scraping
        // //Lay gia tri Xpath TB
        // const listenXPath = ctx.request.body.listenXPath;

        // await page.waitForXPath(listenXPath);
        // const [valueXpath] = await page.$x(listenXPath);
  
        // let resultOut;

        // if (valueXpath) {
        //   resultOut = await page.evaluate(el => el.textContent, valueXpath);
        // } else {
        //     console.error('Element not found with the given XPath');
        //     ctx.status = 404; // Set HTTP status code to 404
        //     ctx.body = {
        //         error: 'Element not found with the given XPath',
        //     };
        //     await browser.close();
        //     return;
        // }

        // console.log('resultOut:', resultOut);

        // ctx.body = {
        //   resultScrape: resultOut,
        // };


        //await browser.close();
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
