/** Converts the first instance of a person's name in their bio to a their website. Returns the transformed bio. */
const linkCreatorInBio = person => {
  if (!person) return null
  if (!person.website) return person.bio
  const matches = new RegExp(`(<a[^>]*>)?\\s*${person.name}(<\\/a>)?`)
  const isAlreadyLinked = !!matches?.[1]
  return isAlreadyLinked
    ? person.bio
    // custom attributes and classes are stripped by CKEditor
    : person.bio.replace(person.name, `<a href="${person.website}" target="_blank">${person.name}</a>`)
}

export default linkCreatorInBio
