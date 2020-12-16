import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/storage'

// firebase init
const firebaseConfig = JSON.parse(process.env.VUE_APP_FIREBASE_CONFIG || {})

firebase.initializeApp(firebaseConfig)

// utils
const db = firebase.firestore()
const auth = firebase.auth()
const functions = firebase.functions()
const storage = firebase.storage()

export {
  db,
  auth,
  functions,
  storage,
  firebase
}