import mergeOne from '@/util/mergeOne'
import managed from '@/store/modules/managed'
import sortable from '@/store/modules/sortable'

const module = mergeOne(managed('tags/bundles'), sortable())

export default module
