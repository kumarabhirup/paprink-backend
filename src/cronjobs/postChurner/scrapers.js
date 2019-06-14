const twoHundredWordsADay = {
  title: {
    selector: "h1#article-title"
  },
  content: {
    selector: "div#article-content",
    how: "html"
  },
  authorName: {selector: "div.writer-details > p.mb-2"},
  authorAvatar: {selector: "div.writer-details > img", attr: "data-src", convert: data => `https://200wordsaday.com${data}`},
  authorUsername: {
    selector: "small.d-block > a", 
    attr: "href", 
    convert: data => data.slice(9) //* /writers/something -> something
  }
}

module.exports = {
  twoHundredWordsADay
}