<script>
import Content from '@/components/Content'

export default {
  name: 'EmailTemplates',
  components: {
    Content,
  },
}

</script>

<template>

  <div class="is-flex is-justify-content-center" @click.prevent="$refs.invite?.setInviteDropdown(false)">
    <div class="is-flex-grow-1 mx-20" style="max-width: 760px;">

      <div class="mb-5">
        <router-link :to="{ name: 'Dashboard' }" class="is-uppercase is-primary">&lt; Back to Dashboard</router-link>
      </div>

      <h1 class="divider-bottom">Email Templates</h1>

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

      <div v-for="role of $allowedInviteeRoles()" :key="role" class="my-30">
        <h3 class="is-capitalized my-10">{{ role }}</h3>
        <div class="my-20">
          <p class="my-10" style="font-weight: bold;">Subject: </p>
          <Content :name="`email/invite/${role}/subject`" />
        </div>
        <div class="my-20">
          <p class="my-10" style="font-weight: bold;">Message:</p>
          <Content :name="`email/invite/${role}/body`" class="editor" />
        </div>
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
