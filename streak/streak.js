// 1. אימפורטים מאוחדים
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc,getDocs, collection, updateDoc, addDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
let isUpdating = false; // דגל למניעת לולאה אינסופית

onAuthStateChanged(auth, async (user) => {
    const otpVerified = sessionStorage.getItem('otp_verified');

    if (user) {
        if (otpVerified !== 'true') {
            handleLogout();
            return;
        }

        currentUser = user;
        
        // הגנה: אם אנחנו כבר בתהליך עדכון, אל תריץ שוב
        if (isUpdating) return; 

        try {
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            if (userDoc.exists()) {
                const name = userDoc.data().username || "משתמש";
                updateUIForLoggedInUser(name);
                
                isUpdating = true; // סימון שהתחלנו עדכון
                await loadStreakUI();
                // מחק את הקריאה ל-updateStreak מכאן אם היא גורמת לרענון!
                isUpdating = false; 
            }
        } catch (error) {
            console.error("Error:", error);
            isUpdating = false;
        }
    } else {
        handleLogout();
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
    if (!currentUser) handleLogout(); return;

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
async function loadStreakUI() {
    if (!currentUser) return;
    
    const container = document.getElementById("streakContainer");
    if (!container) return;

    try {
        const streaksCollection = collection(db, "Users", currentUser.uid, "Streaks");
        const querySnapshot = await getDocs(streaksCollection);

        container.innerHTML = ""; // ניקוי המסך לפני טעינה מחדש

        if (querySnapshot.empty) {
            container.innerHTML = "<p>עדיין לא נוצרו רצפים. לחץ על 'התחל רצף' למעלה.</p>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            renderStreakWidget(data.name, data.currentCount || 0, docSnap.id);
        });
    } catch (error) {
        console.error("שגיאה בטעינת הרצפים:", error);
    }
}

// פונקציה שמייצרת את הדיב לכל רצף בנפרד
function renderStreakWidget(name, count, streakId) {
    const container = document.getElementById("streakContainer");
    
    const card = document.createElement("div");
    card.className = "streak-card";
    // עיצוב בסיסי כדי שנראה שמשהו קורה
    card.style = "border: 2px solid #ffa500; padding: 15px; border-radius: 12px; margin: 10px 0; background: #fff5e6;";
    
    card.innerHTML = `
        <h3 style="margin: 0;">${name}</h3>
        <p style="font-size: 1.2rem;">🔥 רצף: <strong>${count}</strong></p>
        <button onclick="checkIn('${streakId}')" style="cursor:pointer; padding: 5px 10px;">סמן הצלחה</button>
    `;
    
    container.appendChild(card);
}
async function checkAndUpdateIndividualStreak(streakId, data) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    const lastCheckIn = data.lastCheckInDate ? data.lastCheckInDate : null;
    const streakRef = doc(db, "Users", currentUser.uid, "Streaks", streakId);

    if (!lastCheckIn) return; // אם מעולם לא לחצו, אין מה לעדכן

    // אם עבר יותר מיום אחד מאז הצ'ק-אין האחרון - איפוס
    if (today > lastCheckIn + oneDayInMs) {
        await updateDoc(streakRef, {
            currentCount: 0 
        });
        console.log(`הסטריק "${data.name}" אופס כי עבר זמן.`);
        loadStreakUI(); // רענון התצוגה
    }
}


window.checkIn = async function(streakId) {
    if (!currentUser) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const streakRef = doc(db, "Users", currentUser.uid, "Streaks", streakId);
    
    const streakSnap = await getDoc(streakRef);
    const data = streakSnap.data();

    if (data.lastCheckInDate === today) {
        alert("כבר סימנת הצלחה לרצף זה היום!");
        return;
    }

    const newCount = (data.currentCount || 0) + 1;
    await updateDoc(streakRef, {
        currentCount: newCount,
        lastCheckInDate: today
    });

    alert(`מעולה! הרצף "${data.name}" עלה ל-${newCount}`);
    loadStreakUI(); // רענון התצוגה
};
async function updateStreak() {
    const userRef = doc(db, "Users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
        handleLogout();
        return;
    }

    const data = userSnap.data();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // נהפוך את התאריך מה-DB לאובייקט זמן של התחלת היום
    const lastLogin = data.lastLoginDate ? new Date(data.lastLoginDate) : null;
    if (!lastLogin) {
        await updateDoc(userRef, { currentStreak: 1, lastLoginDate: today });
        return;
    }

    const lastDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()).getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (today === lastDate) {
        console.log("כבר ביקרת היום");
    } else if (today === lastDate + oneDayInMs) {
        // עבר בדיוק יום אחד - הסטריק גדל!
        const newStreak = (data.currentStreak || 0) + 1;
        await updateDoc(userRef, { 
            currentStreak: newStreak, 
            lastLoginDate: today,
            bestStreak: Math.max(newStreak, data.bestStreak || 0)
        });
        alert(`כל הכבוד! הסטריק שלך עלה ל-${newStreak}`);
    } else {
        // עבר יותר מיום - הסטריק התאפס
        await updateDoc(userRef, { currentStreak: 1, lastLoginDate: today });
        alert("אוי! הסטריק התאפס. מתחילים מחדש.");
    }
}


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