import _ from 'lodash'
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
          approved: true,
          approvedBy: context.rootState.user.user.uid,
          approvedAt: dayjs().format(),
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
      return subs.map(async sub => {

        // TODO: Check for existing person
        const id = uid()

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
            // 'photo',
            'pronoun',
            'title',
            'website',
          ])
        }

        // update user submission and people submission
        await context.dispatch('updateSubmission', { peopleId: id, sub, status: 'approved' })

        // save user
        await context.dispatch('creators/save', {
          path: id,
          value: personNew
        }, { root: true })
      })
    },

  }
})

export default module
