<script>
export default {
  props: ['creators', 'linked'],
  computed: {
    label1() {
      return 'by'
    },
    label2() {
      return 'illustrated by'
    },
    authors() {
      return 'XXX'
    },
    illustrators() {
      return 'YYY'
    }
  }
}
</script>

<template>
  <div>
    <span>{{label1}}</span>
    <span v-if="!linked">{{authors}}</span>
    <span>{{label2}}</span>
    <span v-if="!linked">{{illustrators}}</span>
  </div>
</template>
