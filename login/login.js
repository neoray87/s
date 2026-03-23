import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


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
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('loginButton');
    if (btn) {
         document.getElementById('loginButton').addEventListener('click', () => {
         const emailVal = document.getElementById('username').value; // תשתמש באימייל שרשמת ב-Console
         const passwordVal = document.getElementById('password').value;
         handleLogin(emailVal, passwordVal);
});
    }
});
async function handleLogin(email, password) {
    const messagesElement = document.getElementById("messages");
    
    try {
        // כאן גוגל מבצעת את הבדיקה (האם קיים? האם הסיסמה נכונה?)
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // אם הגענו לכאן - המשתמש קיים והסיסמה נכונה!
        const user = userCredential.user;
        messagesElement.innerText = "התחברת בהצלחה! מזהה: " + user.uid;
        messagesElement.style.color = "green";
        window.location.href = "../index.html"; 

    } catch (error) {
        // אם גוגל לא מצאה את המשתמש או שהסיסמה שגויה, היא תזרוק שגיאה
        console.error("שגיאה בקוד:", error.code);
        messagesElement.innerText = "שם משתמש או סיסמה לא נכונים.";
        messagesElement.style.color = "red";
    }
}