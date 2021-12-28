<template>
  <form id="profile-mobile">
    <fieldset v-if="show_mobil_input" id="phone">
      <legend :class="{ valid: validate_mobile_number() }">
        {{ mobile_display }}
      </legend>
      <input
        id="mobile"
        ref="mobile"
        v-model="cell"
        type="tel"
        placeholder="1 (555) 555-5555"
        @keypress="mobile_keypress"
        @keyup="validate_mobile_number"
        @paste.prevent="mobile_paste" />
    </fieldset>
    <fieldset v-if="show_captcha" id="captcha" :class="{ hide_captcha }" />
    <fieldset v-if="show_code">
      <input
        id="verification-code"
        ref="verification_code"
        v-model="code"
        type="tel"
        required
        autocomplete="one-time-code"
        placeholder="Verification Code"
        @keypress="code_keypress" />
    </fieldset>
    <icon v-if="working" name="working" />
    <menu v-else>
      <button
        v-if="show_authorize"
        id="authorize"
        :disabled="disabled_sign_in"
        @click.prevent="begin_authorization">
        Sign on
      </button>
      <button
        v-if="show_code"
        id="submit-verification"
        ref="submit_verification"
        @click.prevent="sign_in_with_code">
        Sign on
      </button>
    </menu>
  </form>
</template>
<script setup>
  import { ref, computed, watch, nextTick, watchEffect } from 'vue'
  import firebase from 'firebase/app'
  import 'firebase/auth'
  import { as_phone_number } from '@/use/profile'
  import icon from '@/components/icon'
  import * as libphonenumber from 'libphonenumber-js'

  const validate = ref(null)
  const mobile = ref(null)
  const cell = ref(null)
  const working = ref(true)
  const disabled_sign_in = ref(true)
  const code = ref(null)
  const human = ref(null)
  const authorizer = ref(null)
  const show_authorize = ref(false)
  const show_captcha = ref(false)
  const hide_captcha = ref(false)
  const show_code = ref(false)
  const verification_code = ref(null)
  const submit_verification = ref(null)

  const props = defineProps({
    person: {
      type: Object,
      required: true
    }
  })
  const emit = defineEmits(['update:person', 'signed-on'])

  validate.value = libphonenumber
  working.value = false
  const updated = { ...props.person }
  updated.mobile = as_phone_number(props.person.id)
  if (!updated.mobile.length) updated.mobile = null
  show_authorize.value = true
  cell.value = updated.mobile
  validate_mobile_number()

  watch(cell, () => {
    const update = { ...props.person }
    update.mobile = cell.value
    emit('update:person', update)
  })

  watchEffect(
    () => {
      emit('update:person', props.person)
    },
    {
      flush: 'post'
    }
  )

  const show_mobil_input = computed(() => {
    if (working.value) return false
    return true
  })

  const mobile_display = computed(() => {
    if (props.person.mobile)
      return new validate.value.AsYouType('US').input(props.person.mobile)
    else return 'Mobile'
  })

  function validate_mobile_number() {
    const is_valid =
      !!props.person.mobile &&
      validate.value.parseNumber(props.person.mobile, 'US').phone
    disabled_sign_in.value = !is_valid
    return is_valid
  }

  function disable_input() {
    mobile.value.disabled = true
  }

  async function begin_authorization() {
    disable_input()
    show_authorize.value = false
    show_captcha.value = true
    await nextTick()
    human.value = new firebase.auth.RecaptchaVerifier('captcha', {
      size: 'invisible',
      callback: text_human_verify_code
    })
    human.value.verify()
  }

  async function text_human_verify_code() {
    working.value = false
    show_code.value = true
    show_captcha.value = false
    hide_captcha.value = true
    authorizer.value = await firebase
      .auth()
      .signInWithPhoneNumber(`+1${props.person.mobile}`, human.value)
    verification_code.value.scrollIntoView(false)
    verification_code.value.focus()
  }

  async function sign_in_with_code() {
    working.value = true
    disable_input()
    show_code.value = false
    try {
      await authorizer.value.confirm(code.value)
      emit('signed-on', props.person)
    } catch (e) {
      if (e.code === 'auth/invalid-verification-code') {
        working.value = false
        await nextTick()
        mobile.value.disabled = false
        show_code.value = true
      }
    }
  }

  function mobile_keypress(event) {
    if (!event.key.match(/^\d$/)) event.preventDefault()
  }

  function mobile_paste(event) {
    const past_text = event.clipboardData.getData('text/plain')
    const phone_number = validate.value.parseNumber(past_text, 'US').phone
    if (phone_number) {
      const update = { ...props.person }
      update.mobile = phone_number
      emit('update:person', update)
      return validate_mobile_number()
    } else return false
  }

  function code_keypress(event) {
    if (!event.key.match(/^\d$/)) event.preventDefault()
    const button = submit_verification.value
    const input = verification_code.value
    if (input.value.length === 5) button.disabled = false
  }
</script>

<style lang="stylus">
  form#profile-mobile
    animation-name: slide-in-left
    svg.remove
      fill: red
    fieldset
      margin-bottom: base-line
    input#mobile
      min-width: (40% - base-line * 2)
      margin-right: base-line
    button#sign-out
      border: none
      padding: 0
    menu
      display: flex
      justify-content: flex-end
</style>
