export const professionalOptions = [
  { id: 'editor', text: 'Editor' },
  { id: 'publisher', text: 'Publisher' },
  { id: 'publicist', text: 'Publicist' },
  { id: 'agent', text: 'Agent' },
  { id: 'art-directory', text: 'Art Director' },
  { id: 'designer', text: 'Designer' },
]

export const nonprofessionalOptions = [
  { id: 'reviewer-critic', text: 'Reviewer/Critic' },
  { id: 'librarian', text: 'Librarian' },
  { id: 'educator', text: 'Educator' },
  { id: 'reader', text: 'Reader' },
  { id: 'parent-caregiver', text: 'Parent/Caregiver' },
]

export const engagementOptions = [...professionalOptions, ...nonprofessionalOptions]

export default engagementOptions
