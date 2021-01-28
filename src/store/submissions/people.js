import _ from 'lodash'
import { v4 as uid } from 'uuid'
import dayjs from 'dayjs'
import managed from '@/store/modules/managed'
import almostEqual from '@/util/almostEqual'
import mergeOne from '@/util/mergeOne'

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

      // update person submission
      await context.dispatch('update', {
        path: sub.id,
        values: {
          reviewedBy: context.rootState.user.user.uid,
          reviewedAt: dayjs().format(),
          status,
          ...peopleSubmissionId ? { peopleSubmissionId } : null,
          ...personId ? { personId } : null,
        },
      })

      context.commit('setOne', { path: sub.id, value: sub })

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
    reject(context, sub) {
      return context.dispatch('updateSubmission', { sub, status: 'rejected' })
    },

    /** Approves submissions group */
    approve: (context, subs) => {

      /** Gets the person with an almost equal name. */
      const person = async sub =>
        context.rootGetters['people/findBy'](person => almostEqual(person.name, sub.name))

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

      return subs.map(async sub => {

        const personNew = {
          id: await person(sub),
          ...await person(sub),
          ..._.pick(sub, [
            'awards',
            'bio',
            'bonus',
            'curateInterest',
            'gender',
            'identities',
            'name',
            'photo',
            'title',
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
        console.log('personNew', personNew)

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
      })
    },

  }
})

export default module
