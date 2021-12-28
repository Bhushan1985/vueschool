<template>
  <form id="profile-name">
    <fieldset id="name">
      <legend :class="{ valid: is_valid }">Name</legend>
      <input
        id="first-name"
        v-model="first_name"
        type="text"
        placeholder="First"
        @keyup="modified_check" />
      <input
        id="last-name"
        v-model="last_name"
        type="text"
        placeholder="Last"
        @keyup="modified_check" />
    </fieldset>
    <menu>
      <button ref="button" disabled @click.prevent="valid">
        Yep, That's my name
      </button>
    </menu>
  </form>
</template>
<script setup>
  import { computed, ref, watch } from 'vue'
  const props = defineProps({
    person: {
      type: Object,
      required: true
    }
  })
  const emit = defineEmits(['valid', 'update:person'])
  const first_name = ref(props.person.first_name)
  const last_name = ref(props.person.last_name)
  const button = ref(null)

  function valid() {
    if (is_valid.value) emit('valid')
  }

  function modified_check() {
    let modified = false
    if (is_valid.value) button.value.disabled = false
    else button.value.disabled = true
    const updated = { ...props.person }
    if (props.person.first_name !== first_name.value) {
      updated.first_name = first_name.value
      modified = true
    }
    if (props.person.last_name !== last_name.value) {
      updated.last_name = last_name.value
      modified = true
    }
    if (modified) {
      emit('update:person', updated)
    }
  }

  watch(props, val => {
    first_name.value = val.person.first_name
    last_name.value = val.person.last_name
  })

  const is_valid = computed(() => {
    let length = 0
    if (props.person.first_name) length = props.person.first_name.length
    else return false // first name is required

    if (props.person.last_name) length += props.person.last_name.length
    else return false // last name is required

    if (length > 2) return true
    else return false // full name is at least 3 characters
  })
</script>
<style lang="stylus">
  form#profile-name
    animation-name: slide-in-left
    &.complete
      animation-name: slide-out-right
    fieldset
      margin-bottom: base-line
    input#first-name
      width: 40%
      margin-right: base-line
    input#last-name
      width: 40%
    menu
      display: flex
      justify-content: flex-end
</style>
