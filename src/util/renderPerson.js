import slugify from '@sindresorhus/slugify'

/** Renders a person personmission as a small snippet of HTML for the pending and approval email templates. */
const renderPerson = (person, sub) => {
  const personDetailUrl = `${window.location.origin}/person/${slugify(person.name)}`
  const personApprovalUrl = `${window.location.origin}/admin/review/people`
  const name = `<a href="${
    sub.status === 'approved' ? personDetailUrl : personApprovalUrl
  }" target="_blank">person.name</a>`
  const title = person.title ? person.title + '<br>' : ''
  const imgUrl =
    person.photo?.url || person.photo || sub.photo?.downloadUrl || sub.photo?.url || sub.photo
  const imgEl = imgUrl
    ? `<p><a href="${
        sub.status === 'approved' ? personDetailUrl : personApprovalUrl
      }" target="_blank"><img src="${
        person.photo?.downloadUrl || person.photo
      }" width="150" /></a></p>`
    : ''

  return `
  <p>
    <b>${name}</b><br>
    ${title}
  </p>
  ${imgEl}
  `
}

export default renderPerson
