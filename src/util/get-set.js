/* eslint-disable */
// disabling eslint to import default
import { default as _get } from 'lodash/get'
import { default as _set } from 'lodash/set'

const normalizePath = path => (path || '').replace(/\//g, '.')

/** _.get with support for "/" */
export const get = (obj, path) => !path || path === '/'
  ? obj
  : _get(obj, normalizePath(path))

/** _.set cannot support "/" since it requires updating the object reference. */
export const set = _set
