<script>
import Book from './Book'
import Person from './Person'
import UserEngagements from '@/store/userEngagements'

export default {
  components: {
    Book,
    Person,
  },
  props: {
    group: {
      required: true,
    },
    type: {
      type: String,
      required: true,
      validator: value => ['books', 'bundles', 'people'].indexOf(value) !== -1,
    }
  },
  data() {
    return {
      submitter: null,
      submitterLoading: true
    }
  },
  computed: {
    submitterName() {
      if (this.submitterLoading) return ''
      return this.submitter.name || `${this.submitter.firstName} ${this.submitter.lastName}`
    },
    submitterRoles() {
      if (this.submitterLoading) return ''
      return Object.keys(this.submitter.affiliations?.selectedEngagementCategories || {})
        .map(code => {
          if (!this.submitter.affiliations.selectedEngagementCategories[code]) return ''
          if (code === 'other') return this.submitter.affiliations.otherEngagementCategory
          return UserEngagements.find(el => el.id === code)?.text || ''
        })
        .filter(line => line && line.length)
        .join(', ')
    },
    submitterOrganization() {
      if (this.submitterLoading || !this.submitter.affiliations?.organization?.length) return null
      return this.submitter.affiliations.organization
    },
    submitterOrganizationLink() {
      if (this.submitterLoading || !this.submitter.affiliations?.organizationLink?.startsWith('http')) return null
      return this.submitter.affiliations.organizationLink
    }
  },
  created() {
    this.$store.dispatch('users/loadOne', this.group.by)
      .then(submitter => {
        this.submitter = submitter.profile
        this.submitterLoading = false
      })
  },
  methods: {
    async approveGroup() {
      this.$store.commit('ui/setBusy', true)
      await this.$store.dispatch(`submissions/${this.type}/approve`, this.group[this.type])
      this.$store.commit('ui/setBusy', false)
    },
  }
}
</script>

<template>

  <div>

    <p v-if="!group?.[type]?.length" style="font-size: 20px;">No Submissions to review</p>

    <div v-else>
      <div>
        <button
          :disabled="$uiBusy"
          class="level-item is-flat is-underlined is-uppercase"
          @click="approveGroup()">Approve</button>
      </div>
      <div v-for="(sub, i) of group[type]" :key="i">
        <Book v-if="type === 'books'" :submission="sub" />
        <Person v-if="type === 'people'" :submission="sub" />
      </div>
      <div class="has-text-right mt-20">
        <span>{{ submitterName }}</span>
        <span class="ml-2">{{ submitterRoles }}</span>
        <span v-if="submitterOrganization">
          <span class="ml-2">at</span>
          <a target="_blank" class="ml-2" v-if="submitterOrganizationLink" :href="submitterOrganizationLink">{{ submitterOrganization }}</a>
          <span class="ml-2" v-else>{{ submitterOrganization }}</span>
        </span>
      </div>
    </div>

  </div>

</template>
