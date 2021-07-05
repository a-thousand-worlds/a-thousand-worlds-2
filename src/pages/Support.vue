<script>
import { useHead } from '@vueuse/head'
import store from '@/store'
import Content from '@/components/Content'
import HeartIcon from '@/assets/icons/heart.svg'

const PaypalButtons = {
  3: process.env.VUE_APP_SUPPORT_PAYPAL_3,
  5: process.env.VUE_APP_SUPPORT_PAYPAL_5,
  7: process.env.VUE_APP_SUPPORT_PAYPAL_7,
  10: process.env.VUE_APP_SUPPORT_PAYPAL_10,
  15: process.env.VUE_APP_SUPPORT_PAYPAL_15,
}

export default {
  name: 'Support',
  components: {
    Content,
    HeartIcon
  },
  setup() {
    const description = `Donate to support BIPOC children's book creators!`
    useHead({
      meta: [
        { name: 'og:description', content: description },
        { name: 'twitter:description', content: description },
      ],
    })
    store.dispatch('structuredData/set', { path: 'description', value: description })
  },
  data: () => ({
    PaypalButtons,
    monthly: null,
  }),
  computed: {
    btcAddress: () => process.env.VUE_APP_SUPPORT_BITCOIN || null
  },
}

</script>

<template>

  <div class="columns m-20">
    <div class="column p-0 is-half-desktop is-offset-one-quarter-desktop">
      <Content name="support/title" format="inline" class="title page-title">Support</Content>
      <Content name="support/body" placeholder="Enter page content here" />
    </div>
  </div>

  <div class="columns m-20 is-desktop">
    <div class="column is-full is-one-quarter-desktop is-offset-one-quarter-desktop">
      <h2>Donate</h2>
      <h3 class="is-uppercase divider-bottom">Monthly donation</h3>
      <ul>
        <li @click="monthly = 3">
          <HeartIcon :class="{ 'fill-primary': monthly === 3 }" />
          <span class="ml-2">$3/month</span>
        </li>
        <li @click="monthly = 5">
          <HeartIcon :class="{ 'fill-primary': monthly === 5 }" />
          <span class="ml-2">$5/month</span>
        </li>
        <li @click="monthly = 7">
          <HeartIcon :class="{ 'fill-primary': monthly === 7 }" />
          <span class="ml-2">$7/month</span>
        </li>
        <li @click="monthly = 10">
          <HeartIcon :class="{ 'fill-primary': monthly === 10 }" />
          <span class="ml-2">$10/month</span>
        </li>
        <li @click="monthly = 15">
          <HeartIcon :class="{ 'fill-primary': monthly === 15 }" />
          <span class="ml-2">$15/month</span>
        </li>
      </ul>
      <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" class="field">
        <input type="hidden" name="cmd" value="_s-xclick">
        <input type="hidden" name="hosted_button_id" :value="PaypalButtons[monthly]">
        <button type="submit" class="button is-primary is-uppercase is-rounded mt-3">Start Now</button>
      </form>
      <h3 class="is-uppercase divider-bottom mt-6">One-time donation</h3>
      <p>You can also support with a one-time donation in any time</p>
      <div class="field">
        <button class="button is-primary is-uppercase is-rounded mt-2">Give now</button>
      </div>
      <div v-if="btcAddress">
        <h3 class="is-uppercase divider-bottom mt-6">Donate with bitcoins</h3>
        <p>{{ btcAddress }}</p>
      </div>
    </div>
    <div class="column is-full is-one-quarter-desktop">
      <div class="is-mobile mt-30" />
      <h2>Participate</h2>
      <h3 class="is-uppercase divider-bottom">Submit a book recommendation</h3>
      <div class="field">
        <button class="button is-primary is-uppercase is-rounded">You are a BIPOC Leader</button>
      </div>
      <div class="field">
        <button class="button is-primary is-uppercase is-rounded mt-2">You know a BIPOC Leader</button>
      </div>
    </div>
  </div>

</template>

<style>
li {
  cursor: pointer;
}
</style>
