const cron = require('node-cron')
const scrapeIt = require('scrape-it')

const db = require('../../db')
const getScrapeUrl = require('./getScrapeUrl')
const scrapeOutput = require('./output')

module.exports = async function postsChurner() {
  // cron.schedule("*/1 * * * *", async () => { // 0 0 */3 * * * for every three hours
    // TODO: find post url to scrap
    const scrapeUrl = await getScrapeUrl()

    // TODO: check if post already exists
      // * if it does, then try again (IF NOT POSSIBLE, throw an error)

    // * URL found? Go ahead
    // TODO: Scrape it
    const { data } = await scrapeIt(scrapeUrl.url, scrapeUrl.scraper)
    console.log(scrapeOutput(scrapeUrl.url, data))

    // TODO: check if needed data exists
      // * if not, throw an error

    // TODO: find a suitable thumbnail

    // TODO: create the fake user

    // TODO: create the fake post
  // })
}