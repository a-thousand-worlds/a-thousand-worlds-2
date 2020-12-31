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
  },
  created() {
    const u = this.$store.state.peopleList.reduce((acc, x) => x.name.toLowerCase() === this.name.toLowerCase() ? x : acc, null)
    if (u) {
      this.personDB = u
      this.exists = true
      this.role = u.role
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
