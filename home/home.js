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
            }
        } catch (error) {
            console.error("שגיאה:", error);
        }
    } else {
        console.log("אורח צופה באתר");
    }
});

function getAvatarColor(letter) {
    const colors = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#e67e22", "#e74c3c"];
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
}