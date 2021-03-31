<script>
import Content from '@/components/Content'
import HeartIcon from '@/assets/icons/heart.svg'
import sendEmail from '@/util/sendEmail'

const variants = {
  'Nominate BIPOC Leader(s) to A Thousand Worlds': 'Thank you! Please list their names, title (i.e. editor, librarian, book reviewer teacher, etc) and contact info!',
  'I am a BIPOC Leader in the book industry': 'You are a superstar! Please share what your title is or how you engage with picture books. Thank you for you interest in contributing to our picture book directory!',
  'Partnership Opportunity': 'Message',
  'Feedback and Questions about A Thousand Worlds': 'Message',
  'Report a Bug': 'Message',
  Other: 'Message'
}

export default {
  name: 'Contact',
  components: {
    Content,
    HeartIcon
  },
  data() {
    const query = new URLSearchParams(decodeURI(window.location.search))
    const ret = {
      name: query.get('from') || '',
      email: query.get('email') || '',
      // subject: query.get('subject') || Object.keys(variants)[0],
      subject: query.get('subject') || '',
      message: query.get('message') || '',
      dropdown: ''
    }
    // ret.dropdown = Object.keys(variants).includes(ret.subject) ? ret.subject : 'Other'
    return ret
  },
  computed: {
    subjectVariants() {
      return Object.keys(variants)
    },
    messagePlaceholder() {
      return variants[this.subject] || 'Message'
    },
    isValid() {
      return this.name.length && this.email.length && this.subject.length && this.message.length
    }
  },
  methods: {
    setSubject() {
      this.subject = this.dropdown === 'Other' ? '' : this.dropdown
    },
    sendEmail() {
      this.$store.commit('ui/setBusy', true)
      sendEmail({
        to: process.env.VUE_APP_ADMIN_EMAIL,
        subject: this.subject,
        body: `<p>Contact form message<p><p>From ${this.name} - ${this.email}<p><br><p>${this.message}`
      })
        .then(() => {
          this.$store.dispatch('ui/popup', { text: 'Message sent!', autoclose: true })
          this.name = ''
          this.email = ''
          this.subject = ''
          this.message = ''
        })
        .catch(err => {
          console.log('sending message error', err)
          this.$store.dispatch('ui/popup', { text: 'Sending Error: ' + JSON.stringify(err), autoclose: false })
        })
        .finally(() => {
          this.$store.commit('ui/setBusy', false)
        })
    }
  }
}

</script>

<template>

  <div class="columns m-20">
    <div class="column p-0 is-half-desktop is-offset-one-quarter-desktop">
      <Content name="contact/title" class="contact-page-title page-title is-uppercase" format="inline">We want to hear from you!</Content>
      <div class="columns is-mobile">
        <div class="column is-3-tablet is-6-mobile is-offset-1-tablet"><HeartIcon class="fill-primary p-5" width="140px" height="140px" /></div>
        <div class="column">
          <Content name="contact/header" format="multiline" placeholder="Type here">
            <p>Nominate a Leader</p>
            <p>Say Hello</p>
            <p>Ask a Question</p>
            <p>Report a Bug</p>
            <p>Partner with Us</p>
          </Content>
        </div>
      </div>
    </div>
  </div>

  <div class="columns m-20">
    <div class="column p-0 is-half-desktop is-offset-one-quarter-desktop">

      <div class="field">
        <div class="control has-icons-right">
          <input :disabled="$store.state.ui.busy" class="input" type="text" placeholder="Name" v-model="name">
          <span class="icon is-right">
            <i class="fas fa-address-card" />
          </span>
        </div>
      </div>

      <div class="field">
        <input :disabled="$store.state.ui.busy" class="input" type="email" placeholder="Email" v-model="email">
      </div>

      <div class="field subject-field">
        <select required v-if="dropdown !== 'Other'" :disabled="$store.state.ui.busy" class="input" v-model="dropdown" @change="setSubject()">
          <option value="" disabled>Subject</option>
          <option v-for="subj in subjectVariants" :key="subj" @click="setSubject(subj)" class="subject-opt">{{ subj }}</option>
        </select>
        <input v-else :disabled="$store.state.ui.busy" class="input" type="text" placeholder="Subject" v-model="subject">
      </div>

      <div class="field">
        <textarea :disabled="$store.state.ui.busy" rows="7" class="textarea" :placeholder="messagePlaceholder" v-model="message" />
      </div>

      <div class="has-text-right">
        <button :disabled="$store.state.ui.busy || !isValid" type="submit" class="button is-primary is-uppercase is-rounded mt-3" @click="sendEmail">Send</button>
      </div>

    </div>
  </div>

</template>

<style lang="scss">
$placeholderColor: #a0a0a0;

.contact-page-title {
  font-size: 40px;
}
.fa-address-card {
  padding-top: 11px;
  font-size: 18px;
}
select:invalid {
  color: $placeholderColor;
}
option:first-child {
  display:  none;
}
option {
  color: black;
}
::placeholder {
  color: $placeholderColor !important;
}
</style>
