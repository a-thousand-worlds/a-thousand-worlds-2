<script>

export default {
  data: () => ({ answer: '' })
}

</script>

<template>
  <div v-if="$store.state.ui.dlgPrompt" class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="popup message" :class="'is-'+$store.state.ui.dlgPrompt.type">
        <div class="message-header">{{$store.state.ui.dlgPrompt.header}}</div>
        <div class="message-body">
          {{$store.state.ui.dlgPrompt.text}}
          <div class="field">
            <input class="input" @keypress.enter.prevent="$store.commit('ui/prompt', answer)" type="text" v-model="answer">
          </div>
        </div>
        <div class="field is-grouped is-justify-content-flex-end p-3">
          <div class="control">
            <button @click.prevent="$store.commit('ui/prompt', null)" class="button is-secondary">Cancel</button>
          </div>
          <div class="control">
            <button :disabled="!answer.length" @click.prevent="$store.commit('ui/prompt', answer)" class="button is-primary">Ok</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
