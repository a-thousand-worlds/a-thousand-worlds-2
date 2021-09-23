import slugify from '@sindresorhus/slugify'

/** Renders a book submission as a small snippet of HTML for the pending and approval email templates. If approved, links to the book's detail page. */
const renderEmailBook = sub => {
  const bookDetailUrl = `${window.location.origin}/book/${slugify(sub.title.replace(/'/g, ''))}-${
    sub.isbn
  }`
  const bookApprovalUrl = `${window.location.origin}/admin/review/books`
  const illustratorsHtml = sub.illustrators
    ? `<br><b>illustrated by</b> ${sub.illustrators}</a>`
    : ''
  const title = `<a href="${
    sub.status === 'approved' ? bookDetailUrl : bookApprovalUrl
  }" target="_blank">${sub.title}</a>`
  const img = sub.thumbnail
    ? `<p><a href="${
        sub.status === 'approved' ? bookDetailUrl : bookApprovalUrl
      }" target="_blank"><img src="${sub.thumbnail}" width="150" /></a></p>`
    : ''

  return `
  <p>
    <b>${title}</b><br>
    <b>words by</b> ${sub.authors}
      ${illustratorsHtml}
  </p>
  ${img}
  `
}

export default renderEmailBook
