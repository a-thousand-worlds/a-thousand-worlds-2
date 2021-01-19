import mergeOne from './mergeOne'

test('merge one level deep', () => {
  expect(mergeOne({
    getters: {
      x: {
        xa: 'xa',
      },
      y: {
        ya: 'ya',
      }
    },
    mutations: {
      x: {
        xa: 'xa'
      },
      z: {
        za: 'za',
      }
    },
  }, {
    getters: {
      x: {
        xb: 'xb',
      },
      z: {
        zb: 'zb',
      }
    },
    actions: {
      x: {
        xb: 'xb'
      },
      z: {
        zb: 'zb',
      }
    },
  }))
    .toEqual({
      // merge level 1 field from both objects
      getters: {
        // overwrite the shared level 2 field
        x: {
          xb: 'xb',
        },
        // preserve the level 2 field that is only on the first object
        // this is the main difference between mergeOne and a simple { ...a, ...b }
        y: {
          ya: 'ya',
        },
        // preserve the level 2 field that is only on the second object
        z: {
          zb: 'zb'
        }
      },
      // preserve level 1 field that is only on the first object
      mutations: {
        x: {
          xa: 'xa'
        },
        z: {
          za: 'za',
        }
      },
      // preserve level 1 field that is only on the second objecrt
      actions: {
        x: {
          xb: 'xb'
        },
        z: {
          zb: 'zb',
        }
      },
    })
})

test('merge multiple objects', () => {
  expect(mergeOne({
    getters: {
      x: 0,
    },
  }, {
    getters: {
      y: 1,
    },
  }, {
    getters: {
      z: 2,
    },
  }))
    .toEqual({
      getters: {
        x: 0,
        y: 1,
        z: 2,
      },
    })
})
