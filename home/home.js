// 1. אימפורטים מאוחדים - פעם אחת בלבד!
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";



//כותרת דף הבית
let stnc1 = "יהא מורא רבך כמורא שמיים";
let stnc2 = "איזהו הגיבור הכובש את יצרו";
let stnc3 = "איזהו עשיר השמח בחלקו";
let stnc4 = "איזהו חכם הלומד מכל אדם";
let stnc5 = "איזהו החכם הרואה את הנולד";
let stnc6 = "מצווה גדולה להיות בשמחה תמיד";
let stnc7 = "אין יאוש בעולם כלל";
let stnc8 = "אין עוד מלבדו";
let stnc9 = "ישתבח שמו לעד";
let stnc10 = "ברוך שם כבוד מלכותו לעולם ועד";
let stnc11 = "הוא אלוקינו אין עוד";
let stnc12 = "גם היום הוא מתנה מבורא עולם";
let stnc13 = "מה רבו מעשיך ה'";
let stnc14 = "סור מרע ועשה טוב";
let stnc15 = "בקש שלום ורודפהו";
let stnc16 = "צדק צדק תרדוף";
let stnc17 = "ואהבת לרעך כמוך";
let stnc18 = "כבד את אביך ואת אמך למען יאריכון ימיך";
let stnc19 = "ה' ילחם לכם ואתם תחרישון";
let stnc20 = "שיוויתי ה' לנגדי תמיד";
let stnc21 = "ברוך הגבר אשר יבטח בה'";
let stnc22 = "כי עמך מקור חיים באורך נראה אור";
let stnc23 = "שמור לשונך מרע ושפתיך מדבר מרמה";
let stnc24 = "כמים הפנים לפנים כן לב האדם לאדם";
let stnc25 = "דרכיה דרכי נועם וכל נתיבותיה שלום";
let stnc26 = "שבע יפול צדיק וקם";
let stnc27 = "מי האיש החפץ חיים - נצור לשונך מרע";
let stnc28 = "שומר פיו ולשונו שומר מצרות נפשו";
let stnc29 = "ה' רועי לא אחסר";
let stnc30 = "ובכל דרכיך דעהו";
let stnc31 = "ואהבת את ה' אלוקיך בכל לבבך ובכל נפשך ובכל מאודך";
let stnc32 = "לא הביישן למד ולא הקפדן מלמד";
let stnc33 = "במקומות שאין אנשים השתדל להיות איש";
let stnc34 = "סייג לחוכמה - שתיקה";
let stnc35 = "החכם עיניו בראשו";
let stnc36 = "יהי כבוד חברך חביב עליך כשלך";
let stnc37 = "איזהו מכובד המכבד את הבריות";
let stnc38 = "טוב שם משמן טוב";
let stnc39 = "אל תדין חברך עד שתגיע למקומו";
let stnc40 = "מה ששנוא עליך אל תעשה לחבריך";
let stnc41 = "דרך ארץ קדמה לתורה";
let stnc42 = "יפה תלמוד תורה עם דרך ארץ";
let stnc43 = "אהבת חינם היא הדרך לחיים מלאי שמחה";
let stncList = [stnc1, stnc2, stnc3, stnc4, stnc5, stnc6, stnc7, stnc8, stnc9, stnc10, stnc11, stnc12, stnc13, stnc14, stnc15, stnc16, stnc17, stnc18, stnc19, stnc20, stnc21, stnc22, stnc23, stnc24, stnc25, stnc26, stnc27, stnc28, stnc29, stnc30, stnc31, stnc32, stnc33, stnc34, stnc35, stnc36, stnc37, stnc38, stnc39, stnc40, stnc41, stnc42, stnc43];

let max = parseInt(stncList.length);
let randomIndex = Math.floor(Math.random() * max);

let mainTitle = document.getElementById("mainTitle");
mainTitle.textContent = stncList[randomIndex];



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
