// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBZeXXJMabJwBzooZN9CvoiMRDoLARSOGQ",
    authDomain: "touche-de-clavier.firebaseapp.com",
    projectId: "touche-de-clavier",
    storageBucket: "touche-de-clavier.firebasestorage.app",
    messagingSenderId: "1078741163645",
    appId: "1:1078741163645:web:1ab871f585f92f44c35b14"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };
