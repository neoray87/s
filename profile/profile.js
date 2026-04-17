import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// חובה להדביק כאן את ה-firebaseConfig המלא שלך מהקבצים הקודמים
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
async function logEvent(action, details, severity = 1) { // ברירת מחדל ירוק
    try {
        await addDoc(collection(db, "SystemLogs"), {
            action: action,
            details: details,
            severity: severity, // השדה החדש שלנו
            timestamp: serverTimestamp(),
            device: navigator.userAgent.substring(0, 50) ,
            IP: await getUserIP() // פונקציה חדשה לקבלת ה-IP
        });
    } catch (e){
        
    } }


function updateProfileUI(name) {
    const welcomeText = document.getElementById('displayUserName');
    const avatarDiv = document.querySelector('.avatar-large');


    if (welcomeText) {
        welcomeText.textContent = `שלום, ${name}`;
    }

    if (avatarDiv) {
        const firstLetter = name.charAt(0).toUpperCase();
        // כאן אנחנו מחליפים את האייקון באות של השם
        avatarDiv.innerHTML = `<span style="color: white; font-family: sans-serif;">${firstLetter}</span>`;
        avatarDiv.style.backgroundColor = getAvatarColor(firstLetter);
        
        avatarDiv.style.display = 'flex';
        avatarDiv.style.alignItems = 'center';
        avatarDiv.style.justifyContent = 'center';
        avatarDiv.style.borderRadius = '100%';
        avatarDiv.style.width = '50%w';
        avatarDiv.style.height = '50%w';
        avatarDiv.style.margin = '0 auto';
        avatarDiv.style.fontSize = '40px';
        avatarDiv.style.fontWeight = 'bold';
    }
}

// הרצה ברגע שהדף נטען
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {
        updateProfileUI(savedUser.username);
    }
});
async function displayUserDetails() {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    const usernamedisplay = document.getElementById('displayUserName');
    const createdAtDisplay = document.getElementById('join-date');
    const bestStreakDisplay = document.getElementById('bestStreak');
    const cablotStatValue = document.getElementById('cablotstat-value');
    const teilimStatValue = document.getElementById('teilimstat-value');

    if (savedUser) {
        usernamedisplay.innerText = `שם משתמש: ${savedUser.username}`;
        createdAtDisplay.innerText = `תאריך יצירה: ${savedUser.createdAt}`;
        bestStreakDisplay.innerText = `הסטריק הטוב ביותר: ${savedUser.bestStreak || 0}`;
        cablotStatValue.innerText = savedUser.cablotCount || 0;
        teilimStatValue.innerText = savedUser.teilimCount || 0;
    } else {
        alert("לא נמצאו פרטי משתמש.");
    }   
}
// מאזין פיירבייס (ליתר ביטחון אם ה-Local Storage ריק)
onAuthStateChanged(auth, (user) => {
    if (user) {
        const savedUser = JSON.parse(localStorage.getItem('currentUser'));
        if (savedUser) {
            updateProfileUI(savedUser.username);
        }
    } else {
        logEvent("USER_TRYED_SKIPLOGIN", "user enterd manaly the url to try skip login", 3);
        alert("אנא התחבר כדי לגשת לפרופיל.");
        window.location.href = "../index.html"; 
    }
});

function getAvatarColor(letter) {
    const colors = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#e67e22", "#e74c3c"];
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
}

window.handleLogout = function() {
    signOut(auth).then(() => {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('otp_verified');
        window.location.href = "../index.html";
    });
};