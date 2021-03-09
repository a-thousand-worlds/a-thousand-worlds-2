<script>
import Group from '@/components/ReviewSubmissions/Group'

export default {
  components: {
    Group,
  },
  props: {
    status: {
      type: String,
      validator: value => ['approved', 'pending', 'rejected'].indexOf(value) !== -1,
      default: 'pending',
    },
    type: {
      type: String,
      required: true,
      validator: value => ['books', 'bundles', 'people'].indexOf(value) !== -1,
    },
  },
  computed: {
    submissions() {
      return this.$store.getters[`submissions/${this.type}/list`]()
        .filter(sub => sub && sub.status === this.status)
    },
    submissionsGroups() {
      const groups = this.submissions
        .reduce((acc, sub) => {
          if (!acc[sub.group]) acc[sub.group] = {}
          acc[sub.group][sub.id] = sub
          return acc
        }, {})
      return Object.keys(groups).map(gid => {
        const subs = Object.keys(groups[gid])
          .reduce((acc, sid) => [...acc, groups[gid][sid]], [])
        return {
          id: gid,
          at: subs[0].createdAt,
          by: subs[0].createdBy,
          [this.type]: subs
        }
      })
    }
  },
  methods: {
    async approveAll() {
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch(`submissions/${this.type}/approve`, this.submissions)
      this.$store.commit('ui/setBusy', false)
      this.$store.dispatch('ui/popup', 'All submissions approved')
    }
  }
}
</script>

<template>

  <div>

    <div v-if="submissionsGroups.length && status === 'pending'" class="is-flex is-justify-content-flex-end">
      <div><button :disabled="$uiBusy" class="button is-rounded" @click="approveAll">Approve all ({{ submissions.length }})</button></div>
    </div>

    <p v-if="!submissionsGroups.length" style="font-size: 20px;">No submissions to review</p>

    <div v-else>
      <div v-for="(group, gid) of submissionsGroups" :key="gid" class="sub-group py-20">
        <Group :group="group" :type="type" :status="status" />
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
