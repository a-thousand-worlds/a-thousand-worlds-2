<script>
import EmailTemplatesEditor from '@/components/EmailTemplates/Editor'
import EmailTemplatesHelp from '@/components/EmailTemplates/Help'

export default {
  name: 'EmailTemplates',
  components: {
    EmailTemplatesEditor,
    EmailTemplatesHelp,
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

      <EmailTemplatesHelp />

      <section class="section px-0">
        <EmailTemplatesEditor />
      </section>

    </div>
  </div>

</template>
