import mergeOne from '@/util/mergeOne'
import collection from '@/store/collection/managed'

const module = mergeOne(collection('people'))

export default module
