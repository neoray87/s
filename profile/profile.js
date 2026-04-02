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
        avatarDiv.style.borderRadius = '50%';
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

// מאזין פיירבייס (ליתר ביטחון אם ה-Local Storage ריק)
onAuthStateChanged(auth, (user) => {
    if (user) {
        const savedUser = JSON.parse(localStorage.getItem('currentUser'));
        if (savedUser) {
            updateProfileUI(savedUser.username);
        }
    } else {
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