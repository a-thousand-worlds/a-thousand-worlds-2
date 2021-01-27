<script>

export default {
  data: () => ({ answer: '' })
}

</script>

<template>
  <div v-if="$store.state.ui.dlgPrompt" class="modal is-active">
    <div class="modal-background" />
    <div class="modal-content">
      <div class="popup message" :class="`is-${$store.state.ui.dlgPrompt.type}`">
        <div class="message-header">{{ $store.state.ui.dlgPrompt.header }}</div>
        <div class="message-body">
          {{ $store.state.ui.dlgPrompt.text }}
          <div class="field">
            <input v-model="answer" class="input" type="text" @keypress.enter.prevent="$store.commit('ui/prompt', answer)">
          </div>
        </div>
        <div class="field is-grouped is-justify-content-flex-end p-3">
          <div class="control">
            <button class="button is-secondary" @click.prevent="$store.commit('ui/prompt', null)">Cancel</button>
          </div>
          <div class="control">
            <button :disabled="!answer.length" class="button is-primary" @click.prevent="$store.commit('ui/prompt', answer)">Ok</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
