<script>
import Content from '@/components/Content'
import validator from '@/mixins/validator'

export default {
  components: {
    Content,
  },
  mixins: [
    validator(function() {
      return [
        ...this.validateEmailTemplate(this.$refs.subject?.html, 'subject'),
        ...this.validateEmailTemplate(this.$refs.body?.html, 'body'),
      ]
    })
  ],
  data() {

    // organize content into groups
    const groups = [
      {
        title: 'Invitation',
        items: this.$allowedInviteeRoles(),
        path: 'email/invite',
      },
      {
        title: 'Approved Submission',
        items: ['book', 'bundle', 'people'],
        path: 'email/submissions/approved',
      },
      {
        title: 'Rejected Submission',
        items: ['book', 'bundle', 'people'],
        path: 'email/submissions/rejected',
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
  computed: {
    subjectErrors() {
      return this.errors.filter(error => error.name === 'subject')
    },
    bodyErrors() {
      return this.errors.filter(error => error.name === 'body')
    },
  },
  watch: {
    active() {
      this.validate(this.$refs.subject)
      this.validate(this.$refs.body)
    }
  },
  mounted() {
    this.validate()
  },
  methods: {
    validateEmailTemplate(html, name) {
      if (html == null) return []
      const templateVariables = html.match(/\w+_\w+/g)

      const isValidTemplateVariable = variable =>
        ['FIRST_NAME', 'LAST_NAME', 'FULL_NAME', 'SIGNUP_LINK', 'APPROVED_RECORDS'].includes(variable)

      return (templateVariables || [])
        .map(variable => !isValidTemplateVariable(variable)
          ? {
            name,
            message: `${variable} is not a valid template variable.`
          }
          : null
        )
        .filter(x => x)
    }
  }
}

</script>

<template>
  <div class="columns">

    <div class="column is-one-quarter">
      <aside class="menu">
        <div v-for="group of groups" :key="group.title" class="mb-20">
          <p class="menu-label">{{ group.title }}{{ group.title.endsWith('ed') ? '' : 's' }}</p>
          <ul class="menu-list">
            <li v-for="item of group.items" :key="item" class="is-capitalized">
              <a :class="{ 'is-active': item === active.item && group === active.group }" @click.prevent="active = { group, item }">{{ item }}</a>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <div class="column is-three-quarters">
      <!-- <h2 class="is-capitalized">{{ active.group }}</h2> -->
      <div class="ml-20">
        <h3 class="is-capitalized mb-10">{{ active.group.title }}: {{ active.item }}</h3>
        <div class="mb-20">
          <p class="mb-10" :class="{ 'has-text-danger': hasError('subject') }" style="font-weight: bold;">Subject: </p>
          <Content
            ref="subject"
            :name="`${active.group.path}/${active.item}/subject`"
            :class="{ 'is-danger': hasError('subject') }"
            format="oneline"
            @change="validate"
          />
          <div v-if="subjectErrors.length" class="field">
            <p v-for="(error, i) of subjectErrors" :key="i" class="error my-10">{{ error.message || 'Unknown error' }}</p>
          </div>
        </div>
        <div class="mb-20">
          <p class="mb-10" :class="{ 'has-text-danger': hasError('body') }" style="font-weight: bold;">Message:</p>
          <div :class="{ 'content-container-error': hasError('body') }">
            <Content
              ref="body"
              :name="`${active.group.path}/${active.item}/body`"
              class="editor"
              @change="validate"
            />
          </div>
          <div v-if="bodyErrors.length" class="field">
            <p v-for="(error, i) of bodyErrors" :key="i" class="error my-10">{{ error.message || 'Unknown error' }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/form/shared.sass";
@import '@/assets/style/vars.scss';
@import '@/assets/style/mixins.scss';

.editor {
  border-radius: 5px !important;
  border: solid 1px #ddd;
  min-height: 10rem;
}

.menu-list a.is-active {
  @include primary(background-color);
}

// cannot add is-danger directly to Content element since dynamic classes interfere with CKEditor classes
.content-container-error {
  .editor {
    border-color: $danger !important;
    &:focus,
    &.is-focused,
    &:active,
    &.is-active {
      box-shadow: $input-focus-box-shadow-size bulmaRgba($danger, 0.25);
    }
  }
}

</style>
