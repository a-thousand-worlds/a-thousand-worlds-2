import groupBy from 'lodash/groupBy'
import managed from '@/store/modules/managed'
import almostEqual from '@/util/almostEqual'
import iam from '@/util/iam'
import isSame from '@/util/isSame'
import mergeOne from '@/util/mergeOne'
import renderBook from '@/util/renderEmailBook'
import sendEmail from '@/util/sendEmail'
import uid from '@/util/chronouid'
import parseNames from '@/util/parseNames'

const module = mergeOne(managed('submits/books'), {
  getters: {
    filtered: state =>
      state.loaded
        ? Object.values(state.data).filter(book => {
            if (!state.filters.length) return true
            return state.filters.every(tag => (book.tags || []).includes(tag))
          })
        : [],
  },
  actions: {
    /** Submit books suggestions to Firebase */
    submit: async (context, submissions) => {
      const submissionGroupId = uid()

      // save final submission objects to submits/books
      const submissionsSaved = submissions.map(sub => {
        const sid = uid()
        const subData = {
          authors: Array.isArray(sub.authors) ? sub.authors.join(', ') : sub.authors || '',
          group: submissionGroupId,
          id: sid,
          illustrators: Array.isArray(sub.illustrators)
            ? sub.illustrators.join('. ')
            : sub.illustrators || '',
          isbn: sub.isbn ? sub.isbn.toString() : '',
          publisher: sub.publisher || '',
          reviewComment: '',
          status: 'pending',
          summary: sub.summary || '',
          tags: sub.tags || {},
          thumbnail: sub.thumbnail,
          title: sub.title,
          type: 'book',
          year: sub.year || '',
          ...(sub.createdBy ? { createdBy: sub.createdBy } : null),
        }
        // set state before saving to Firebase, otherwise value gets set to undefined
        context.commit('setOne', { path: sid, value: subData })
        context.dispatch('save', { path: sid, value: subData })

        return subData
      })

      // save user profile/submissions

      // allow createdBy to be overwritten (owner only)
      const reviewerGroups = groupBy(submissionsSaved, 'createdBy')
      Object.entries(reviewerGroups).forEach(async ([createdBy, submissions]) => {
        const profile =
          iam(context.rootState, 'owner') && createdBy
            ? context.rootState.users.data[createdBy]?.profile
            : context.rootState.user.user.profile

        await context.dispatch(
          'user/saveProfile',
          {
            ...profile,
            draftBooks: [],
            submissions: {
              ...profile.submissions,
              ...submissionsSaved.reduce(
                (accum, sub) => ({
                  ...accum,
                  [sub.id]: 'pending',
                }),
                {},
              ),
            },
          },
          { root: true },
        )
      })

      // auto approve submissions by owner
      if (iam(context.rootState, 'owner')) {
        await context.dispatch('approve', submissionsSaved)
      }
      // notify owner by email
      else {
        try {
          // we need any submission to get submitter information
          const submission = submissionsSaved[0]
          const profile =
            context.rootState.users.data[submission.createdBy]?.profile ||
            context.rootState.user.user.profile
          if (!profile) {
            const message = `Could not find user ${submission.createdBy}`
            console.error(message, submissionsSaved)
            return
          }

          const emailTemplatePath = `email/submissions/pending/book`
          const emailTemplate = context.rootGetters['content/get'](emailTemplatePath)

          if (!emailTemplate || !emailTemplate.subject || !emailTemplate.body) {
            const message = `No email template at content/${emailTemplatePath}`
            console.error(message, submissionsSaved)
            return
          }

          const fullName = profile.name || 'friend'
          const firstName = fullName.includes(' ')
            ? fullName.slice(0, fullName.indexOf(' '))
            : fullName
          const lastName = fullName.includes(' ') ? fullName.slice(fullName.indexOf(' ') + 1) : ''
          const items = submissions.length ? submissionsSaved.map(renderBook).join('\n') : ''

          await sendEmail({
            to: process.env.VUE_APP_ADMIN_EMAIL,
            subject: emailTemplate.subject,
            data: {
              FIRST_NAME: firstName,
              LAST_NAME: lastName,
              FULL_NAME: fullName,
              NEW_BOOKS: items,
            },
            body: `<html>
              <head>
                <style>
                  p { margin: 0; }
                </style>
              </head>
              <body>
                ${emailTemplate.body}
              </body>
            </html>`,
          })
        } catch (e) {
          console.error('Email failed to send')
          console.error(e)
        }
      }
    },

    /** Reject submission */
    reject: async (context, sub) => {
      sub.reviewedBy = context.rootState.user.user.uid
      sub.reviewedAt = new Date().toISOString()
      sub.status = 'rejected'

      // update book submission
      await context.dispatch('save', { path: sub.id, value: sub })
      context.commit('setOne', { path: sub.id, value: sub })

      // update submitter profile submission
      await context.dispatch(
        'users/save',
        {
          path: `${sub.createdBy}/profile/submissions/${sub.id}`,
          value: 'rejected',
        },
        { root: true },
      )

      // check submission group to be full reviewed so sending result email is required
      await context.dispatch('checkSubmissionGroup', sub.group)
    },

    /** Approves submissions group. */
    approve: async (context, subs) => {
      // this trick will make promises execution in sequence one by one
      await subs.reduce(
        (prev, sub) => prev.then(() => context.dispatch('approveBook', sub)),
        Promise.resolve(),
      )
    },

    /** Approves a single book submission. */
    approveBook: async (context, sub) => {
      // collect creators and create not existing people
      const authors = parseNames(sub.authors)
      const illustrators = parseNames(sub.illustrators)
        // filter out "same" illustrators so the creator is only added once
        .filter(
          illustrator => illustrator && !isSame(illustrator) && !authors.includes(illustrator),
        )
      const creators = {}

      // add author creators
      // use ids of existing authors if their names match
      // otherwise create a new author
      await Promise.all(
        authors.map(async author => {
          let cid = context.rootGetters['people/list']().find(person =>
            almostEqual(person.name, author),
          )?.id
          if (!cid) {
            cid = uid()
            await context.dispatch(
              'people/save',
              {
                path: cid,
                value: { id: cid, name: author, reviewedBy: context.rootState.user.user.uid },
              },
              { root: true },
            )
          }
          // add the author as an author-illustrator if illustrator is marked as "same"
          creators[cid] = isSame(sub.illustrators) ? 'author-illustrator' : 'author'
        }),
      )

      // add illustrator creators
      // use ids of existing illustrators if their names match
      // otherwise create a new illustrator
      await Promise.all(
        illustrators.map(async illustrator => {
          let cid = context.rootGetters['people/list']().find(person =>
            almostEqual(person.name, illustrator),
          )?.id
          if (!cid) {
            cid = uid()
            await context.dispatch(
              'people/save',
              {
                path: cid,
                value: { id: cid, name: illustrator, reviewedBy: context.rootState.user.user.uid },
              },
              { root: true },
            )
          }
          creators[cid] = creators[cid] ? 'author-illustrator' : 'illustrator'
        }),
      )

      // save book
      const bookId = uid()

      const bookCover = {}
      if (sub.cover?.url) bookCover.downloadUrl = sub.cover.url
      if (sub.cover?.base64) bookCover.base64 = sub.cover.base64
      if (!sub.cover && sub.thumbnail) bookCover.downloadUrl = sub.thumbnail

      await context.dispatch(
        'books/save',
        {
          path: bookId,
          value: {
            createdBy: sub.createdBy,
            creators,
            goodreads: sub.goodreads || '',
            id: bookId,
            isbn: sub.isbn,
            cover: bookCover,
            publisher: sub.publisher,
            reviewedAt: new Date().toISOString(),
            reviewedBy: context.rootState.user.user.uid,
            status: 'approved',
            submissionId: sub.id,
            summary: sub.summary,
            tags: sub.tags,
            thumbnail: sub.thumbnail,
            title: sub.title,
            year: sub.year,
          },
        },
        { root: true },
      )

      // update submitter profile submission
      await context.dispatch(
        'users/save',
        {
          path: `${sub.createdBy}/profile/submissions/${sub.id}`,
          value: 'approved',
        },
        { root: true },
      )

      // update book submission
      await context.dispatch('save', {
        path: sub.id,
        value: {
          ...sub,
          bookId,
          reviewedAt: new Date().toISOString(),
          reviewedBy: context.rootState.user.user.uid,
          status: 'approved',
        },
      })

      // check submission group to be full reviewved so sending result email is required
      await context.dispatch('checkSubmissionGroup', sub.group)
    },

    /** Collect all submissions from submission group */
    submissionsGroup: (context, gid) => {
      return context.state.loaded
        ? Object.keys(context.state.data)
            .map(id => context.state.data[id])
            .filter(sub => sub.group === gid)
        : []
    },

    /** Checks submission group and send emails if all group records are checked */
    checkSubmissionGroup: async (context, gid) => {
      const group = await context.dispatch('submissionsGroup', gid)
      if (!group.length) {
        // wrong submissions group?
        return
      }
      const hasPending = group.find(sub => sub.status === 'pending')
      if (hasPending) {
        // no need to do anything
        return
      }

      // send email
      // we need any submission from group to get submitter information
      const submission = group[0]
      const submitter = await context.dispatch('users/loadOne', submission.createdBy, {
        root: true,
      })
      if (!submitter) {
        const message = `Could not find user ${submission.createdBy}`
        console.error(message, group)
        return
      }
      if (!submitter.profile.email) {
        const message = `No email for user ${submission.createdBy}`
        console.error(message, group)
        return
      }

      const approved = group.filter(sub => sub.status === 'approved')
      const emailTemplatePath = `email/submissions/${
        approved.length ? 'approved' : 'rejected'
      }/book`
      const emailTemplate = context.rootGetters['content/get'](emailTemplatePath)

      if (!emailTemplate || !emailTemplate.subject || !emailTemplate.body) {
        const message = `No email template at ${emailTemplatePath}`
        console.error(message, group)
        return
      }

      const fullName = submitter.profile.name || 'friend'
      const firstName = fullName.includes(' ') ? fullName.slice(0, fullName.indexOf(' ')) : fullName
      const lastName = fullName.includes(' ') ? fullName.slice(fullName.indexOf(' ') + 1) : ''
      const approvedRecords = approved.length ? approved.map(el => renderBook(el)).join('\n') : ''

      // send to submitter
      // if it fails, catch the error since the approval still succeeded
      // sendEmail will log an error
      try {
        await sendEmail({
          to: submitter.profile.email,
          subject: emailTemplate.subject,
          data: {
            FIRST_NAME: firstName,
            LAST_NAME: lastName,
            FULL_NAME: fullName,
            NEW_BOOKS: approvedRecords,
          },
          body: `<html>
            <head>
              <style>
                p { margin: 0; }
              </style>
            </head>
            <body>
              ${emailTemplate.body}
            </body>
          </html>`,
        })
      } catch (e) {
        console.error('Email failed to send')
        console.error(e)
      }
    },
  },
})

export default module
