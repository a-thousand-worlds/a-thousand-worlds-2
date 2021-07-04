<!-- A message with one or more steps persisted to storage. -->

<script>
import { h } from 'vue'

export default {

  props: {

    // a stable storage key that is unique across the app
    storageKey: {
      type: String,
      required: true,
    },

  },

  emits: ['completed', 'load', 'step'],

  data() {
    const data = {
      completed: localStorage.getItem(this.key('completed')),
      step: +(localStorage.getItem(this.key('step')) || 0),
    }
    this.$emit('load', data)
    return data
  },

  computed: {
    numSteps() {
      return this.$slots.default().length
    },
  },

  methods: {

    key(...args) {
      return `messageSequence_${this.storageKey}_${args.join('_')}`
    },

    next() {
      this.set(this.step + 1)
    },

    /** Sets the step and persists it to storage. */
    set(step) {
      this.step = step
      localStorage.setItem(this.key('step'), step)
      this.$emit('step', step)

      // complete if on last step
      if (step === this.numSteps) {
        this.completed = true
        localStorage.setItem(this.key('completed'), true)
        this.$emit('completed', true)
      }
    },

    /** Toggles the step between the first and last steps and persists it to storage. */
    toggle() {
      const step = this.step === this.numSteps ? 0 : this.numSteps
      this.set(step)
    },

  },

  render() {
    if (this.step === this.numSteps) return null
    return h('div', {
      class: 'bg-secondary p-20 mb-20',
      style: 'display: inline-block; border-radius: 10px; font-size: 20px;',
    }, [
      this.$slots.default()[this.step].children,
      h('button', {
        onClick: e => {
          e.preventDefault()
          this.next()
        },
        class: 'button is-rounded is-primary'
      }, this.step < this.numSteps - 1 ? 'Next' : 'Okay'),
    ])
  }

}
</script>
