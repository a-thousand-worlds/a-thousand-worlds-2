<script>
import dayjs from 'dayjs'
import ApprovalBookWidget from '@/components/ApprovalBookWidget'

export default {
  components: {
    ApprovalBookWidget
  },
  data() {
    return {
      loading: false,
      subs: {},
      subsGroups: [],
      submitters: {}
    }
  },
  created() {
    this.reloadSubmissions()
  },
  methods: {
    approveGroup(group) {
      const books = group.books.map(book => book.title).join(', ')
      if (confirm(`Approve books <${books}>?`)) {
        this.loading = true
        this.$store.commit('ui/setBusy', true)
        this.$store.dispatch('bookSubmissions/approve', group.books)
          .then(() => {
            this.reloadSubmissions()
            this.$store.commit('ui/setBusy', false)
          })
      }
    },
    submitterLoaded(user) {
      this.submitters[user.uid] = `${user.firstName} ${user.lastName}`
    },
    reloadSubmissions() {
      this.loading = true
      this.$store.dispatch('loadContributorsSubmissions')
        .then(data => {
          this.subs = data
          const booksSubs = Object.keys(data?.books || {})
            .map(id => data.books[id])
            .filter(sub => !sub.approved && !sub.approvedBy && !sub.approvedAt)
          // const bundlesSubs = Object.keys(data.bundles)
          // .map(id => data.bundles[id])
          this.subsGroups = []
          const subsGroups = booksSubs
            .reduce((acc, sub) => {
              if (!acc[sub.group]) {
                acc[sub.group] = {}
              }
              acc[sub.group][sub.id] = sub
              return acc
            }, {})
          // use 0 timout to give vue time to destroy
          // objects from previous list
          setTimeout(() => {
            // eslint-disable-next-line  fp/no-mutating-methods
            this.subsList = [...booksSubs]
              .sort((a, b) => {
                const dA = dayjs(a.createdAt)
                const dB = dayjs(b.createdAt)
                return dA.isSame(dB) ? 0 : dA.isBefore(dB) ? 1 : -1
              })
            this.subsGroups = Object.keys(subsGroups)
              .map(gid => {
                const ret = {
                  id: gid,
                  books: Object.keys(subsGroups[gid]).reduce((acc, sid) => [...acc, subsGroups[gid][sid]], [])
                }
                ret.at = ret.books[0].createdAt
                ret.by = ret.books[0].createdBy
                return ret
              })
            // console.log('books subs groups', this.subsGroups)
            this.loading = false
          }, 0)
        })
    },
    rejectBookSubmission(sub, i) {
      console.log('reject', i, sub)
      this.loading = true
      this.$store.dispatch('bookSubmissions/reject', sub)
        .then(() => {
          this.subsGroups = this.subsGroups.map(group => {
            group.books = group.books.filter(s => s.id !== sub.id)
            return group
          })
          alert('Rejected')
        })
    },
    /*
    approveBookSubmission(sub, i) {
      this.loading = true
      this.$store.dispatch('bookSubmissions/approve', sub)
        .then(() => {
          this.subsList = this.subsList.filter(s => s.id !== sub.id)
          alert('approved')
        })
    },
    */
    markBookSubmission(sub, i) {
      console.log('mark', i, sub)
    }
  }
}
</script>

<template>

  <section class="section">

    <div class="level is-mobile">
      <div class="level-left">
        <div class="level-item">
          <h2>Review Submissions</h2>
        </div>
      </div>
    </div>

    <p v-if="!subsGroups.length">No Submissions to review</p>

    <div class="sub-group" v-for="(group, gid) of subsGroups" :key="gid">
      <div>
        <button
          :disabled="loading"
          @click="approveGroup(group)"
          class="level-item is-flat is-underlined is-uppercase">Approve</button>
        <h3>BOOK</h3>
      </div>
      <div v-for="(sub, i) of group.books" :key="i">
        <approval-book-widget
          @mark-me="markBookSubmission($event, gid, i)"
          @reject-me="rejectBookSubmission($event, gid, i)"
          @submitter-loaded="submitterLoaded($event)"
          v-model="subsGroups[gid].books[i]"/>
      </div>
      <div class="has-text-right">
        by {{submitters[group.by]}} at {{$dateFormat(group.at)}}
      </div>
    </div>

  </section>

</template>

<style scoped lang="scss">
@import '@/assets/main.scss';
.sub-group {
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid $atw-base;
}
</style>
