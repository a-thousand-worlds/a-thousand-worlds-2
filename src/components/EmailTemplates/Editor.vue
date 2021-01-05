<script>
import Content from '@/components/Content'

export default {
  components: {
    Content,
  },
  data() {

    // organize content into groups
    const groups = [
      {
        title: 'Invitation',
        items: this.$allowedInviteeRoles(),
        path: 'email/invite',
      },
      {
        title: 'Submission',
        items: ['approved'],
        path: 'email/submissions',
      }
    ]

    return {
      // start with the first item in the first group selected
      active: {
        group: groups[0],
        item: groups[0].items[0]
      },
      groups,
    }
  },
}

</script>

<template>
  <div class="columns">

    <div class="column is-one-third">
      <aside class="menu">
        <div v-for="group of groups" :key="group.title" class="mb-20">
          <p class="menu-label">{{ group.title }}s</p>
          <ul class="menu-list">
            <li v-for="item of group.items" :key="item" class="is-capitalized">
              <a @click.prevent="active = { group, item }" :class="{ 'is-active': item === active.item }">{{ item }}</a>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <div class="column is-two-thirds">
      <!-- <h2 class="is-capitalized">{{ active.group }}</h2> -->
      <h3 class="is-capitalized mb-10">{{ active.group.title }}: {{ active.item }}</h3>
      <div class="mb-20">
        <p class="mb-10" style="font-weight: bold;">Subject: </p>
        <Content :name="`${active.group.path}/${active.item}/subject`" format="oneline" />
      </div>
      <div class="mb-20">
        <p class="mb-10" style="font-weight: bold;">Message:</p>
        <Content :name="`${active.group.path}/${active.item}/body`" class="editor" />
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
@import '@/assets/main.scss';

.editor {
  border-radius: 5px !important;
  border: solid 1px #ddd;
  min-height: 10rem;
}

</style>
