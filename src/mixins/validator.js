import debounce from 'lodash/debounce'

const validator = getErrors => ({
  data() {
    return {
      errors: [],
    }
  },

  methods: {
    hasError(name) {
      return this.errors.some(error => error.name === name)
    },

    validate(...args) {
      this.errors = getErrors.bind(this)(...args)
      return this.errors.length === 0
    },

    revalidate: debounce(
      function (...args) {
        if (this.errors.length > 0) {
          this.validate(...args)
        }
      },
      500,
      { leading: true },
    ),
  },
})

export default validator
