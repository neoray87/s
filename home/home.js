import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// המאזין של פיירבייס למצב המשתמש
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const name = userData.username || "משתמש"; 
                
                // 1. הסתרת אייקון האורח והצגת האוואטר
                const visitorIcon = document.getElementById('visitorIcon');
                const avatarDiv = document.getElementById('userAvatar');
                const welcomeText = document.getElementById('welcomeText');

                if (visitorIcon) visitorIcon.style.display = 'none';
                
                if (avatarDiv) {
                    const firstLetter = name.charAt(0).toUpperCase();
                    avatarDiv.textContent = firstLetter;
                    avatarDiv.style.backgroundColor = getAvatarColor(firstLetter);
                    avatarDiv.style.display = 'flex'; // הצגת העיגול
                }

                if (welcomeText) {
                    welcomeText.textContent = `שלום, ${name}`;
                }

                // הסתרת כפתורי הרישום/התחברות כי המשתמש כבר מחובר
                const authButtons = document.getElementById('buttons');
                if (authButtons) authButtons.style.display = 'none';
                return true;
            }
        } catch (error) {
            console.error("שגיאה:", error);
        }
    } else {
        console.log("אורח צופה באתר");
        return false;
    }
});

function getAvatarColor(letter) {
    const colors = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#e67e22", "#e74c3c"];
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
}
let currentUser = null;

onAuthStateChanged(auth, function(user) {
    // 1. בדיקה מיידית של ה-OTP
    const otpVerified = sessionStorage.getItem('otp_verified');

    if (user) {
        if (otpVerified !== 'true') {
            // המשתמש מחובר לפיירבייס אבל "גנב" את הכניסה בלי OTP
            console.log("Access Denied: Missing OTP verification");
            
            // מנתקים אותו כדי שלא יישאר מחובר בטעות
            auth.signOut().then(function() {
                window.location.href = "login/login.html";
            });
            return; // עצירה מוחלטת! שום קוד למטה לא ירוץ
        }

        // 2. אם הגענו לכאן, המשתמש עבר OTP - אפשר להציג את הנתונים
        currentUser = user;
        getDoc(doc(db, "Users", user.uid)).then(function(userDoc) {
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const name = userData.username || "משתמש"; 
                
                // עדכון ממשק המשתמש (UI)
                updateUIForLoggedInUser(name);
            }
        });

    } else {
        // 3. מצב אורח
        showGuestUI();
    }
});

// פונקציות עזר כדי לשמור על קוד נקי
function updateUIForLoggedInUser(name) {
    document.getElementById('visitorIcon').style.display = 'none';
    const avatarDiv = document.getElementById('userAvatar');
    avatarDiv.textContent = name.charAt(0).toUpperCase();
    avatarDiv.style.backgroundColor = getAvatarColor(name.charAt(0));
    avatarDiv.style.display = 'flex';
    document.getElementById('welcomeText').textContent = "שלום, " + name;
    if(document.getElementById('buttons')) document.getElementById('buttons').style.display = 'none';
}

function showGuestUI() {
    document.getElementById('visitorIcon').style.display = 'block';
    document.getElementById('userAvatar').style.display = 'none';
    document.getElementById('welcomeText').textContent = "";
    if(document.getElementById('buttons')) document.getElementById('buttons').style.display = 'block';
}

// 2. פונקציית התפריט המתוקנת
window.toggleMenu = function() {
    // אם אין משתמש מחובר - שלח ללוגין
    if (!currentUser) {
        window.location.href = "login/login.html";
    } else {
        // אם יש משתמש - פתח/סגור תפריט
        var menu = document.getElementById('userMenu');
        if (menu) {
            menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
        }
    }
};

// 3. פונקציית התנתקות (Sign Out)
window.handleLogout = function() {
    auth.signOut().then(function() {
        // אין צורך ב-alert, ה-onAuthStateChanged יטפל בשאר
        window.location.reload(); 
    }).catch(function(error) {
        console.error("שגיאה ביציאה:", error);
    });
};