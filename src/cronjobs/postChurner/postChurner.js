const cron = require('node-cron')
const scrapeIt = require('scrape-it')

const db = require('../../db')
const { twoHundredWordsADay } = require('./scrapers')
const scrapeOutput = require('./output')

module.exports = function postsChurner() {
  // 0 0 */3 * * * for every three hours
  cron.schedule("*/1 * * * *", async () => {
    const scrapeUrl = "https://200wordsaday.com/words/a-true-and-crazy-story-1-201345d02e29d8a137"
    const { data } = await scrapeIt(scrapeUrl, twoHundredWordsADay)
    console.log(scrapeOutput(scrapeUrl, data))
  })
}