import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// 2. אתחול - חובה לפי הסדר הזה!
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. לוגיקת כפתור הרישום
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('loginButton'); // וודא שה-ID ב-HTML הוא אכן loginButton
    if (btn) {
        btn.addEventListener('click', () => {
            const emailVal = document.getElementById('username').value; // ב-Auth משתמשים באימייל
            const passwordVal = document.getElementById('password').value;
            const ageVal = document.getElementById('age').value;
            const displayNameVal = document.getElementById('displayName').value;

            // קריאה לפונקציה הנכונה
            registerNewUser(emailVal, passwordVal, displayNameVal, ageVal);
        });
    }
});

// 4. פונקציית הרישום
async function registerNewUser(email, password, displayName, age) {
    try {
        // יצירת המשתמש ב-Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // שמירת המשתנים ב-Firestore תחת ה-UID של המשתמש
        await setDoc(doc(db, "Users", user.uid), {
            username: displayName,
            userAge: age,
            email: email,
            createdAt: new Date(),
            role: "monitor_admin"
        });

        alert("משתמש נוצר בהצלחה במערכת המאובטחת!");
        console.log("UID:", user.uid);
    } catch (error) {
        console.error("שגיאה ברישום:", error.message);
        alert("שגיאה: " + error.message);
    }
}