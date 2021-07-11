import creatorTitles from './creatorTitles'

// hardcoded special filters that are rendered above tags
const specialFilters = {
  books: [],
  bundles: [],
  people: creatorTitles.map(({ id, text }) => ({
    id,
    tag: text,
  })),
}

export default specialFilters
