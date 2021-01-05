import _ from 'lodash'

const validator = getErrors => ({

  data() {
    return {
      errors: []
    }
  },

  methods: {

    hasError(name) {
      return this.errors.some(error => error.name === name)
    },

    validate(name) {
      this.errors = getErrors.bind(this)()
      return this.errors.length === 0
    },

    revalidate: _.throttle(() => {
      if (this.errors.length > 0) {
        this.validate()
      }
    }, 500),

  }
})

export default validator
