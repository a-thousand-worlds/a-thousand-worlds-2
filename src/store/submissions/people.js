import _ from 'lodash'
import { v4 as uid } from 'uuid'
import dayjs from 'dayjs'
import * as slugify from '@sindresorhus/slugify'
import managed from '@/store/modules/managed'
import personSubmission from '@/store/constants/personSubmission'
import almostEqual from '@/util/almostEqual'
import mergeOne from '@/util/mergeOne'
import sendEmail from '@/util/sendEmail'

const module = mergeOne(managed('submits/people'), {
  actions: {

    /** Submit people form to Firebase */
    submit: async (context, submission) => {
      const profile = context.rootState.user.user.profile
      const id = uid()
      const submissionApprovable = {
        ...submission,
        id,
        reviewComment: '',
        status: 'pending',
        type: 'people',
      }

      // save people submission
      context.commit('setOne', { path: id, value: submissionApprovable })
      await context.dispatch('save', { path: id, value: submissionApprovable })

      // save submission id to user profile
      const profileNew = {
        ...profile,
        draftPerson: null,
        submissions: {
          ...profile.submissions,
          [id]: 'pending',
        }
      }
      await context.dispatch('user/saveProfile', profileNew, { root: true })
    },

    /** Update submission status */
    updateSubmission: async (context, { peopleSubmissionId, personId, sub, status }) => {

      const submissionUpdates = {
        reviewedBy: context.rootState.user.user.uid,
        reviewedAt: dayjs().format(),
        status,
        ...peopleSubmissionId ? { peopleSubmissionId } : null,
        ...personId ? { personId } : null,
      }

      // commit local person submission update so we don't have to wait for server
      context.commit('setOne', {
        path: sub.id,
        value: {
          ...sub,
          ...submissionUpdates,
        },
      })

      // update person submission
      await context.dispatch('update', {
        path: sub.id,
        value: submissionUpdates,
      })

      // update user profile submission
      await context.dispatch('users/save', {
        path: `${sub.createdBy}/profile/submissions/${sub.id}`,
        value: status
      }, { root: true })

      // update user profile personId
      if (personId) {
        await context.dispatch('users/save', {
          path: `${sub.createdBy}/profile/personId`,
          value: personId
        }, { root: true })
      }
    },

    /** Rejects a submission. */
    async reject(context, sub) {

      await context.dispatch('updateSubmission', { sub, status: 'rejected' })

      // send email
      const submitter = await context.dispatch('users/loadOne', sub.createdBy, { root: true })
      if (!submitter) {
        const message = `Could not find user ${sub.createdBy} for submission ${sub.id}`
        console.error(message, sub)
        throw new Error(message)
      }
      if (!submitter.profile.email) {
        const message = `No email for user ${sub.createdBy} of submission ${sub.id}`
        console.error(message, sub)
        throw new Error(message)
      }

      const emailTemplate = context.rootGetters['content/get']('email/submissions/rejected/people')

      if (!emailTemplate || !emailTemplate.subject || !emailTemplate.body) {
        const message = `No email template for people submission approving`
        console.error(message, sub)
        throw new Error(message)
      }

      const fullName = submitter.profile.name || 'friend'
      const firstName = fullName.includes(' ')
        ? fullName.slice(0, fullName.indexOf(' '))
        : fullName
      const lastName = fullName.includes(' ')
        ? fullName.slice(fullName.indexOf(' ') + 1)
        : ''

      const template = s => s.replace(/FIRST_NAME/g, firstName)
        .replace(/LAST_NAME/g, lastName)
        .replace(/FULL_NAME/g, fullName)

      // sending email
      await sendEmail({
        to: submitter.profile.email,
        subject: template(emailTemplate.subject),
        body: `<html>
          <head>
            <style>
              p { margin: 0; }
            </style>
          </head>
          <body>
            ${template(emailTemplate.body)}
          </body>
        </html>`
      })

    },

    /** Approves submissions group */
    approve: (context, subs) => {
      return subs.map(sub => context.dispatch('approvePerson', sub))
    },

    /** Approves a single person. */
    approvePerson: async (context, sub) => {

      /** Get the creator id if it exists for the given user. */
      // TODO: This would be a lot easier if the peopleId was stored in the user profile
      const personSubmissionId = async userId => {

        const userSubmissions = context.dispatch('users/loadOne', `${userId}/profile/submissions`, { root: true })

        const approvedSubmissionIds = Object.entries(await userSubmissions)
          .filter(([id, status]) => status === 'approved')
          .map(([id, status]) => id)

        // const peopleSubmissions = context.dispatch('submits/people/loadAll'`)
        // TODO: Get most recent approved submission
        const approvedPeopleSubmissionId = approvedSubmissionIds
          .find(sid => context.rootGetters['submissions/people/get'](sid))

        if (!approvedPeopleSubmissionId) return null

        const peopleSubmission = context.rootGetters['submissions/people/get'](approvedPeopleSubmissionId)

        return peopleSubmission?.peopleSubmissionId
      }

      // find associated person by sub.personId or fuzzy equal name match
      const person = context.rootGetters['people/get'](sub.personId) ||
        context.rootGetters['people/findBy'](person => almostEqual(person.name, name))
      const personNew = {
        ...person,
        ..._.pick(sub, Object.keys(personSubmission()))
      }

      // if submission contains photo - we resaving it to separate file related with creator record
      // submission photo file may be removed if submission record is removed, and we don't want to lose photo file
      // we use 'donwloadUrl' field as mark for backend function to resave file from provided url
      if (sub.photo?.url?.startsWith('http')) {
        personNew.photo = {
          downloadUrl: sub.photo.url
        }
      }

      // update user submission and people submission
      await context.dispatch('updateSubmission', {
        peopleSubmissionId: await personSubmissionId(sub.createdBy) || uid(),
        personId: personNew.id,
        sub,
        status: 'approved'
      })

      // save user
      await context.dispatch('people/save', {
        path: personNew.id,
        value: personNew
      }, { root: true })

      // send email
      const submitter = await context.dispatch('users/loadOne', sub.createdBy, { root: true })
      if (!submitter) {
        const message = `Could not find user ${sub.createdBy} for submission ${sub.id}`
        console.error(message, sub)
        throw new Error(message)
      }
      if (!submitter.profile.email) {
        const message = `No email for user ${sub.createdBy} of submission ${sub.id}`
        console.error(message, sub)
        throw new Error(message)
      }
      const personDetailUrl = `${window.location.origin}/person/${slugify(personNew.name)}`
      const imageHtml = personNew.photo?.downloadUrl ?
        `<p><a href="${personDetailUrl}" target="_blank"><img src="${personNew.photo.downloadUrl}" /></a></p>`
        : ''

      const approvedRecord = `<p><b><a href="${personDetailUrl}" target="_blank">${sub.name}</a></b></p>${imageHtml}`

      const emailTemplate = context.rootGetters['content/get']('email/submissions/approved/people')

      if (!emailTemplate || !emailTemplate.subject || !emailTemplate.body) {
        const message = 'No email template for books submission approving'
        console.error(message, sub)
        throw new Error(message)
      }

      const fullName = submitter.profile.name || 'friend'
      const firstName = fullName.includes(' ')
        ? fullName.slice(0, fullName.indexOf(' '))
        : fullName
      const lastName = fullName.includes(' ')
        ? fullName.slice(fullName.indexOf(' ') + 1)
        : ''

      const template = s => s.replace(/FIRST_NAME/g, firstName)
        .replace(/LAST_NAME/g, lastName)
        .replace(/FULL_NAME/g, fullName)
        .replace(/APPROVED_RECORDS/g, approvedRecord)

      // sending email
      await sendEmail({
        to: submitter.profile.email,
        subject: template(emailTemplate.subject),
        body: `<html>
          <head>
            <style>
              p { margin: 0; }
            </style>
          </head>
          <body>
            ${template(emailTemplate.body)}
          </body>
        </html>`
      })

    },

  }
})

export default module
