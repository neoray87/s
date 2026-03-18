
import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {

  apiKey: "AIzaSyB8IFt-fo2KyTh4f0r9h0tYeu3YnxCiaSQ",

  authDomain: "new-smirat-abrit-db.firebaseapp.com",

  databaseURL: "https://new-smirat-abrit-db-default-rtdb.firebaseio.com",

  projectId: "new-smirat-abrit-db",

  storageBucket: "new-smirat-abrit-db.firebasestorage.app",

  messagingSenderId: "442821371588",

  appId: "1:442821371588:web:3ebf54a9b6cf30634c8b91",

  measurementId: "G-TTE31QX35E"

};
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
const db = getFirestore(app);
async function testDatabase() {
  try {
    const docRef = await addDoc(collection(db, "passwords"), {
      message: "החיבור מהאתר עובד!",
      time: new Date()
    });
    console.log("הנתון נשמר בהצלחה! מזהה המסמך: ", docRef.id);
  } catch (e) {
    console.error("שגיאה בשמירת הנתון: ", e);
  }
}

testDatabase();