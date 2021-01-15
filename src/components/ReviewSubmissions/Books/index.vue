<script>
import BookGroup from '@/components/ReviewSubmissions/Books/Group'

export default {
  components: {
    BookGroup,
  },
  computed: {
    bookSubmissions() {
      return this.$store.getters['submissions/books/list']()
        .filter(sub => sub && !sub.approved && !sub.approvedBy && !sub.approvedAt)
    },
    submissionsGroups() {
      const groups = this.bookSubmissions
        .reduce((acc, sub) => {
          if (!acc[sub.group]) acc[sub.group] = {}
          acc[sub.group][sub.id] = sub
          return acc
        }, {})
      return Object.keys(groups).map(gid => {
        const ret = {
          id: gid,
          books: Object.keys(groups[gid]).reduce((acc, sid) => [...acc, groups[gid][sid]], [])
        }
        ret.at = ret.books[0].createdAt
        ret.by = ret.books[0].createdBy
        return ret
      })
    }
  },
  methods: {
    async approveAll() {
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch('submissions/books/approve', this.bookSubmissions)
      this.$store.commit('ui/setBusy', false)
    }
  }
}
</script>

<template>

  <div>

    <div v-if="submissionsGroups.length" class="is-flex is-justify-content-flex-end">
      <div><button :disabled="$uiBusy" class="button is-rounded" @click="approveAll">Approve all ({{ bookSubmissions.length }})</button></div>
    </div>

    <p v-if="!submissionsGroups.length" style="font-size: 20px;">No Submissions to review</p>

    <div v-else>
      <div v-for="(group, gid) of submissionsGroups" :key="gid" class="sub-group py-20">
        <BookGroup :group="group" />
      </div>
    </div>

  </div>

</template>

<style scoped lang="scss">
@import '@/assets/style/mixins.scss';
@import '@/assets/style/vars.scss';
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
