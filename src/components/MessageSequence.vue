<!-- A message with one or more steps persisted to local storage and user profile. It could probably just be saved to user profile, since they have to be logged in anyway to see the Dashboard. -->

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
    const completedOnProfile =
      this.$store.state.user?.user.profile?.messageSequence[this.storageKey]
    const data = {
      // consider the message sequence completed if local storage or remote profile have it marked completed
      completed: completedOnProfile || localStorage.getItem(this.key('completed')),
      step: +(localStorage.getItem(this.key('step')) || 0),
    }
    this.$emit('load', data)
    return data
  },

  computed: {
    completedOnProfile() {
      return this.$store.state.user?.user.profile?.messageSequence[this.storageKey]
    },

    numSteps() {
      return this.$slots.default().length
    },
  },

  mounted() {
    // set the step to the end if the message sequence is completed on the remote profile
    // it can still increment after the component is
    // has to be done in mounted so that this.numSteps is specified
    if (this.completedOnProfile) {
      this.step = this.numSteps
    }
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
        this.$store.dispatch('user/completeMessageSequence', {
          key: this.storageKey,
          value: true,
        })
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
    return h(
      'div',
      {
        class: 'bg-secondary p-20 mb-20',
        style: 'display: inline-block; border-radius: 10px; font-size: 20px;',
      },
      [
        this.$slots.default()[this.step].children,
        h(
          'button',
          {
            onClick: e => {
              e.preventDefault()
              this.next()
            },
            class: 'button is-rounded is-primary',
          },
          this.step < this.numSteps - 1 ? 'Next' : 'Okay',
        ),
      ],
    )
  },
}
</script>
