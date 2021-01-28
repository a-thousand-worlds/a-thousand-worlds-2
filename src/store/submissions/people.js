import _ from 'lodash'
import mergeOne from '@/util/mergeOne'
import managed from '@/store/modules/managed'
import { v4 as uid } from 'uuid'
import dayjs from 'dayjs'

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
    updateSubmission: async (context, { peopleId, sub, status }) => {

      // update person submission
      await context.dispatch('update', {
        path: sub.id,
        values: {
          reviewedBy: context.rootState.user.user.uid,
          reviewedAt: dayjs().format(),
          status,
          ...peopleId ? { peopleId } : null
        },
      })

      context.commit('setOne', { path: sub.id, value: sub })

      // update user profile submission
      await context.dispatch('users/save', {
        path: `${sub.createdBy}/profile/submissions/${sub.id}`,
        value: status
      }, { root: true })
    },

    /** Rejects a submission. */
    reject(context, sub) {
      return context.dispatch('updateSubmission', { sub, status: 'rejected' })
    },

    /** Approves submissions group */
    approve: (context, subs) => {

      /** Get the creator id if it exists for the given user. */
      // TODO: This would be a lot easier if the peopleId was stored in the user profile
      const existingPersonId = async userId => {

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

        return peopleSubmission?.peopleId
      }

      return subs.map(async sub => {

        // use existing person id if it exists
        const id = await existingPersonId(sub.createdBy) || uid()

        const personNew = {
          id,
          ..._.pick(sub, [
            'awards',
            'bio',
            'bonus',
            'curateInterest',
            'gender',
            'identities',
            'name',
            'photo',
            'pronoun',
            'title',
            'website',
          ])
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
        await context.dispatch('updateSubmission', { peopleId: id, sub, status: 'approved' })

        // save user
        await context.dispatch('people/save', {
          path: id,
          value: personNew
        }, { root: true })
      })
    },

  }
})

export default module
