const output = (url, scrapeData) => {
  return {
    url,
    data: {
      title: scrapeData.title,
      content: scrapeData.content,
      author: {
        name: scrapeData.authorName,
        profilePicture: scrapeData.authorAvatar,
        username: scrapeData.authorUsername
      },
      thumbnail: scrapeData.thumbnail,
      originallyCreatedAt: scrapeData.originallyCreatedAt
    }
  }
}

module.exports = output