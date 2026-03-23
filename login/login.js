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
    
    // 1. הגדרת הפניה לאוסף (שים לב ל-Users עם U גדולה לפי הצילום שלך)
    const usersRef = collection(db, "Users"); 
    
    // 2. יצירת שאילתה למציאת המשתמש לפי השם בלבד
    const q = query(usersRef, where("username", "==", usernameToCheck));
     const m = query(usersRef, where("password", "==", passwordToCheck));

    try {
        const querySnapshot = await getDocs(q);
        
        // 3. בדיקה אם המשתמש בכלל קיים
        if (!querySnapshot.empty) {
            // לוקחים את הנתונים של המסמך הראשון שנמצא
            const userData = querySnapshot.docs[0].data();
            
            // 4. השוואת הסיסמה מה-DB לסיסמה שהמשתמש הקליד
            if (query(usersRef, where("username", "==", usernameToCheck)) && query(usersRef, where("password", "==", passwordToCheck))) {
                messagesElement.innerText = "התחברת בהצלחה! מעביר לדף הבית...";
                messagesElement.style.color = "green";
                
                // הצעד הבא: שמירת המשתמש ב-Session ומעבר דף
                sessionStorage.setItem("user", usernameToCheck);
                setTimeout(() => {
                    window.location.href = "index.html"; // שנה לנתיב שלך
                }, 1500);
                
                return true;
            } else {
                // חשוב: הודעה עמומה כדי לא לחשוף מידע לתוקף
                messagesElement.innerText = "שם משתמש או סיסמה שגויים.";
                messagesElement.style.color = "red";
                return false;
            }
        } else {
            messagesElement.innerText = "שם משתמש או סיסמה שגויים.";
            messagesElement.style.color = "red";
            return false;
        }
    } catch (error) {
        console.error("Error signing in:", error);
        messagesElement.innerText = "שגיאה בתקשורת עם השרת.";
    }
}