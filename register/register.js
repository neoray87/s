import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
        import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
        const auth = getAuth(app);
        const db = getFirestore(app);
        import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

        // לוגיקת כפתור הרישום
        document.addEventListener('DOMContentLoaded', () => {
            const btn = document.getElementById('loginButton');
            if (btn) {
                btn.addEventListener('click', () => {
                    const emailVal = document.getElementById('username').value;
                    const passwordVal = document.getElementById('password').value;
                    const ageVal = document.getElementById('age').value;
                    const displayNameVal = document.getElementById('displayName').value;
                    registerNewUser(emailVal, passwordVal, displayNameVal, ageVal);
                });
            }

            const verifyBtn = document.getElementById('verifyButton');
            if (verifyBtn) {
                verifyBtn.addEventListener('click', verifyAndCreateAccount);
            }
        });

        // פונקציות העזר שלך (כמו שהיו, רק בתוך הסקריפט)
        async function isUsernameTaken(chosenName) {
            const usersRef = collection(db, "Users");
            const q = query(usersRef, where("username", "==", chosenName));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        }

 async function registerNewUser(email, password, displayName, age){
            try {
                if (await isUsernameTaken(displayName)) {
                    alert("שם משתמש כבר תפוס.");
                    return;
                }
                if (!email.trim() || !password.trim() || !displayName.trim() || !age.trim()) {
                    alert("אנא מלא את כל השדות.");
                    return;
                }

                try{
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "Users", userCredential.user.uid), {
                username: displayName,
                userAge: age,
                email: email,
                createdAt: new Date(),
                role: "monitor_admin"
                });
                    await signInWithEmailAndPassword(auth, email, password);
                    await auth.signOut();
                }
                catch(error){
                    console.error("שגיאה ביצירת המשתמש ב-Firebase:", error);
                    alert("שגיאה ביצירת המשתמש: " + error.message);
                    return;
                }
                const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
                window.generatedCode = otpCode;
        
        // כאן השם חייב להיות email כדי שיתאים לשליפה אחר כך
        const currentTime = new Date().toLocaleString('he-IL');
        window.tempUserData = { email, password, displayName, age, currentTime }; 

        const templateParams = {
            to_email: email, 
            passcode: otpCode,
            time: currentTime
        };

        console.log("מנסה לשלוח למייל:", email); // בדיקה ב-Console

        emailjs.send("service_f9wbbcs", "template_690f7ew", templateParams)
        .then(() => {
            alert("קוד אימות נשלח למייל!");
            document.getElementById('otpInput').style.display = 'block';
            document.getElementById('registrationForm').style.display = 'none';
            document.getElementById('otpSection').style.display = 'block';
            
         })
        .catch(error => alert("שגיאה בשליחה: " + JSON.stringify(error)));
    } catch (error) {
        console.error(error);
    }
}
let trys = 0;
async function verifyAndCreateAccount() {
    const enteredCode = document.getElementById('otpInput').value;
    if (enteredCode === window.generatedCode) {
        const { email, password, displayName, age } = window.tempUserData;
        
        try {
            await signInWithEmailAndPassword(auth, email, password);

            sessionStorage.setItem('otp_verified', 'true'); 

            alert("החשבון נוצר בהצלחה!");
            logEvent("USER_REGISTERED", `Email: ${email}`);
            window.location.href = "../index.html"; 
        } catch (error) {
            logEvent("USER_REGISTRATION_FAILED", `Email: ${email}`);
            alert("שגיאה ב-Firebase: " + error.message);
        }
    } else {
        trys++;
        logEvent("USER_REGISTRATION_OTP_INVALID (" + trys + ")", `Email: ${email}`);
        alert("קוד שגוי.");
    }

}
async function logEvent(action, details) {
    try {
        await addDoc(collection(db, "SystemLogs"), {
            action: action,       // למשל: "FAILED_LOGIN"
            details: details,     // למשל: "Email: test@gmail.com"
            timestamp: serverTimestamp(),
            // ב-JS של דפדפן קשה להוציא IP אמיתי בלי שירות חיצוני, 
            // אז נשתמש ב-User Agent כרגע כדי לזהות את המכשיר
            device: navigator.userAgent.substring(0, 50) 
        });
    } catch (e) {
        console.error("Error logging event: ", e);
    }
}