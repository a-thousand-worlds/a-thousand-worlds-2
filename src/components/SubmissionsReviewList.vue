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
      subsList: [],
      subsGroups: [],
      submitters: {}
    }
  },
  created() {
    this.reloadSubmissions()
  },
  methods: {
    submitterLoaded(user) {
      this.submitters[user.uid] = `${user.firstName} ${user.lastName}`
      console.log('s', user, this.submitters)
    },
    reloadSubmissions() {
      this.loading = true
      this.$store.dispatch('loadContributorsSubmissions')
        .then(data => {
          this.subs = data
          const booksSubs = Object.keys(data.books)
            .map(id => data.books[id])
          const bundlesSubs = Object.keys(data.bundles)
            .map(id => data.bundles[id])
          this.subsList = []
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
            this.subsList = [...booksSubs, ...bundlesSubs]
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
    deleteBookSubmission(sub, i) {
      console.log('delete', i, sub)
      this.loading = true
      this.$store.dispatch('deleteSubmission', sub)
        .then(() => {
          this.subsList = this.subsList.filter(s => s.id !== sub.id)
          alert('Deleted')
          // this.reloadSubmissions()
        })
    },
    approveBookSubmission(sub, i) {
      this.loading = true
      this.$store.dispatch('approveSubmission', sub)
        .then(() => {
          this.subsList = this.subsList.filter(s => s.id !== sub.id)
          alert('approved')
        })
    },
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

    <div class="sub-group" v-for="(group, gid) of subsGroups" :key="gid">
      <div>
        <button :disabled="loading" class="level-item is-flat is-underlined is-uppercase">Approve</button>
        <h3>BOOK</h3>
      </div>
      <div v-for="(sub, i) of group.books" :key="i">
        <approval-book-widget
          @mark-me="markBookSubmission($event, gid, i)"
          @delete-me="deleteBookSubmission($event, gid, i)"
          @approve-me="approveBookSubmission($event, gid, i)"
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
