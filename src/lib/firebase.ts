// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyB9OYtrLJ4d3crF7C4alv8ZbPPcUgVkSms",

  authDomain: "grtp2-5ba00.firebaseapp.com",

  projectId: "grtp2-5ba00",

  storageBucket: "grtp2-5ba00.firebasestorage.app",

  messagingSenderId: "181277965274",

  appId: "1:181277965274:web:6068552f7b42b46742dee3",

  measurementId: "G-3GH7JZN3RQ"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
