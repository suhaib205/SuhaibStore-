// Firebase v9 (modular) via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

export function initFirebase(){
  const cfg = window.FIREBASE_CONFIG || {};
  const notReady = !cfg.apiKey || cfg.apiKey === "PASTE_HERE";
  if (notReady){
    console.warn("Firebase config not set yet. Site will show empty products until you paste config.");
    return { app:null, db:null, auth:null, storage:null, ready:false };
  }
  const app = initializeApp(cfg);
  return { app, db:getFirestore(app), auth:getAuth(app), storage:getStorage(app), ready:true };
}
