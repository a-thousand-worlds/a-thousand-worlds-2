import { fireEvent, render } from '@testing-library/vue'
import { createLocalVue } from '@vue/test-utils'
import store from '@/store'
import BookSubmissionForm from '@/pages/BookSubmissionForm.vue'

const mixin = {
  computed: {
    $uiBusy() {
      return '' //this.$store.state.ui.busy
    }
  }
}

// A common testing pattern is to create a custom renderer for a specific test
// file. This way, common operations such as registering a Vuex store can be
// abstracted out while avoiding sharing mutable state.
//
// Tests should be completely isolated from one another.
// Read this for additional context: https://kentcdodds.com/blog/test-isolation-with-react

// function renderVuexTestComponent(customStore) {
//   // Render the component and merge the original store and the custom one
//   // provided as a parameter. This way, we can alter some behaviors of the
//   // initial implementation.
//   return render(VuexTest, { store: { ...store, ...customStore }})
// }

test('title input', async () => {
  const { getByLabelText } = render(BookSubmissionForm, {
    global: {
      directives: {
        'click-outside': {
          beforeMount(el, binding, vnode) {
            el.clickOutsideEvent = function(event) {
              if (!(el === event.target || el.contains(event.target))) {
                binding.value(event, el)
              }
            }
            document.body.addEventListener('click', el.clickOutsideEvent)
          },
          unmounted(el) {
            document.body.removeEventListener('click', el.clickOutsideEvent)
          }
        }
      },
      mixins: [mixin],
      plugins: [store]}
    }
   )

  const titleInput = getByLabelText('Title')

  // Dispatch a native click event to our button element.
  // await fireEvent.click(button)
})
