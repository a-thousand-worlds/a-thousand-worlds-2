<script>
import Dropdown from '@/components/Dropdown'
import { allowedInvitees } from '@/rights'

export default {
  components: {
    Dropdown,
  },
  data() {
    return {
      role: this.$store.state.user.impersonate,
      roleOptions: Object.keys(allowedInvitees)
        .filter(role => role !== 'owner')
        .map(role => ({ id: role, text: role })),
    }
  },
  methods: {
    impersonate() {
      this.$store.commit('user/impersonate', this.role)
    },
  },
}
</script>

<template>
  <div style="min-height: 24em">
    <h2>Impersonate</h2>
    <p class="field">Browse the dashboard as a different user role to see what they see.</p>
    <div class="field">
      <Dropdown
        :options="roleOptions"
        :v-model="role"
        @update:modelValue="role = $event"
        format="button"
        :label="role"
        placeholder="Choose Role"
        style="display: inline-block"
      >
        <template #beforeOptions>
          <a
            @click.prevent="role = null"
            class="dropdown-item is-capitalized is-uppercase"
            style="color: #000; font-weight: bold"
            >None</a
          >
        </template>
      </Dropdown>
      <a @click.prevent="impersonate" class="button is-primary is-outlined is-rounded"
        >Impersonate</a
      >
    </div>
  </div>
</template>
