import { initializeApp, getApps } from "firebase/app"
import { getDatabase, ref, set, get, push, remove, update, onValue, off } from "firebase/database"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCFcyfXEySdNdgiVKrNcY92jpiiI5GZJrk",
  authDomain: "calistar-loja.firebaseapp.com",
  databaseURL: "https://calistar-loja-default-rtdb.firebaseio.com",
  projectId: "calistar-loja",
  storageBucket: "calistar-loja.firebasestorage.app",
  messagingSenderId: "1002360398506",
  appId: "1:1002360398506:web:4e34d28aeeb93226a726d3",
  measurementId: "G-DWS32J7V77",
}

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const database = getDatabase(app)
const storage = getStorage(app)

export {
  app,
  database,
  storage,
  ref,
  set,
  get,
  push,
  remove,
  update,
  onValue,
  off,
  storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
}
