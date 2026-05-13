import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBlElRlC390vtHoJtZ3ihqkkZ2YXo3XfWk",
  authDomain: "cuceimarketanticheats.firebaseapp.com",
  projectId: "cuceimarketanticheats",
  storageBucket: "cuceimarketanticheats.firebasestorage.app",
  messagingSenderId: "386444856338",
  appId: "1:386444856338:web:4050cca96fbec00781dccb"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
