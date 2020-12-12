<script>
import Content from '@/components/Content'

export default {
  name: 'Invite',
  components: {
    Content,
  },
  data() {
    return {
      roles: ['user', 'contributor', 'creator', 'admin', 'superadmin'],
      showTemplatingHelp: false,
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

      <!-- <h2 class="divider-bottom">Invite Users</h2> -->

      <h2 class="divider-bottom">Invitation Email Templates</h2>

      <a @click.prevent="showTemplatingHelp = !showTemplatingHelp"><span class="icon is-small mb-10" style="position: relative; top: 1px;"><i class="fas mr-1" :class="{ 'fa-angle-right': !showTemplatingHelp, 'fa-angle-down': showTemplatingHelp }" aria-hidden="true" style="color: black;"></i></span>Templating Help</a>

      <div class="bg-secondary p-20" v-if="showTemplatingHelp">

        <h3>Rich text</h3>
        <p class="my-10">You can add bold, italic, and other styles to the templates. Just select some text and a popup toolbar will appear.</p>

        <h3>Template variables</h3>
        <p class="my-10">You can use special codes in the email templates and they will automatically be replaced with the correct value for the invitee.</p>
        <p>
          <b>NAME</b>: The name of the invitee.<br/>
          <b>LINK</b>: The invitation link for the selected role.
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
