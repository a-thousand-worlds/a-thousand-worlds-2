export const compare = (a, b) => (a > b ? 1 : b > a ? -1 : 0)

/** Sorts dates. Optioally accepts prop to sort an array of objects that each have a date property. */
export const dateComparator =
  (prop, dir = 'desc') =>
  (a, b) => {
    const aValue = new Date(prop != null ? a[prop] : a)
    const bValue = new Date(prop != null ? b[prop] : b)
    return compare(...(dir === 'asc' ? [aValue, bValue] : [bValue, aValue]))
  }
