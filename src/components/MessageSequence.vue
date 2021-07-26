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
    const remoteData = this.$store.state.user?.user.profile?.messageSequence?.[this.storageKey]
    const data = {
      completed: false,
      step: 0,
      ...remoteData,
    }
    this.$emit('load', data)
    return data
  },

  computed: {
    isDone() {
      return this.step === this.numSteps
    },
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
      this.$store.dispatch('user/updateMessageSequence', {
        name: this.storageKey,
        key: 'step',
        value: step,
      })
      this.$emit('step', step)

      // complete if on last step
      if (step === this.numSteps) {
        this.completed = true
        this.$store.dispatch('user/updateMessageSequence', {
          name: this.storageKey,
          key: 'completed',
          value: true,
        })
        this.$emit('completed', true)
      }
    },

    /** Toggles the step between the first and last steps and persists it to storage. */
    toggle() {
      const step = this.isDone ? 0 : this.numSteps
      this.set(step)
    },
  },

  render() {
    // If the sequence is done, preload step 0 and hide the component with display: none
    // this allows slots to get mounted in preparation for toggling the message sequence on
    // which is needed for slot descendants such as Content to preload their content.
    // Otherwise, there is a delay loading slot Content
    const stepPreloaded = this.isDone ? 0 : this.step
    return h(
      'div',
      {
        class: 'bg-secondary p-20 mb-20',
        style: {
          display: this.isDone ? 'none' : 'inline-block',
          borderRadius: '10px',
          fontSize: '20px',
        },
      },
      [
        this.$slots.default()[stepPreloaded]?.children,
        h(
          'button',
          {
            onClick: e => {
              e.preventDefault()
              this.next()
            },
            class: 'button is-rounded is-primary',
          },
          stepPreloaded < this.numSteps - 1 ? 'Next' : 'Okay',
        ),
      ],
    )
  },
}
</script>
