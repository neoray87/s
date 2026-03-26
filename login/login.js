import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
let isconnected = false;
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
    // 1. כפתור התחברות
    const loginBtn = document.getElementById('loginButton');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const emailVal = document.getElementById('username').value;
            const passwordVal = document.getElementById('password').value;
            handleLogin(emailVal, passwordVal);
        });
    }

    // 2. כפתור אימות קוד (זה מה שהיה חסר!)
    const verifyBtn = document.getElementById('verifyButton');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
            window.verifyCodeAndLogin();
        });
    }
});

async function handleLogin(email, password) {
    const messagesElement = document.getElementById("messages");
    if (!email.trim() || !password.trim()) {
        alert("אנא מלא את כל השדות.");
        return;
    }

    try {
        // 1. בדיקה ראשונית מול פיירבייס (האם המשתמש והסיסמה נכונים)
        // שים לב שהוספתי await כדי שנחכה לתשובה מגוגל
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // 2. אם הגענו לכאן - הפרטים נכונים! נשלח את המייל
        sendVerificationEmail(email);

        // 3. עכשיו ננתק אותו מיד כדי שלא "יברח" לדף הבית
        // אנחנו עושים signOut ומנקים את ה-SessionStorage כדי להיות בטוחים
        await auth.signOut();
        sessionStorage.removeItem('otp_verified'); 
        
        console.log("משתמש אומת ונותק זמנית עד להזנת קוד OTP");

    } catch (error) {
        console.error("שגיאה בכניסה:", error.code);
        messagesElement.innerText = "שם משתמש או סיסמה לא נכונים.";
        messagesElement.style.color = "red";
    }
}

// פונקציית אימות הקוד צריכה להשתנות מעט! 
// כי עכשיו המשתמש מנותק, אז צריך לחבר אותו מחדש
window.verifyCodeAndLogin = async function() {
    const enteredCode = document.getElementById('otpInput').value;
    const emailVal = document.getElementById('username').value;
    const passwordVal = document.getElementById('password').value;

    if (enteredCode === window.generatedCode) {
        try {
            // התחברות סופית מחדש
            await signInWithEmailAndPassword(auth, emailVal, passwordVal);
            sessionStorage.setItem('otp_verified', 'true'); 
            
            alert("קוד תקין! ברוך הבא.");
            window.location.href = "../index.html"; 
        } catch (error) {
            alert("שגיאה בחיבור מחדש: " + error.message);
        }
    } else {
        alert("קוד שגוי, נסה שוב.");
    }
};

function sendVerificationEmail(email) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    window.generatedCode = otpCode;

    const templateParams = {
        to_email: email, 
        passcode: otpCode,
        time: new Date().toLocaleString('he-IL')
    };

    emailjs.send("service_f9wbbcs", "template_690f7ew", templateParams)
    .then(function() {
        alert("קוד אימות נשלח למייל!");
        // החלפת התצוגה
        document.getElementById('otpSection').style.display = 'flex';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('buttons').style.display = 'none'; // להסתיר את כפתור ההתחברות המקורי
    })
    .catch(error => alert("שגיאה בשליחה: " + JSON.stringify(error)));
}