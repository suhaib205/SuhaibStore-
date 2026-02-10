# Suhaib Store (HTML + Firebase)

## 1) ارفع الملفات على GitHub (Root)
لازم تكون الملفات في root مثل:
- index.html
- admin.html
- styles.css
- app.js
- admin.js
- firebase.js
- firebase-config.js
- store-config.js
- logo.png

## 2) GitHub Pages
Settings -> Pages
Source: Deploy from a branch
Branch: main
Folder: / (root)

## 3) Firebase Setup
- Firestore Database (collection: products)
- Storage
- Authentication: Email/Password

### Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}

### Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}

## 4) Paste firebaseConfig
افتح firebase-config.js وحط قيم مشروعك.

## 5) Admin
افتح admin.html وسجل دخول بالأدمن اللي عملته في Firebase Auth.
