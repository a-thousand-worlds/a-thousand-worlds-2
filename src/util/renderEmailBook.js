import * as slugify from '@sindresorhus/slugify'

/** Renders a book as a small snippet of HTML for the approval email template. */
const renderEmailBook = sub => {

  const bookDetailUrl = `${window.location.origin}/book/${slugify(sub.title.replace(/'/g, ''))}-${sub.isbn}`
  const illustratorsHtml = sub.illustrators ?
    `<br><b>illustrated by</b> ${sub.illustrators}</a>`
    : ''
  const imageHtml = sub.thumbnail ?
    `<p><a href="${bookDetailUrl}" target="_blank"><img src="${sub.thumbnail}" width="150" /></a></p>`
    : ''

  return `
    <p>
      <b><a href="${bookDetailUrl}" target="_blank">${sub.title}</a></b><br>
      <b>words by</b> ${sub.authors}
        ${illustratorsHtml}
    </p>
    ${imageHtml}
  `
}

export default renderEmailBook
