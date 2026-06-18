import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzHEk5DEroyzeY3d9AXrO9bVIB6UVF9kA",
  authDomain: "pagneshop-pro.firebaseapp.com",
  projectId: "pagneshop-pro",
  storageBucket: "pagneshop-pro.firebasestorage.app",
  messagingSenderId: "1042325494682",
  appId: "1:1042325494682:web:9ecc14f5ba50bbce23f823"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Exposer les variables globales pour utilisation dans le code HTML
window.auth = auth;
window.db = db;
window.provider = provider;
window.signInWithPopup = signInWithPopup;
window.setDoc = setDoc;
window.doc = doc;

// 🔵 STATE LOGIN
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("CONNECTÉ", user);
  } else {
    console.log("Déconnecté");
  }
});

// 🔵 GOOGLE LOGIN
window.googleLogin = async function () {
  if(!window.auth || !window.provider || !window.signInWithPopup){
    return alert('Firebase n’est pas prêt. Rafraîchissez la page ou vérifiez la configuration.');
  }
  // S and re() peuvent être définis plus loin dans le fichier HTML ; protéger l'accès
  try{ if(window.S){ S.authLoading = true; if(window.re) re(); } }catch(e){}
  try {
    console.log("Début de googleLogin...");
    const result = await signInWithPopup(window.auth, window.provider);
    const user = result.user;

    console.log("USER LOGIN OK", user);

    try{
      await setDoc(doc(window.db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        createdAt: Date.now()
      });
    }catch(e){console.warn('setDoc error',e)}

    const dataEmail = {
        title: "Nouvelle connexion Google sur YOLANDE.SHOP",
        name: user.displayName || "Utilisateur Google",
        email: user.email,
        message: `L'utilisateur s'est connecté avec succès via Google.\nID unique : ${user.uid}`
    };

    if(window.emailjs){
      emailjs.send("service_osm7s82", "template_9gq0nig", dataEmail)
      .then(() => {
          console.log("Notification Gmail envoyée avec succès !");
      })
      .catch((err) => {
          console.error("Erreur d'envoi EmailJS :", err);
      });
    }

    if(window.S){
      S.user = {
        uid: user.uid,
        name: user.displayName || "Utilisateur",
        email: user.email,
        phone: "",
        provider: "google"
      };

      if(window.finishAuth) finishAuth(S.user, 'login');
    }

  } catch (e) {
    console.error("Erreur Google Login:", e);
    if (e.code === 'auth/popup-closed-by-user') {
      if(window.showToast) showToast('Popup Google fermée. Réessayez si vous n’avez pas terminé la connexion.', 'info');
    } else if (e.code === 'auth/popup-blocked') {
      if(window.showToast) showToast('Le popup Google a été bloqué. Autorisez les popups puis réessayez.', 'error');
    } else {
      alert("Erreur : " + e.message);
    }
  } finally {
    try{ if(window.S){ S.authLoading = false; if(window.re) re(); } }catch(e){}
  }
};

// GSAP animations (progressive enhancement)
function initHeroAnimations(){
  const run = () => {
    try{
      if(window.gsap){
        const gs = window.gsap;
        gs.from(".hero-title",{y:40,opacity:0,duration:1,ease:"power3.out"});
        gs.from(".hero-sub",{y:20,opacity:0,duration:0.9,delay:0.2,ease:"power3.out"});
        gs.from(".hero-ctas a",{y:12,opacity:0,duration:0.8,delay:0.4,stagger:0.12,ease:"power3.out"});
      }
    }catch(e){console.warn('GSAP init failed',e)}
  };
  if(document.readyState!=='loading') run(); else document.addEventListener('DOMContentLoaded', run);
}
function enableHeroVideoFallback(){
  const heroVideo = document.getElementById('hero-video');
  const heroSection = document.getElementById('hero');
  if(!heroVideo || !heroSection) return;
  heroVideo.addEventListener('error', () => {
    heroSection.classList.add('video-fallback');
  });
  heroVideo.addEventListener('stalled', () => {
    heroSection.classList.add('video-fallback');
  });
  heroVideo.addEventListener('emptied', () => {
    heroSection.classList.add('video-fallback');
  });
}

initHeroAnimations();
enableHeroVideoFallback();
