import mergeOne from '@/util/mergeOne'
import managedCollection from '@/store/collection/managed'

const module = mergeOne(managedCollection('submits/people'), {
})

export default module
