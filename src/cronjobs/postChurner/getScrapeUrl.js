const scrapeIt = require('scrape-it')
const { scrapeWebsites } = require('./scrapers')

const getRandom = scrapeWebsites[Math.floor(Math.random() * scrapeWebsites.length)]

const getScrapeUrl = async () => {
  const { data } = await scrapeIt(getRandom.uri, getRandom.archiveScraper)

  const validLinks = data.links.filter(link => link.url !== null)
  const getARandomLink = validLinks[Math.floor(Math.random() * validLinks.length)]
  
  return { url: getARandomLink.url, scraper: getRandom.scraper }
}

module.exports = getScrapeUrl