<script>

import SubmissionWidget from '@/components/SubmissionWidget'
import SubmissionsReviewList from '@/components/SubmissionsReviewList'

export default {
  components: {
    SubmissionWidget,
    SubmissionsReviewList
  },
  data() {
    return {
      invite: {
        dropdownActive: '',
        emails: '',
        role: null,
      },
      templates: {
        showEmailTemplates: false,
      },
      roles: ['User', 'Contributor', 'Creator', 'Advisor', 'Owner'],
    }
  },
  computed: {
    username() {
      return this.$store.state.user?.profile.name || this.$store.state.user?.profile.email
    },
    hasSubmissions() {
      if (Array.isArray(this.$store.state.user.profile.submissions) && this.$store.state.user.profile.submissions.length) {
        return true
      }
      return false
    },
    canSuggest() {
      return this.$iam('contributor') || this.$iam('admin') || this.$iam('superadmin')
    },
    canApprove() {
      return this.$iam('admin') || this.$iam('superadmin')
    },
    canInvite() {
      return this.$iam('admin') || this.$iam('superadmin')
    },
  },
  methods: {
    setInviteRole(value) {
      this.invite.role = value
      this.invite.dropdownActive = false
    },
    setInviteDropdown(value) {
      this.invite.dropdownActive = value
    },
    toggleInviteDropdown() {
      this.invite.dropdownActive = !this.invite.dropdownActive
    },
  },
}

</script>

<template>

<div class="page" style="position: relative" @click.prevent="setInviteDropdown(false)">

  <h1 class="title page-title">Your Dashboard</h1>

  <div class="header-options mr-10">
    <router-link :to="{ name: 'Profile' }" style="color: black;">Edit your profile</router-link>
  </div>

  <section v-if="canSuggest" class="section bordered-top">
    <h2>Suggest a book or bundle for A Thousand Worlds</h2>
    <div class="field is-grouped">
      <div class="control">
        <router-link class="button is-outlined is-primary" :to="{name:'BookSuggest'}">Book</router-link>
      </div>
      <div class="control">
        <router-link class="button is-outlined is-primary" :to="{name:'BundleSuggest'}">Bundle</router-link>
      </div>
    </div>
  </section>

  <section v-if="canInvite" class="section bordered-top">
    <h2>Invite users</h2>
    <div class="field is-grouped is-flex">

      <div class="control is-flex-grow-1">
        <input class="input" v-model="invite.email" />
      </div>

      <div class="control">
        <div :class="{ dropdown: true, 'is-active': invite.dropdownActive }">
          <div class="dropdown-trigger">
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" @click.prevent.stop="toggleInviteDropdown">
              <span>{{ invite.role || 'CHOOSE ROLE' }}</span>
              <span class="icon is-small">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
          <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <a :class="{ 'dropdown-item': true, 'is-active': invite.role === role }" v-for="role in roles" :key="role" @click.prevent="setInviteRole(role)">
                {{ role }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="control">
        <button class="button is-primary">Send</button>
      </div>

    </div>

    <div class="field">
      <router-link :to="{ name: 'Invite' }">Edit email templates</router-link>
    </div>

  </section>

  <section class="section" v-if="canSuggest && hasSubmissions">
    <h2>Your Submissions</h2>
    <div class="columns is-multiline">
      <div class="column is-6-tablet is-4-desktop is-3-widescreen" v-for="sid of $store.state.user.profile.submissions" :key="sid">
        <submission-widget class="submission-widget" :sid="sid"></submission-widget>
      </div>
    </div>
  </section>

  <submissions-review-list v-if="canApprove"/>

</div>

</template>

<style lang="scss" scoped>
@import '@/assets/main.scss';

.page {
  width: 100%;
  // max-width: 720px;
  margin: auto;
  padding: 0.75rem;
}

h2.title {
  font-size: 1.5rem;
}

.header-options {
  display: flex;
  justify-content: center;

  @include from($desktop) {
    position: absolute;
    top: 35px;
    right: 0;
  }
}

.submission-widget {
  border: 1px solid $atw-base;
  // margin-bottom: 0.75rem;
  // margin-left: 0.75rem;
}

.bordered-top {
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid $atw-base;
}

a.button {
  min-width: 200px;
  border-radius: 20px;
}

</style>
