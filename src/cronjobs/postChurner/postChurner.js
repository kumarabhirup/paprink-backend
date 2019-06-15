const cron = require('node-cron')
const slugify = require('slug')
const scrapeIt = require('scrape-it')

require('es6-promise').polyfill()
const fetch = require('isomorphic-fetch')

const db = require('../../db')
const getScrapeUrl = require('./getScrapeUrl')
const scrapeOutput = require('./output')
const { generateToken, getRandomInt } = require('../../utils')

module.exports = async function postsChurner() {
  // cron.schedule("*/1 * * * *", async () => { // 0 0 */3 * * * for every three hours
    // TODO: find post url to scrap
    const scrapeUrl = await getScrapeUrl()

    // TODO: check if post already exists
    const urlExists = await db.query.post(
      { where: { refUrl: scrapeUrl.url } },
      `{ refUrl }`
    )
    
    // * if it does, then try again (IF NOT POSSIBLE, throw an error)
    if (urlExists) {
      throw new Error("Post is already scraped.")
    }

    // TODO: Scrape it
    const { data } = await scrapeIt(scrapeUrl.url, scrapeUrl.scraper)
    const output = scrapeOutput(scrapeUrl.url, data)

    // TODO: check if needed data exists
    if (output.data.title.length === 0 || output.data.content.length === 0 || output.data.author.name.length === 0 || output.data.author.username.length === 0) {
      throw new Error(`Error scraping ${output.url}`)
    }

    // TODO: find a suitable thumbnail
    // const thumbnail = await fetch(`https://api.unsplash.com/search/photos`, {
    //   method: 'GET',
    //   body: JSON.stringify({
    //     query: output.data.title
    //   }),
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Accept-Version': 'v1',
    //     'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
    //   },
    // }).then(res =>res.json()).then(data => data.results[0].urls.raw)

    // TODO: create the fake user
    const createUser = await db.mutation.createUser({
      data: {
        fname: output.data.author.name,
        lname: output.data.author.name,
        name: output.data.author.name,
        username: `${output.data.author.username.toLowerCase()}_${generateToken(2, { lower: true })}`,
        profilePicture: output.data.author.profilePicture,
        previledge: {
          set: ["FAKEUSER"]
        },
        socialId: generateToken(32),
        accessToken: generateToken(32),
        email: `fakeEmail${generateToken(32)}@${generateToken(5)}.com`,
        signUpMethod: `fake`,
      }
    }, `{ id }`)

    if (!createUser) {
      throw new Error("Error while creating a fake user.")
    }

    // TODO: create the fake post
    const date = new Date()
    const categories = ['WRITING', 'STORY']
    const createPost = await db.mutation.createPost({
      data: {
        author: { connect: { id: createUser.id } },
        authorId: createUser.id,
        categories: {
          connect: categories.map(category => ({ category })),
        },
        status: "FAKEPOST",
        publishedAt: date.toISOString(),
        slug: slugify(output.data.title, { lower: true }),
        title: output.data.title,
        upvotesNumber: getRandomInt(14, 19),
        thumbnail: {},
        refUrl: output.url,
        editorSerializedOutput: {},
        editorCurrentContent: {},
        editorHtml: output.data.content
      }
    }, `{ id title }`)

    if (!createPost) {
      throw new Error("Error while creating a fake post.")
    }

    // SUCCESS!
    console.log(`New post created! [Title: ${createPost.title}]`)
  // })
}