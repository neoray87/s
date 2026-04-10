// 1. אימפורטים מאוחדים
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, updateDoc, addDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

// 2. אתחול בטוח
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;

// 3. פונקציית לוג מערכת
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

// 4. ניטור נעילת מערכת (Real-time)
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
                        <p style="font-size: 1.5rem; margin: 20px 0; font-weight: bold; color: #ffcccc;">המערכת ננעלה מרחוק.</p>
                    </div>`;
                
                Object.assign(lockOverlay.style, {
                    position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
                    backgroundColor: "black", color: "red", display: "flex",
                    alignItems: "center", justifyContent: "center", zIndex: "999999"
                });
                document.body.appendChild(lockOverlay);
                document.body.style.overflow = "hidden";
            }
        } else if (lockOverlay) {
            lockOverlay.remove();
            document.body.style.overflow = "auto";
        }
    }
});

// 5. ניהול מצב משתמש (Auth Observer)
onAuthStateChanged(auth, async (user) => {
    const otpVerified = sessionStorage.getItem('otp_verified');

    if (user) {
        if (otpVerified !== 'true') {
            console.warn("Security Breach: Missing OTP verification");
            handleLogout();
            return;
        }

        currentUser = user;
        try {
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            if (userDoc.exists()) {
                const name = userDoc.data().username || "משתמש";
                localStorage.setItem('currentUser', JSON.stringify({
                    username: name,
                    uid: user.uid
                }));
                updateUIForLoggedInUser(name);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    } else {
        showGuestUI();
    }
});

// 6. פונקציות UI שנחשפות ל-window (בשביל ה-onclick ב-HTML)
window.incrementBtn = function() {
    const container = document.getElementById('createStreakBtn');
    if (container) {
        container.style.display = 'flex';
    }
};

window.createStreak = async function() {
    if (!currentUser) return;

    const streakName = document.getElementById('streakName').value;
    const streakDescription = document.getElementById('streakDescription').value;

    if (!streakName) {
        alert("אנא הזן שם לסטריק!");
        return;
    }

    try {
        const streaksCollection = collection(db, "Users", currentUser.uid, "Streaks");
        await addDoc(streaksCollection, {
            name: streakName,
            description: streakDescription,
            createdAt: serverTimestamp(),
            currentCount: 0
        });

        alert("רצף נוצר בהצלחה!");
        document.getElementById('createStreakBtn').style.display = 'none';
        await logEvent("STREAK_CREATED", `User: ${currentUser.uid}`);
    } catch (error) {
        console.error("Creation failed:", error);
    }
};

window.handleLogout = function() {
    signOut(auth).then(() => {
        sessionStorage.removeItem('otp_verified');
        localStorage.removeItem('currentUser');
        window.location.reload(); 
    });
};

// פונקציות עזר פנימיות
function updateUIForLoggedInUser(name) {
    const welcomeText = document.getElementById('welcomeText');
    if (welcomeText) welcomeText.textContent = `שלום, ${name}`;
    const avatar = document.getElementById('userAvatar');
    if (avatar) {
        avatar.textContent = name.charAt(0).toUpperCase();
        avatar.style.display = 'flex';
    }
}

function showGuestUI() {
    currentUser = null;
    if (document.getElementById('welcomeText')) document.getElementById('welcomeText').textContent = "שלום אורח";
}