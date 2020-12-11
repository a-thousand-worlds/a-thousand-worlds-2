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
      subsList: []
    }
  },
  created() {
    this.loading = true
    this.$store.dispatch('loadContributorsSubmissions')
      .then(data => {
        this.subs = data
        const booksSubs = Object.keys(data.books)
          .map(id => data.books[id])
        const bundlesSubs = Object.keys(data.bundles)
          .map(id => data.bundles[id])
        // eslint-disable-next-line  fp/no-mutating-methods
        this.subsList = [...booksSubs, ...bundlesSubs]
          .sort((a, b) => {
            const dA = dayjs(a.createdAt)
            const dB = dayjs(b.createdAt)
            return dA.isSame(dB) ? 0 : dA.isBefore(dB) ? -1 : 1
          })
        this.loading = false
      })
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
      <div class="level-right">
        <button :disabled="loading" class="level-item is-flat is-underlined is-uppercase">Approve selected items</button>
      </div>
    </div>

    <div v-for="(sub, i) of subsList" :key="i">
      <approval-book-widget v-if="sub.type === 'book'" v-model="subsList[i]"/>
    </div>

  </section>

</template>
