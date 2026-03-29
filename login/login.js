import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 3. הגדרת פונקציית הלוג (חייבת להיות כאן!)
async function logEvent(action, details) {
    try {
        await addDoc(collection(db, "SystemLogs"), {
            action: action,
            details: details,
            timestamp: serverTimestamp(),
            device: navigator.userAgent.substring(0, 50) 
        });
        console.log("Log sent: " + action);
    } catch (e) {
        console.error("Error logging: ", e);
    }
}
onSnapshot(doc(db, "Settings", "GlobalConfig"), (docSnapshot) => {
    if (docSnapshot.exists()) {
        const isLocked = docSnapshot.data().isSystemLocked;
        let lockOverlay = document.getElementById("systemLockOverlay");

        if (isLocked) {
            if (!lockOverlay) {
                lockOverlay = document.createElement("div");
                lockOverlay.id = "systemLockOverlay";
                lockOverlay.innerHTML = `
                    <div style="border: 2px solid #ff0000; padding: 40px; background: rgba(20, 0, 0, 0.9); box-shadow: 0 0 30px rgba(255, 0, 0, 0.5); border-radius: 10px;">
                        <h1 style="font-size: 3rem; margin: 0; text-shadow: 0 0 10px #ff0000;">⚠️ ACCESS DENIED ⚠️</h1>
                        <p style="font-size: 1.5rem; margin: 20px 0; font-weight: bold; color: #ffcccc;">המערכת ננעלה מרחוק על ידי המנהל.</p>
                        <p style="font-size: 1.2rem; color: #ffcccc; letter-spacing: 1px;">Security Protocol Active.</p>
                    </div>`;
                
                Object.assign(lockOverlay.style, {
                    position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
                    backgroundColor: "black", color: "red", display: "flex",
                    alignItems: "center", justifyContent: "center", textAlign: "center",
                    fontFamily: "monospace", zIndex: "999999", overflow: "hidden"
                });
                
                document.body.appendChild(lockOverlay);
                document.body.style.overflow = "hidden";
            }
        } else if (lockOverlay) {
            // כאן הקסם: אם זה לא נעול ויש overlay, פשוט תוריד אותו
            lockOverlay.remove();
            document.body.style.overflow = "auto";
        }
    }
});

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
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await logEvent("USER_LOGIN_ATTEMPT_SUCCESS", `Email: ${email}`); 
        
        sendVerificationEmail(email);
        await auth.signOut(); 
        console.log("משתמש אומת ונותק זמנית");
    } catch (error) {
        // שליחת לוג על כישלון
        await logEvent("USER_LOGIN_FAILED", `Email: ${email} | Error: ${error.code}`);
        document.getElementById("messages").innerText = "פרטים שגויים.";
    }
}
let trys = 0;
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
            await logEvent("USER_LOGIN_SUCCESS", `Email: ${emailVal}`);
            window.location.href = "../index.html"; 
        } catch (error) {
            alert("שגיאה בחיבור מחדש: " + error.message);
            logEvent("USER_LOGIN_FAILED ", `Email: ${emailVal}`);
        }
    } else {
        trys++;
        alert("קוד שגוי, נסה שוב.");
        logEvent("USER_LOGIN_OTP_INVALID (" + trys + ")", `Email: ${emailVal}`);
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