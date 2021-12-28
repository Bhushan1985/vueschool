import firebase from 'firebase/app'
import 'firebase/auth'
import { ref } from 'vue'

export default function authentication() {
  const signed_in = ref(false)

  firebase.auth().onAuthStateChanged(user => {
    if (user) signed_in.value = true
    else signed_in.value = false
  })

  return {
    signed_in
  }
}
