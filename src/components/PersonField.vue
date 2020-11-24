<script>

export default {
  props: ['person'],
  emits: ['changed', 'changed-role'],
  data() {
    return {
      personDB: null,
      name: this.person || '',
      exists: false,
      role: 'author'
    }
  },
  created() {
    this.$emit('changed-role', this.role)
  },
  watch: {
    name(next, prev) {
      const u = this.$store.state.people.reduce((acc, x) => x.name.toLowerCase() === this.name.toLowerCase() ? x : acc, null)
      if (u) {
        this.personDB = u
        this.exists = true
        this.role = u.role
        this.$emit('changed-role', this.role)
      }
      else {
        this.personDB = null
        this.exists = false
      }
      this.$emit('changed', next)
    },
    person(next, prev) {
      this.name = next
    },
    role(next, prev) {
      this.$emit('changed-role', next)
    }
  }
}

</script>

<template>

<div class="field is-grouped">
  <div class="control">
    <input type="text" class="input" v-model="name">
  </div>
  <div class="control">
    <div class="select">
      <select :disabled="exists" v-model="role">
        <option value="author">Author</option>
        <option value="illustrator">Illustrator</option>
      </select>
    </div>
  </div>
  <div class="control">
    <button v-if="!exists" class="button is-static">
      Person not exists and will be created
    </button>
    <button v-if="exists" class="button is-static">
      Person exists in database
    </button>
  </div>
</div>

</template>
