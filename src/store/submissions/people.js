import mergeOne from '@/util/mergeOne'
import managedCollection from '@/store/collection/managed'
import { v4 as uid } from 'uuid'
import dayjs from 'dayjs'

const module = mergeOne(managedCollection('submits/people'), {
  actions: {

    /** Submit people form to Firebase */
    submit: async (context, submission) => {
      const profile = context.rootState.user.user.profile
      const id = uid()
      const submissionApprovable = {
        ...submission,
        approveComment: '',
        approved: false,
        approvedAt: null,
        approvedBy: null,
        id,
        type: 'people',
      }

      // save submission
      context.commit('setOne', { path: id, value: submissionApprovable })
      await context.dispatch('save', { path: id, value: submissionApprovable })

      // save submission id to profile
      const profileNew = {
        ...profile,
        draftPerson: null,
        submissions: {
          ...profile.submissions,
          [id]: 'review',
        }
      }
      await context.dispatch('user/saveProfile', profileNew, { root: true })
    },

    /** Update submission status */
    updateSubmissionStatus: async (context, { sub, status }) => {

      // update person submission
      await context.dispatch('update', {
        path: sub.id,
        values: {
          approvedBy: context.rootState.user.user.uid,
          approvedAt: dayjs().format(),
        },
      })

      context.commit('setOne', { path: sub.id, value: sub })

      // update user profile submission
      await context.dispatch('user/save', {
        path: `profile/submissions/${sub.id}`,
        value: status
      }, { root: true })
    },

    /** Rejects a submission. */
    reject(context, sub) {
      return context.dispatch('updateSubmissionStatus', { sub, status: 'reject' })
    },

    /** Approves submissions group */
    approve: (context, sub) => {
      return context.dispatch('updateSubmissionStatus', { sub, status: 'reject' })
    },

  }
})

export default module
