import debounce from 'lodash/debounce'

/** A mixin that stores errors and provides methods to add, remove, and validate error conditions. */
const validator = validationFunction => ({
  data() {
    return {
      // [{ name: string, message: string }]
      errors: [],
    }
  },

  methods: {
    clearErrors() {
      this.errors = []
    },

    addError(error) {
      this.errors = [...this.errors, error]
    },

    hasErrors() {
      return this.errors.length > 0
    },

    getErrors() {
      return [...this.errors]
    },

    hasError(name) {
      return this.errors.some(error => error.name === name)
    },

    validate(...args) {
      this.errors = validationFunction.bind(this)(...args)
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
