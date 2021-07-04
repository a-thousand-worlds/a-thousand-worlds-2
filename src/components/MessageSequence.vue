<!-- A message with one or more steps persisted to storage. -->

<script>
export default {

  props: {

    // a stable storage key that is unique across the app
    storageKey: {
      type: 'string',
      required: true,
    }

  },

  data: {
    completed: localStorage.getItem(this.props.storageKey + 'Completed'),
    step: +(localStorage.getItem(this.props.storageKey) || 0),
  },

  methods: {

    /** Sets the step and persists it to storage. */
    set(step) {
      this.step = step
      localStorage.setItem(this.props.storageKey, step)

      // complete if on last step
      if (step === this.numSteps) {
        this.completed = true
        localStorage.setItem(this.props.storageKey + 'Completed', true)
      }
    },

    /** Toggles the step between the first and last steps and persists it to storage. */
    toggle() {
      const step = this.step === this.numSteps ? 0 : this.numSteps
      this.set(step)
    },

  },

}
</script>

<template>
</template>
