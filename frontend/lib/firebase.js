import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyCxFT4jzUP89BY8EtXH1tA2zwVACRUEyzw",
    authDomain: "clinic-68769.firebaseapp.com",
    projectId: "clinic-68769",
    storageBucket: "clinic-68769.firebasestorage.app",
    messagingSenderId: "808486679916",
    appId: "1:808486679916:web:f94ec0ab36b11dd574ef49",
    measurementId: "G-WCQBLYZPXJ"
  };

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
