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
  watch: {
    name(next, prev) {
      const user = this.$store.state.people.find(x => x.name.toLowerCase() === this.name.toLowerCase())
      if (user) {
        this.personDB = user
        this.exists = true
        this.role = user.role
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
  },
  created() {
    const user = this.$store.state.people.find(x => x.name.toLowerCase() === this.name.toLowerCase())
    if (user) {
      this.personDB = user
      this.exists = true
      this.role = user.role
      // this.$emit('changed-role', this.role)
    }
    else {
      this.personDB = null
      this.exists = false
    }

    this.$emit('changed', this.name)
    this.$emit('changed-role', this.role)
  }
}

</script>

<template>

  <div class="field is-grouped">
    <div class="control">
      <input v-model="name" type="text" class="input">
    </div>
    <div class="control">
      <div class="select">
        <select v-model="role" :disabled="exists">
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
