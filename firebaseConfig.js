// src/firebaseConfig.js
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
require('dotenv').config(); // تحميل متغيرات البيئة


// Firebase configuration

const firebaseConfig = {
  apiKey: process.env.FIREBASE_apiKey,
  authDomain: process.env.FIREBASE_authDomain,
  databaseURL: process.env.FIREBASE_databaseURL,
  projectId:process.env.FIREBASE_projectId,
  storageBucket:process.env.FIREBASE_storageBucket,
  messagingSenderId:process.env.FIREBASE_messagingSenderId,
  appId:process.env.FIREBASE_appId,
  measurementId:process.env.FIREBASE_measurementId
};

/*
const firebaseConfig = {
  apiKey: "AIzaSyCxygxIX7nzHqBF7DPpmPFA8INpQShJnZk",
  authDomain: "inventory-679b2.firebaseapp.com",
  databaseURL: "https://inventory-679b2-default-rtdb.firebaseio.com",
  projectId: "inventory-679b2",
  storageBucket: "inventory-679b2.firebasestorage.app",
  messagingSenderId: "142126179008",
  appId: "1:142126179008:web:a5bb45a2f1bcbe84540325",
  measurementId: "G-T0DP8L6TPQ"
};
*/
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

module.exports = { database };

