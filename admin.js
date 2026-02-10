import { initFirebase } from "./firebase.js";
import {
  signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  collection, addDoc, serverTimestamp, getDocs, orderBy, query, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

function $(id){ return document.getElementById(id); }

const fb = initFirebase();

function showNeedCfg(){
  $("needCfg").style.display = "block";
  $("needCfg").innerHTML = `
    <b>⚠️ Firebase غير جاهز</b><br/>
    لازم تحط firebaseConfig في ملف <code>firebase-config.js</code> داخل GitHub.<br/>
    بعد ما تحطه اعمل Refresh.
  `;
}

async function loadProducts(){
  const col = collection(fb.db, "products");
  const q = query(col, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({ id:d.id, ...d.data() }));
}

function renderProducts(items){
  const wrap = $("products");
  wrap.innerHTML = "";
  items.forEach(p=>{
    const card = document.createElement("div");
    card.className = "card";
    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.innerHTML = p.imageUrl ? `<img src="${p.imageUrl}" alt="">` : `<div class="hint">No Image</div>`;
    const content = document.createElement("div");
    content.className = "content";
    content.innerHTML = `
      <div class="title">${p.title_ar || ""} / ${p.title_en || ""}</div>
      <div class="meta"><span><b>السعر:</b> ${p.price||""}</span><span>•</span><span><b>التصنيف:</b> ${p.category||""}</span></div>
      ${p.featured ? `<span class="badge">Featured</span>` : ""}
      <button data-id="${p.id}" style="margin-top:10px;">حذف</button>
    `;
    content.querySelector("button").addEventListener("click", async ()=>{
      if (!confirm("متأكد حذف المنتج؟")) return;
      await deleteDoc(doc(fb.db, "products", p.id));
      const next = await loadProducts();
      renderProducts(next);
    });

    card.appendChild(thumb);
    card.appendChild(content);
    wrap.appendChild(card);
  });
}

async function uploadImage(file){
  if (!file) return "";
  const safeName = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g,"_");
  const storageRef = ref(fb.storage, `products/${safeName}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

async function refreshList(){
  const items = await loadProducts();
  renderProducts(items);
}

function setupAuthUI(){
  $("loginBtn").addEventListener("click", async ()=>{
    $("loginStatus").textContent = "جارٍ الدخول...";
    try{
      await signInWithEmailAndPassword(fb.auth, $("email").value, $("password").value);
      $("loginStatus").textContent = "✅ تم";
    }catch(e){
      $("loginStatus").textContent = "❌ خطأ: " + (e?.message || "login failed");
    }
  });

  $("logoutBtn").addEventListener("click", async ()=>{
    await signOut(fb.auth);
  });

  onAuthStateChanged(fb.auth, async (user)=>{
    const logged = !!user;
    $("loginBox").style.display = logged ? "none" : "block";
    $("adminBox").style.display = logged ? "block" : "none";
    $("logoutBtn").style.display = logged ? "inline-block" : "none";
    if (logged){
      await refreshList();
    }
  });
}

function setupForm(){
  $("form").addEventListener("submit", async (e)=>{
    e.preventDefault();
    $("status").textContent = "Saving...";
    try{
      const file = $("image").files?.[0] || null;
      const imageUrl = await uploadImage(file);

      await addDoc(collection(fb.db, "products"), {
        title_ar: $("title_ar").value.trim(),
        title_en: $("title_en").value.trim(),
        desc_ar: $("desc_ar").value.trim(),
        desc_en: $("desc_en").value.trim(),
        price: $("price").value.trim(),
        category: ($("category").value.trim() || "General"),
        featured: $("featured").checked,
        imageUrl,
        createdAt: serverTimestamp()
      });

      $("status").textContent = "✅ Saved";
      e.target.reset();
      await refreshList();
    }catch(err){
      console.error(err);
      $("status").textContent = "❌ " + (err?.message || "Failed");
    }
  });
}

function main(){
  if (!fb.ready){
    showNeedCfg();
    return;
  }
  setupAuthUI();
  setupForm();
}
main();
