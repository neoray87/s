
import { initializeApp } from "firebase/app";
import { query, where, getDocs, collection } from "firebase/firestore";
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
const message = document.getElementById("message").innerText;
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
const db = getFirestore(app);
async function testDatabase() {
  try {
    const docRef = await addDoc(collection(db, "passwords"), {
      message:"החיבור מהאתר עובד!",
      time: new Date()
    });
    console.log("הנתון נשמר בהצלחה! מזהה המסמך: ", docRef.id);
  } catch (e) {
    console.error("שגיאה בשמירת הנתון: ", e);
  }
}
async function checkIfUserExists(usernameToCheck) {
  // 1. יצירת שאילתה: חפש באוסף "users" איפה ששדה "username" שווה לשם שהוכנס
  const usersRef = collection(db, "users"); 
  const q = query(usersRef, where("username", "==", usernameToCheck));

  try {
    const querySnapshot = await getDocs(q);
    
    // 2. בדיקה אם חזרו תוצאות
    if (!querySnapshot.empty) {
      console.log("המשתמש קיים במערכת!");
      querySnapshot.forEach((doc) => {
        console.log("נתוני המשתמש:", doc.data());
      });
      return true;
    } else {
      console.log("משתמש לא נמצא.");
      return false;
    }
  } catch (error) {
    console.error("שגיאה בחיפוש:", error);
  }
}
testDatabase();