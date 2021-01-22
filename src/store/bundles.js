import mergeOne from '@/util/mergeOne'
import imaged from '@/store/modules/imaged'
import filterable from '@/store/modules/filterable'

const module = mergeOne(imaged('bundles', 'cover'), filterable())

export default module
