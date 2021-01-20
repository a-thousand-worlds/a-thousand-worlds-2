<script>
import Content from '@/components/Content'
import HeartIcon from '@/assets/icons/heart.svg'

const PaypalButtons = {
  $3: process.env.VUE_APP_SUPPORT_PAYPAL_3,
  $5: process.env.VUE_APP_SUPPORT_PAYPAL_5,
  $7: process.env.VUE_APP_SUPPORT_PAYPAL_7,
  $10: process.env.VUE_APP_SUPPORT_PAYPAL_10,
  $15: process.env.VUE_APP_SUPPORT_PAYPAL_15,
}

export default {
  name: 'Support',
  components: {
    Content,
    HeartIcon
  },
  data: () => ({
    check3: false,
    check5: false,
    check7: false,
    check10: false,
    check15: false,
    paypalSelectedSubscription: ''
  }),
  computed: {
    btcAddress: () => process.env.VUE_APP_SUPPORT_BITCOIN || null
  },
  methods: {
    toggleSubscription(amount) {
      this.check3 = false
      this.check5 = false
      this.check7 = false
      this.check10 = false
      this.check15 = false
      this.paypalSelectedSubscription = PaypalButtons['$' + amount]
      this[`check${amount}`] = true
    }
  }
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
      <h3 class="is-uppercase divider-bottom">Monthly donations</h3>
      <ul>
        <li @click="toggleSubscription(3)">
          <HeartIcon :class="{ 'fill-primary': check3 }" />
          <span class="ml-2">$3/month</span>
        </li>
        <li @click="toggleSubscription(5)">
          <HeartIcon :class="{ 'fill-primary': check5 }" />
          <span class="ml-2">$5/month</span>
        </li>
        <li @click="toggleSubscription(7)">
          <HeartIcon :class="{ 'fill-primary': check7 }" />
          <span class="ml-2">$7/month</span>
        </li>
        <li @click="toggleSubscription(10)">
          <HeartIcon :class="{ 'fill-primary': check10 }" />
          <span class="ml-2">$10/month</span>
        </li>
        <li @click="toggleSubscription(15)">
          <HeartIcon :class="{ 'fill-primary': check15 }" />
          <span class="ml-2">$15/month</span>
        </li>
      </ul>
      <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
        <input type="hidden" name="cmd" value="_s-xclick">
        <input type="hidden" name="hosted_button_id" :value="paypalSelectedSubscription">
        <button :disabled="!paypalSelectedSubscription.length" type="submit" class="button is-primary is-uppercase is-rounded mt-3">Start Now</button>
      </form>
      <h3 class="is-uppercase divider-bottom mt-6">One-time donation</h3>
      <p>You can also support with a one-time donation in any time</p>
      <button class="button is-primary is-uppercase is-rounded mt-2">Give now</button>
      <div v-if="btcAddress">
        <h3 class="is-uppercase divider-bottom mt-6">Donate with bitcoins</h3>
        <p>{{ btcAddress }}</p>
      </div>
    </div>
    <div class="column is-full is-one-quarter-desktop">
      <h2>Participate</h2>
      <h3 class="is-uppercase divider-bottom">Submit a book recommendation</h3>
      <button class="button is-primary is-uppercase is-rounded">You are a BIPOC Leader</button>
      <button class="button is-primary is-uppercase is-rounded mt-2">You know a BIPOC Leader</button>
    </div>
  </div>

</template>

<style>
li {
  cursor: pointer;
}
</style>
