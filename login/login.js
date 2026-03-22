import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('loginButton');
    if (btn) {
        btn.addEventListener('click', () => {
            const userVal = document.getElementById('username').value;
            const passwordVal = document.getElementById('password').value;
            checkIfUserExists(userVal, passwordVal);
        });
    }
});

async function checkIfUserExists(usernameToCheck, passwordToCheck) {
    const messagesElement = document.getElementById("messages");
    messagesElement.innerText = "בודק נתונים...";
    
    // שים לב: שיניתי ל-Users עם U גדולה לפי התמונה ששלחת
    const usersRef = collection(db, "Users"); 
    const q = query(usersRef, where("username", "==", usernameToCheck));

    try {
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            
            // בדיקת סיסמה
            if (userData.password === passwordToCheck) {
                messagesElement.innerText = "התחברת בהצלחה!";
                // כאן תוכל להוסיף מעבר דף: window.location.href = "dashboard.html";
                return true;
            } else {
                messagesElement.innerText = "שם משתמש או סיסמה שגויים.";
                return false;
            }
        } else {
            messagesElement.innerText = "שם משתמש או סיסמה שגויים.";
            return false;
        }
    } catch (error) {
        console.error("שגיאה:", error);
        messagesElement.innerText = "שגיאה בתקשורת עם השרת.";
    }
}
