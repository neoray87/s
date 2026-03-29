import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;

// מאזין יחיד ומאוחד
onAuthStateChanged(auth, async (user) => {
    const otpVerified = sessionStorage.getItem('otp_verified');

    if (user) {
        // בדיקת אבטחה - OTP
        if (otpVerified !== 'true') {
            console.log("גישה נדחתה: חסר אימות OTP");
            handleLogout();
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

// חשיפה ל-window עבור ה-HTML
window.toggleMenu = function() {
    if (!currentUser) {
        window.location.href = "login/login.html";
    } else {
        const menu = document.getElementById('userMenu');
        if (menu) {
            menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
        }
    }
};

window.handleLogout = function() {
    signOut(auth).then(() => {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('otp_verified');
        window.location.reload(); 
    }).catch(error => console.error("שגיאה:", error));
};