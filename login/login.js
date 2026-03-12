// הוספת היכולות של Firestore
import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries



// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

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



// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// אתחול בסיס הנתונים
const db = getFirestore(app);

// פונקציה פשוטה שבודקת שהכל עובד ושולחת נתון לטבלה
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

// קריאה לפונקציה כדי לבדוק את החיבור
testDatabase();