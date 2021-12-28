<template>
  <section id="sign-on" class="page">
    <header>
      <h3>{{ person.first_name }} {{ person.last_name }}</h3>
      <menu v-if="signed_in">
        <button @click="sign_off">Sign off</button>
      </menu>
    </header>
    <mobile-as-form
      v-if="!signed_in"
      v-model:person="person"
      @signed-on="signed_on" />
    <name-as-form v-if="nameless" v-model:person="person" @valid="new_person" />
  </section>
</template>
<script setup>
  import { ref } from 'vue'
  import firebase from 'firebase/app'
  import 'firebase/auth'
  import MobileAsForm from '@/components/profile/as-form-mobile'
  import NameAsForm from '@/components/profile/as-form-name'
  import authentication from '@/mixins/signed_in'

  const nameless = ref(false)
  const person = ref({ mobile: '' })
  const { signed_in } = authentication()

  firebase.auth().onAuthStateChanged(auth_state)

  function auth_state(user) {
    if (user && person) person.value.mobile = null
  }
  async function signed_on() {
    nameless.value = true
  }
  function sign_off() {
    firebase.auth().signOut()
  }
  function new_person() {
    nameless.value = false
  }
</script>
<style lang="stylus">
  section#sign-on.page
    margin:auto
    display: flex
    flex-direction: column
    justify-content: space-between
    & > header > h3
      margin: 0
    form
    footer
      padding: base-line
      padding-top: 0
    & > footer > button
      opacity: 0.5
      &:hover
        opacity: 1
    @media (min-width: pad-begins)
      form, header
        align-self: center
      header
        width: 29rem
        margin: base-line
</style>
