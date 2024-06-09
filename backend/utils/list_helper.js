const dummy = (blogs) => {
    return 1
  }
  
const totalLikes = (blogs) => {
  return blogs.reduce((n, { likes }) => n + likes, 0)
}

const favoriteBlog = (blogs) => {
  const sortedArray = blogs.sort(({ likes: a }, { likes: b }) => b-a)
  const blogWithMostLikes = sortedArray[0]
  return (({ title, author, likes }) => ({ title, author, likes }))(blogWithMostLikes);
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}