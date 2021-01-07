<script>
import dayjs from 'dayjs'
import ApprovalBookWidget from '@/components/ApprovalBookWidget'
import Loader from '@/components/Loader'

export default {
  components: {
    ApprovalBookWidget,
    Loader,
  },
  data() {
    return {
      loading: false,
      subsGroups: [],
      submitters: {}
    }
  },
  computed: {
    bookSubmissions() {
      return this.$store.getters['bookSubmissions/list']()
        .filter(sub => sub && !sub.approved && !sub.approvedBy && !sub.approvedAt)
    }
  },
  created() {
    this.loadGroups()
  },
  methods: {
    async approveAll() {
      this.loading = true
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch('bookSubmissions/approve', this.bookSubmissions)
      this.loadGroups()
      this.$store.commit('ui/setBusy', false)
    },
    async approveGroup(group) {
      this.loading = true
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch('bookSubmissions/approve', group.books)
      this.loadGroups()
      this.$store.commit('ui/setBusy', false)
    },
    submitterLoaded(user) {
      this.submitters[user.uid] = user.name
    },
    async loadGroups() {
      this.loading = true
      // const bundlesSubs = Object.keys(data.bundles)
      // .map(id => data.bundles[id])
      this.subsGroups = []
      const subsGroups = this.bookSubmissions
        .reduce((acc, sub) => ({
          ...acc,
          [sub.group]: {
            ...acc[sub.id],
            sub,
          }
        }), {})
      // use 0 timout to give vue time to destroy
      // objects from previous list
      setTimeout(() => {
        // eslint-disable-next-line  fp/no-mutating-methods
        this.subsList = [...this.bookSubmissions]
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
        this.loading = false
      }, 0)
    },
    async rejectBookSubmission(sub) {
      this.loading = true
      await this.$store.dispatch('bookSubmissions/reject', sub)
      this.subsGroups = this.subsGroups.map(group => {
        group.books = group.books.filter(s => s.id !== sub.id)
        return group
      })
      this.loading = false
      this.$store.dispatch('ui/popup', 'Book rejected')
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

  <div>

    <div v-if="bookSubmissions.length" class="is-flex is-justify-content-flex-end">
      <div><button class="button is-rounded" @click="approveAll">Approve all ({{ bookSubmissions.length }})</button></div>
    </div>

    <div v-if="loading" class="my-50">
      <Loader />
    </div>

    <p v-if="!subsGroups.length" style="font-size: 20px;">No Submissions to review</p>

    <div v-else>
      <div v-for="(group, gid) of subsGroups" :key="gid" class="sub-group py-20">
        <div>
          <button
            :disabled="loading"
            class="level-item is-flat is-underlined is-uppercase"
            @click="approveGroup(group)">Approve</button>
        </div>
        <div v-for="(sub, i) of group.books" :key="i">
          <ApprovalBookWidget
            v-model="subsGroups[gid].books[i]"
            @mark-me="markBookSubmission($event, gid, i)"
            @reject-me="rejectBookSubmission($event, gid, i)"
            @submitter-loaded="submitterLoaded($event)" />
        </div>
        <div class="has-text-right mt-20">
          {{ submitters[group.by] }}
        </div>
      </div>
    </div>

  </div>

</template>

<style scoped lang="scss">
@import '@/assets/main.scss';
.sub-group {
  @include primary(border-bottom-color);
  padding-top: 2rem;
  margin-top: 2rem;
  border-bottom: 1px solid;
}
.sub-group:last-child {
  border: none;
}
</style>
