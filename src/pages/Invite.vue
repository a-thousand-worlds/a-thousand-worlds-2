<script>
import Content from '@/components/Content'
import InviteWidget from '@/components/InviteWidget'

export default {
  name: 'Invite',
  components: {
    Content,
    InviteWidget,
  },
  data() {
    return {
      roles: ['user', 'contributor', 'creator', 'admin', 'superadmin'],
    }
  },
}

</script>

<template>

  <div class="is-flex is-justify-content-center">
    <div class="is-flex-grow-1 mx-20" style="max-width: 760px;">

      <div class="mb-5">
        <router-link :to="{ name: 'Dashboard' }" class="is-uppercase is-primary">&lt; Back to Dashboard</router-link>
      </div>

      <h1 class="divider-bottom">Invitation Email Templates</h1>

      <div class="mt-20 mb-50">
        <InviteWidget :roles="roles" class="my-20" />
      </div>

      <h2 class="divider-bottom">Templates</h2>
      <div class="bg-secondary p-20">

        <h3>Rich text</h3>
        <p class="my-10">You can add bold, italic, and other styles to the templates. Just select some text and a popup toolbar will appear.</p>

        <h3>Template variables</h3>
        <p class="my-10">You can use special codes in the email templates and they will automatically be replaced with the correct value for the invitee.</p>
        <p>
          <ul>
            <li><b>FIRST_NAME</b>: The first name of the invitee.</li>
            <li><b>LAST_NAME</b>: The last name of the invitee.</li>
            <li><b>FULL_NAME</b>: The full name of the invitee.</li>
            <li><b>SIGNUP_LINK</b>: The signup link for the selected role.</li>
          </ul>
        </p>

      </div>

      <div v-for="role of roles" :key="role" class="my-30">
        <h3 class="is-capitalized my-10">{{ role === 'superadmin' ? 'owner' : role === 'admin' ? 'advisor' : role }}</h3>
        <Content :name="'email-invite-' + role" class="editor" />
      </div>

    </div>
  </div>

</template>

<style scoped lang="scss">

.editor {
  border-radius: 5px;
  border: solid 1px #ddd;
  min-height: 10rem;
}

</style>
