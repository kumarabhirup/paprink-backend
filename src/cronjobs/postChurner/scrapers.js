const twoHundredWordsADay = {
  title: {
    selector: "h1#article-title"
  },
  content: {
    selector: "div#article-content",
    how: "html"
  },
  authorName: {selector: "div.writer-details > p.mb-2"},
  authorAvatar: {selector: "div.writer-details > img", attr: "data-src", convert: data => data ? `https://200wordsaday.com${data}` : `https://i.ibb.co/QjskV8p/images.png`},
  authorUsername: {
    selector: "small.d-block > a", 
    attr: "href", 
    convert: data => data.slice(9) //* /writers/something -> something
  }
}

const twoHundredWordsADayArchive = {
  links: {
    listItem: "div.tab-content > div.tab-pane > ul > li.text",
    data: {
      url: {
        selector: "div.d-flex.flex-row.justify-content-center.align-items-start > div.p-3.shadow-sm.rounded > div.text-blurb > a",
        attr: "href",
        convert: data => data ? `https://200wordsaday.com${data}` : null
      }
    }
  }
}

const scrapeWebsites = [
  {
    uri: 'https://200wordsaday.com', 
    scraper: twoHundredWordsADay,
    archiveScraper: twoHundredWordsADayArchive
  }
]

module.exports = {
  scrapeWebsites,
  twoHundredWordsADay
}