import mergeOne from '@/util/mergeOne'
import collection from '@/store/collection/managed'
import sortable from '@/store/collection/sortable'

const module = mergeOne(collection('tags/people'), sortable())

export default module
