import _ from 'lodash'

/** _.get with support for "/" */
const get = (obj, key) => _.get(obj, key.replace(/\//g, '.'))

export default get
