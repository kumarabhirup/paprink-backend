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

const redditBooks = {
  title: {
    selector: "div[data-test-id='post-content'] div[data-redditstyle='true'] > h1"
  },
  content: {
    selector: "div[data-test-id='post-content'] > div[data-click-id='text'] > div",
    how: "html"
  },
  authorName: {
    selector: "div[data-test-id='post-content'] a[href^='/user/']",
    convert: data => data.slice(2) // * u/my-name -> my-name
  },
  authorAvatar: {
    selector: "div[style='margin-left:24px;margin-top:0'] img[alt='Subreddit icon']", 
    attr: "src", 
    convert: data => data ? data : `https://i.ibb.co/QjskV8p/images.png`
  },
  authorUsername: {
    selector: "div[data-test-id='post-content'] a[href^='/user/']",
    convert: data => data.slice(2).toLowerCase()
  }
}

const redditBooksArchive = {
  links: {
    listItem: "a[data-click-id='body']",
    data: {
      url: {
        attr: "href",
        convert: data => data ? `https://reddit.com${data}` : null
      }
    }
  }
}

const scrapeWebsites = [
  {
    uri: 'https://www.reddit.com/r/books/new', 
    scraper: redditBooks,
    archiveScraper: redditBooksArchive,
    categories: ['WRITING']
  },
  {
    uri: 'https://www.reddit.com/r/Entrepreneur/new', 
    scraper: redditBooks,
    archiveScraper: redditBooksArchive,
    categories: ['ENTREPRENEUR', 'BUSSINESS']
  },
  {
    uri: 'https://www.reddit.com/r/writing/new', 
    scraper: redditBooks,
    archiveScraper: redditBooksArchive,
    categories: ['WRITING']
  }
]

module.exports = {
  scrapeWebsites
}