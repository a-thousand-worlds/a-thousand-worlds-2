import mergeOne from '@/util/mergeOne'
import imaged from '@/store/modules/imaged'
import filterable from '@/store/modules/filterable'
import shuffleable from '@/store/modules/shuffleable'

const moduleFilterable = filterable()
const module = mergeOne(
  imaged('books', 'cover'),
  moduleFilterable,
  shuffleable(),
  {
    getters: {
      // override filterable getters.filtered to filter shuffled
      filtered: (state, getters, rootState) =>
        moduleFilterable.getters.filtered(state)(state.shuffled, 'tags')
    }
  }
)

export default module
