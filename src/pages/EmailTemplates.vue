<script>
import EmailTemplatesEditor from '@/components/EmailTemplates/Editor'

export default {
  name: 'EmailTemplates',
  components: {
    EmailTemplatesEditor,
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

      <section class="section px-0">
        <EmailTemplatesEditor />
      </section>

    </div>
  </div>

</template>
