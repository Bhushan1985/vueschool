<template>
  <main id="realness" :class="status">
    <router-view
      v-if="!working"
      v-model:statement="statement"
      v-model:person="me" />
  </main>
</template>
<script setup>
  import { computed, ref, onBeforeMount } from 'vue'
  import firebase from 'firebase/app'
  import { get, set } from 'idb-keyval'

  const working = ref(true)
  const me = ref(null)
  const statement = ref(null)
  const status = ref(null)

  const is_production = computed(
    () => import.meta.env.NODE_ENV === 'production'
  )

  const initLoad = async () => {
    if (is_production.value) {
      const response = await fetch('__/firebase/init.json')
      await set('firebase-keys', await response.json())
    } else {
      const keys = {
        apiKey: import.meta.env.VITE_API_KEY,
        authDomain: import.meta.env.VITE_AUTH_DOMAIN,
        databaseUrl: import.meta.env.VITE_DATABASE_URL,
        projectId: import.meta.env.VITE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID
      }
      await set('firebase-keys', keys)
    }
    firebase.initializeApp(await get('firebase-keys'))
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    working.value = false
  }

  function online() {
    const editable = document.querySelectorAll('[contenteditable]')
    editable.forEach(e => e.setAttribute('contenteditable', true))
    status.value = null
  }

  function offline() {
    const editable = document.querySelectorAll('[contenteditable]')
    editable.forEach(e => e.setAttribute('contenteditable', false))
    status.value = 'offline'
  }

  onBeforeMount(() => {
    window.removeEventListener('online', online)
    window.removeEventListener('offline', offline)
  })

  /* eslint-disable no-unused-vars */
  function sync_active(active) {
    if (active) status.value = 'working'
    else status.value = null
  }
  /* eslint-enable no-unused-vars */

  initLoad()
</script>
<style src="@/style/index.styl" lang="stylus"></style>

<style lang="stylus">
  //   main
  //     border: (base-line / 16) solid transparent
  //     border-radius (base-line / 16)
  //     &.offline
  //       border-color: yellow
  //     &.working
  //       border-color: green
  //       animation-name: pulsing
  //       animation-duration: 5s
  //       animation-delay: 200ms
  //       animation-iteration-count: infinite
  //
</style>
