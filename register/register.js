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
                if (password.length < 6) {
                    alert("הסיסמה חייבת להיות לפחות 6 תווים.");
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

async function verifyAndCreateAccount() {
    const enteredCode = document.getElementById('otpInput').value;
    if (enteredCode === window.generatedCode) {
        const { email, password, displayName, age } = window.tempUserData;
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "Users", userCredential.user.uid), {
                username: displayName,
                userAge: age,
                email: email,
                createdAt: new Date(),
                role: "monitor_admin"
            });

            await signInWithEmailAndPassword(auth, email, password);

            // --- השורה החסרה כאן! ---
            sessionStorage.setItem('otp_verified', 'true'); 
            // -----------------------

            alert("החשבון נוצר בהצלחה!");
            window.location.href = "../index.html"; 
        } catch (error) {
            alert("שגיאה ב-Firebase: " + error.message);
        }
    } else {
        alert("קוד שגוי.");
    }
}