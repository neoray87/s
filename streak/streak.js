// 1. אימפורטים מאוחדים - פעם אחת בלבד!
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection,updateDoc, addDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// 2. אתחול
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;

// 3. פונקציית לוג
async function logEvent(action, details) {
    try {
        await addDoc(collection(db, "SystemLogs"), {
            action: action,
            details: details,
            timestamp: serverTimestamp(),
            device: navigator.userAgent.substring(0, 50) 
        });
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

// 5. ניהול משתמש ו-UI
onAuthStateChanged(auth, async (user) => {
    const otpVerified = sessionStorage.getItem('otp_verified');
    if (user) {
        if (otpVerified !== 'true') {
            handleLogout();
            return;
        }
        currentUser = user;
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        if (userDoc.exists()) {
            updateUIForLoggedInUser(userDoc.data().username || "משתמש");
        }
    } else {
        showGuestUI();
    }
});

// 6. חשיפה ל-window (כדי שה-onclick ב-HTML יעבוד)
window.toggleMenu = function() {
    if (!currentUser) {
        window.location.href = "login/login.html";
    } else {
        const menu = document.getElementById('userMenu');
        if (menu) menu.style.display = (menu.style.display === 'none') ? 'block' : 'none';
    }
};

window.handleLogout = function() {
    signOut(auth).then(() => {
        sessionStorage.removeItem('otp_verified');
        window.location.reload(); 
    });
};

// מאזין יחיד ומאוחד
onAuthStateChanged(auth, async (user) => {
    const otpVerified = sessionStorage.getItem('otp_verified');

    if (user) {
        // בדיקת אבטחה - OTP
        if (otpVerified !== 'true') {
            console.log("גישה נדחתה: חסר אימות OTP");
            handleLogout();
            logEvent("SECURITY_BYPASS_ATTEMPT", "User tried to access index without OTP");
            return;
        }

        currentUser = user;
        try {
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const name = userData.username || "משתמש"; 
                
                // שמירה ב-localStorage - זה מה שיאפשר לעמוד הפרופיל לעבוד!
                const localData = {
                    username: name,
                    uid: user.uid,
                    lastLogin: new Date().getTime()
                };
                localStorage.setItem('currentUser', JSON.stringify(localData));

                updateUIForLoggedInUser(name);
            }
        } catch (error) {
            console.error("שגיאה בשליפת נתונים:", error);
        }
    } else {
        localStorage.removeItem('currentUser');
        showGuestUI();
    }
});

// פונקציות עזר
function updateUIForLoggedInUser(name) {
    const visitorIcon = document.getElementById('visitorIcon');
    const avatarDiv = document.getElementById('userAvatar');
    const welcomeText = document.getElementById('welcomeText');
    const authButtons = document.getElementById('buttons');

    if (visitorIcon) visitorIcon.style.display = 'none';
    
    if (avatarDiv) {
        const firstLetter = name.charAt(0).toUpperCase();
        avatarDiv.textContent = firstLetter;
        avatarDiv.style.backgroundColor = getAvatarColor(firstLetter);
        avatarDiv.style.display = 'flex';
    }

    if (welcomeText) welcomeText.textContent = `שלום, ${name}`;
    if (authButtons) authButtons.style.display = 'none';
}

function showGuestUI() {
    currentUser = null;
    if (document.getElementById('visitorIcon')) document.getElementById('visitorIcon').style.display = 'block';
    if (document.getElementById('userAvatar')) document.getElementById('userAvatar').style.display = 'none';
    if (document.getElementById('welcomeText')) document.getElementById('welcomeText').textContent = "";
    if (document.getElementById('buttons')) document.getElementById('buttons').style.display = 'flex';
}

function getAvatarColor(letter) {
    const colors = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#e67e22", "#e74c3c"];
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
}
window.handleLogout = function() {
    signOut(auth).then(() => {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('otp_verified');
        window.location.reload(); 
    }).catch(error => console.error("שגיאה:", error));
};
