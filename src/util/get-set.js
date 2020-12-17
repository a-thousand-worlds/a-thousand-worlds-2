import _ from 'lodash'

const normalizePath = path => (path || '').replace(/\//g, '.')

/** _.get with support for "/" */
export const get = (obj, path) => _.get(obj, normalizePath(path))

/** _.set with support for "/" */
export const set = (obj, path) => _.set(obj, normalizePath(path))
