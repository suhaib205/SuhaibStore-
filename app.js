import { initFirebase } from "./firebase.js";
import {
  collection, getDocs, orderBy, query
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const I18N = {
  ar: {
    dir: "rtl",
    search: "ابحث عن منتج...",
    allCats: "كل التصنيفات",
    price: "السعر",
    category: "التصنيف",
    whatsapp: "اطلب عبر واتساب",
    instagram: "تواصل إنستغرام",
    empty: "لا يوجد منتجات بعد.",
    needCfg: "⚠️ لازم تحط إعدادات Firebase داخل ملف firebase-config.js عشان تظهر المنتجات.",
  },
  en: {
    dir: "ltr",
    search: "Search products...",
    allCats: "All categories",
    price: "Price",
    category: "Category",
    whatsapp: "Order on WhatsApp",
    instagram: "Instagram",
    empty: "No products yet.",
    needCfg: "⚠️ Paste Firebase config in firebase-config.js to load products.",
  }
};

let lang = localStorage.getItem("lang") || "ar";

function $(id){ return document.getElementById(id); }

function buildWhatsAppLink(p){
  const msg = (lang==="ar")
    ? `مرحباً 👋\nبدي أطلب: ${p.title_ar || ""}\nالسعر: ${p.price || ""}\nالتصنيف: ${p.category || ""}`
    : `Hi 👋\nI want to order: ${p.title_en || ""}\nPrice: ${p.price || ""}\nCategory: ${p.category || ""}`;
  return `https://wa.me/${window.STORE.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

function setCategories(products){
  const sel = $("category");
  const cats = [...new Set(products.map(p => p.category || "General"))];
  sel.innerHTML = `<option value="all">${I18N[lang].allCats}</option>`;
  cats.forEach(c=>{
    const opt=document.createElement("option");
    opt.value=c; opt.textContent=c;
    sel.appendChild(opt);
  });
}

function render(products){
  document.documentElement.lang = lang;
  document.documentElement.dir = I18N[lang].dir;

  $("storeName").textContent = window.STORE.name;
  $("storeName2").textContent = window.STORE.name;
  $("tagline").textContent = (lang==="ar") ? window.STORE.tagline_ar : window.STORE.tagline_en;
  $("search").placeholder = I18N[lang].search;
  $("langBtn").textContent = (lang==="ar") ? "English" : "العربية";
  $("year").textContent = new Date().getFullYear();

  setCategories(products);

  const q = ($("search").value || "").toLowerCase();
  const cat = $("category").value;

  const filtered = products.filter(p=>{
    const name = (lang==="ar" ? (p.title_ar||"") : (p.title_en||""));
    const okQ = name.toLowerCase().includes(q) || (p.category||"").toLowerCase().includes(q);
    const okCat = (cat==="all") || (p.category===cat);
    return okQ && okCat;
  });

  const list = $("list");
  list.innerHTML = "";

  $("empty").style.display = filtered.length ? "none" : "block";
  $("empty").textContent = I18N[lang].empty;

  filtered.forEach(p=>{
    const card=document.createElement("div");
    card.className="card";
    const thumb=document.createElement("div");
    thumb.className="thumb";
    thumb.innerHTML = p.imageUrl
      ? `<img src="${p.imageUrl}" alt="">`
      : `<div class="hint">No Image</div>`;

    const content=document.createElement("div");
    content.className="content";
    content.innerHTML = `
      <div class="title">${lang==="ar" ? (p.title_ar||"") : (p.title_en||"")}</div>
      <div class="meta">
        <span><b>${I18N[lang].price}:</b> ${p.price||""}</span>
        <span>•</span>
        <span><b>${I18N[lang].category}:</b> ${p.category||""}</span>
      </div>
      ${p.featured ? `<span class="badge">Featured</span>` : ""}
    `;

    const actions=document.createElement("div");
    actions.className="actions";
    actions.innerHTML = `
      <a href="${buildWhatsAppLink(p)}" target="_blank" rel="noreferrer">${I18N[lang].whatsapp}</a>
      <a href="${window.STORE.instagramUrl}" target="_blank" rel="noreferrer">${I18N[lang].instagram}</a>
    `;

    card.appendChild(thumb);
    card.appendChild(content);
    card.appendChild(actions);
    list.appendChild(card);
  });
}

async function loadProducts(db){
  const col = collection(db, "products");
  const q = query(col, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({ id:d.id, ...d.data() }));
}

async function main(){
  const fb = initFirebase();

  $("firebaseHint").style.display = fb.ready ? "none" : "block";
  $("firebaseHint").textContent = I18N[lang].needCfg;

  let products = [];
  if (fb.ready){
    try { products = await loadProducts(fb.db); }
    catch(e){ console.error(e); }
  }
  render(products);

  $("langBtn").addEventListener("click", async ()=>{
    lang = (lang==="ar") ? "en" : "ar";
    localStorage.setItem("lang", lang);
    // reload products to re-render categories text
    if (fb.ready){
      try { products = await loadProducts(fb.db); } catch(e){}
    }
    render(products);
  });
  $("search").addEventListener("input", ()=>render(products));
  $("category").addEventListener("change", ()=>render(products));
}
main();
