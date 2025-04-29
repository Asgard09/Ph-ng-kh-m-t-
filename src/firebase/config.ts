import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "@/config";

// Log các biến môi trường Firebase để kiểm tra (chỉ hiển thị có hay không, không hiển thị giá trị thực)
console.log("Firebase config available:", {
  apiKey: !!firebaseConfig.apiKey,
  authDomain: !!firebaseConfig.authDomain,
  projectId: !!firebaseConfig.projectId,
  storageBucket: !!firebaseConfig.storageBucket,
  messagingSenderId: !!firebaseConfig.messagingSenderId,
  appId: !!firebaseConfig.appId,
});

// Kiểm tra xem có đủ thông tin cấu hình không
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Firebase configuration is missing or incomplete. Check your .env.local file or config.ts."
  );
}

// Khởi tạo Firebase
let app;
let auth;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized:", app.name);

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Export các dịch vụ Firebase
export { auth, db, storage };
