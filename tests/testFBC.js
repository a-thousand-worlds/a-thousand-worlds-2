/* eslint-disable fp/no-loops */
const puppeteer = require('puppeteer')

const testNPR = async (b, i) => {
  const page = await b.newPage()
  const d1 = new Date()
  await page.goto('http://athousandworlds.org/')
  await page.waitForSelector('img.cover')
  await page.waitForFunction('document.querySelector("img.cover").complete')
  const d2 = new Date()
  await page.screenshot({ path: `./tests/npr-${i}.png` })
  await page.close()
  return (d2.getTime() - d1.getTime()) / 1000
}

const testATW = async (b, i) => {
  const page = await b.newPage()
  const d1 = new Date()
  await page.goto('https://fir-test-294020-8181c.web.app/')
  await page.waitForSelector('img.cover-image')
  await page.waitForFunction('document.querySelector("img.cover-image").complete')
  const d2 = new Date()
  await page.screenshot({ path: `./tests/atw-${i}.png` })
  await page.close()
  return (d2.getTime() - d1.getTime()) / 1000
}

const tests = 10

puppeteer.launch().then(async browser => {
  console.log(`start <${tests}> tests`)
  let listNPR = []
  let listATW = []
  for (let i = 0; i < tests; i++) {
    console.log('test NPR', i + 1)
    const t = await testNPR(browser, i)
    listNPR = [...listNPR, t]
  }
  for (let i = 0; i < tests; i++) {
    console.log('test ATW', i + 1)
    const t = await testATW(browser, i)
    listATW = [...listATW, t]
  }
  const averageNPR = listNPR.reduce((acc, v) => acc + v, 0) / listNPR.length
  const averageATW = listATW.reduce((acc, v) => acc + v, 0) / listATW.length
  console.log('done', listNPR, listATW)
  console.log('average', averageNPR, averageATW)
  await browser.close()
})
