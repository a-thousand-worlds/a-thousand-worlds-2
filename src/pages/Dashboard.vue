<script>
import Content from '@/components/Content'
import ContributorProfileForm from '@/components/Dashboard/ContributorProfileForm'
import ContributorProfilePreview from '@/components/Dashboard/ContributorProfilePreview'
import CreatorProfilePreview from '@/components/Dashboard/CreatorProfilePreview'
import Impersonate from '@/components/Dashboard/Impersonate'
import InviteWidget from '@/components/InviteWidget'
import Loader from '@/components/Loader'
import ManageCollectionsPreview from '@/components/Dashboard/ManageCollectionsPreview'
import MessageSequence from '@/components/MessageSequence'
import ReviewSubmissionsPreview from '@/components/Dashboard/ReviewSubmissionsPreview'
import YourBookSubmissions from '@/components/Dashboard/YourBookSubmissions'

export default {
  components: {
    Content,
    ContributorProfileForm,
    ContributorProfilePreview,
    CreatorProfilePreview,
    Impersonate,
    InviteWidget,
    Loader,
    ManageCollectionsPreview,
    MessageSequence,
    ReviewSubmissionsPreview,
    YourBookSubmissions,
  },
  data() {
    return {
      inviteMessageCompleted: false,
      submissionFormMessageCompleted: false,
      templates: {
        showEmailTemplates: false,
      },
    }
  },
  computed: {
    bookSubmissions() {
      return this.$store.getters['submissions/books/list']()
    },
    loaded() {
      return this.$store.state.user.user
    },
    username() {
      return this.$store.state.user.user?.profile.name || this.$store.state.user.user?.profile.email
    },
    hasPendingContributorProfile() {
      // if affiliations are set, we know the user completed the ContributorProfileForm
      // returns true for non-contributors

      const affiliations = this.$store.state.user.user?.profile.affiliations
      return (
        this.$iam('contributor') &&
        (!affiliations ||
          (!affiliations.website &&
            !affiliations.organization &&
            !affiliations.organizationLink &&
            !(
              Object.values(affiliations.selectedEngagementCategory).length > 0 ||
              affiliations.otherEngagementCategory
            )))
      )
    },
  },
  created() {
    // cuz submissions collection is readable only per element for non owners
    // we need to preload them
    const submissions = this.$store.state.user.user.profile.submissions || {}
    const preloads = Object.keys(submissions).map(submissionId => {
      return this.$store.dispatch('submissions/books/loadOne', submissionId)
    })
    Promise.all(preloads)
  },
}
</script>

<template>
  <div class="is-flex is-justify-content-center">
    <div class="is-flex-grow-1 mx-20" style="max-width: 600px; position: relative">
      <!-- page title -->
      <h1 class="title page-title divider-bottom">Your Dashboard</h1>

      <!-- your account -->
      <div v-if="!hasPendingContributorProfile" class="header-options mr-10">
        <router-link :to="{ name: 'Account' }" style="color: black">Your Account</router-link>
      </div>

      <!-- loader -->
      <div v-if="!loaded" class="has-text-centered" style="margin-top: 20vh">
        <Loader />
      </div>

      <!-- Creator Profile Preview -->
      <section v-if="$iam('creator')" class="section divider-bottom">
        <CreatorProfilePreview />
      </section>

      <div v-if="submissionFormMessageCompleted">
        <!-- Review Submissions -->
        <section
          v-if="$can('review')"
          class="section my-30 py-0"
          :class="{ 'divider-bottom': !$can('manageCollections') }"
        >
          <h2>Review Submissions</h2>
          <ReviewSubmissionsPreview />
        </section>

        <!-- Manage Collections -->
        <section v-if="$can('manageCollections')" class="section my-30 py-0 divider-bottom">
          <h2>Manage Collections</h2>
          <ManageCollectionsPreview />
          <div class="mb-30">
            <router-link :to="{ name: 'TagsManager' }">Tags Manager</router-link>
          </div>
        </section>
      </div>

      <!-- Submit Book or Bundle -->
      <section v-if="$can('submitBookOrBundle')" class="section">
        <div v-if="$iam('contributor')">
          <ContributorProfileForm v-if="hasPendingContributorProfile" welcome />
          <ContributorProfilePreview v-else class="mb-30" />
        </div>

        <div v-if="!hasPendingContributorProfile">
          <!-- Welcome message sequence -->
          <MessageSequence
            ref="submissionFormMessage"
            storageKey="dashboardSubmissionForms"
            @load="submissionFormMessageCompleted = $event.completed"
            @completed="submissionFormMessageCompleted = $event"
          >
            <template>
              <h2 class="field">
                <Content name="instructions/dashboard/welcome/0/title">Welcome!</Content>
              </h2>
              <div class="field">
                <Content name="instructions/dashboard/welcome/0/body">
                  As a leader in the industry and a contributor to ATW you have special access to
                  two Submission Forms: BOOKS and BUNDLES. Both forms are available for you to use
                  as many times as you like and at any time. The world is full of beautiful picture
                  books—we want to hear what has captured your heart! To that end we hope that you
                  spread the love and include picture books that are not in-house and you have not
                  personally worked on.
                </Content>
              </div>
            </template>

            <template>
              <h2 class="field">
                <Content name="instructions/dashboard/welcome/1/title">Curatorial Process</Content>
              </h2>
              <div class="field">
                <Content name="instructions/dashboard/welcome/1/body">
                  Our vision is to create a directory that exemplifies beautiful art and innovative
                  storytelling. Our mission is to amplify BIPOC voices and create a space for BIPOC
                  creators and leaders. To that end we are creating a space dedicated to only BIPOC
                  creators. All picture books submitted for consideration need to have both BIPOC
                  illustrator AND BIPOC author. We also have a separate ATW Curatorial team
                  consisting of BIPOC leaders who is tasked with a final curation of all
                  submissions. This means that some of your picture books may not be included in the
                  directory, but know that we always welcome more submissions from you. Thank you.
                </Content>
              </div>
            </template>

            <template>
              <p class="field">
                <Content name="instructions/welcome/2/body"
                  >When you're ready, click on the BOOK button below to submit a book!</Content
                >
              </p>
            </template>
          </MessageSequence>

          <h2>
            {{ $can('submitPerson') ? 'Submission Forms' : 'Suggest a book' }}
            <span
              v-if="submissionFormMessageCompleted"
              @click.prevent="$refs.submissionFormMessage.toggle"
              v-tippy="{ content: 'Help' }"
              class="has-text-right"
              style="
                margin-left: 10px;
                font-size: 14px;
                white-space: nowrap;
                cursor: pointer;
                vertical-align: middle;
              "
              ><i class="far fa-question-circle"
            /></span>
          </h2>

          <div class="field is-grouped">
            <div class="control">
              <router-link
                class="button is-outlined is-primary"
                :to="{ name: 'BookSubmissionForm' }"
                >Book</router-link
              >
            </div>
            <div v-if="$can('submitPerson')" class="control">
              <router-link
                class="button is-outlined is-primary"
                :to="{ name: 'PersonSubmissionForm' }"
                >Person</router-link
              >
            </div>
            <!-- <div class="control">
              <router-link class="button is-outlined is-primary" :to="{name:'BundleSubmissionForm'}">Bundle</router-link>
            </div> -->
          </div>
        </div>
      </section>

      <!-- Invite -->
      <section
        v-if="$can('invite') && !hasPendingContributorProfile && submissionFormMessageCompleted"
        class="section bordered-top divider-bottom py-50"
      >
        <h2>
          Invite Users
          <span
            v-if="inviteMessageCompleted"
            @click.prevent="$refs.inviteMessage.toggle"
            v-tippy="{ content: 'Help' }"
            class="has-text-right"
            style="
              margin-left: 10px;
              font-size: 14px;
              white-space: nowrap;
              cursor: pointer;
              vertical-align: middle;
            "
            ><i class="far fa-question-circle"
          /></span>
        </h2>

        <MessageSequence
          ref="inviteMessage"
          storageKey="dashboardInvite"
          @load="inviteMessageCompleted = $event.completed"
          @completed="inviteMessageCompleted = $event"
        >
          <template>
            <h2 class="field">
              <Content name="instructions/dashboard/invite/title">Other Ways to Contribute</Content>
            </h2>
            <div class="field">
              <Content name="instructions/dashboard/invite/body">
                Also you will see on your Dashboard that there is an INVITE USERS window. This is a
                place where you can easily invite people to use ATW. Just type in the names - emails
                of anyone you think should know about A THOUSAND WORLDS and click send. This is not
                a mailing list, they will receive only one email notification from ATW saying hello
                and letting them know about us. If you are as in love with our mission please
                consider helping us spread the word!
              </Content>
            </div>
          </template>
        </MessageSequence>

        <InviteWidget ref="invite" />
        <ul class="my-20">
          <li v-if="$can('editEmailTemplates')">
            <router-link :to="{ name: 'EmailTemplates' }">Edit email templates</router-link>
          </li>
          <li v-if="$can('manageInvites')">
            <router-link :to="{ name: 'InvitationManager' }">View invitations</router-link>
          </li>
        </ul>
      </section>

      <!-- Your Book Submissions (non-owner) -->
      <section
        v-if="$can('submitBookOrBundle') && !$iam('owner') && bookSubmissions.length"
        class="section my-30 py-0"
      >
        <YourBookSubmissions />
      </section>

      <section v-if="$iam('owner')" class="section">
        <Impersonate />
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import 'bulma/sass/utilities/_all.sass';
@import '@/assets/style/mixins.scss';

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
}

.bordered-top {
  @include primary(border-top-color);
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid;
}

a.button {
  min-width: 200px;
  border-radius: 20px;
}
</style>

<style lang="scss">
.ck.ck-editor__editable_inline {
  padding: 0px !important;
  & > :first-child,
  & > :last-child {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
  }
}
</style>
