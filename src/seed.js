const { prisma } = require('./generated/prisma-client')

const categorySuggessions = [
  { category: "tech", text: "Technology" },
  { category: "fin", text: "Finance" },
  { category: "digimark", text: "Digital Marketing" },
  { category: "coding", text: "Programming" },
  { category: "tutorial", text: "Tutorial" },
  { category: "howto", text: "How To" },
  { category: "writing", text: "Writing" },
  { category: "inspire", text: "Inspirational" },
  { category: "science", text: "Science" },
  { category: "politics", text: "Politics" },
  { category: "lifestyle", text: "Lifestyle" },
  { category: "food", text: "Food" },
  { category: "bussiness", text: "Bussiness" },
  { category: "entrepreneur", text: "Entrepreneurs" },
  { category: "history", text: "History" },
  { category: "health", text: "Health" },
  { category: "pet", text: "Pets" },
  { category: "parenthood", text: "Parenthood" },
  { category: "travel", text: "Travel" },
  { category: "india", text: "India" },
  { category: "china", text: "China" },
  { category: "uk", text: "United Kingdom" },
  { category: "us", text: "United States" },
  { category: "world", text: "World" },
  { category: "news", text: "News" },
  { category: "review", text: "Product Review" },
  { category: "art", text: "Art" },
  { category: "culture", text: "Culture" },
  { category: "story", text: "Story" },
]

async function seed() {
  
  await categorySuggessions.map(async object => {
    await prisma.createCategory({
      category: object.category.toUpperCase(),
      text: object.text
    })
  })

}

seed().catch(e => console.error(e))