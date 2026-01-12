const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();

const MAX_USER_BYTES = 1 * 1024 * 1024; // 1 MB
const MAX_GLOBAL_BYTES = 1024 * 1024 * 1024; // 1 GB

exports.storageLimiter = functions.storage.object().onFinalize(async (object) => {
  try {
    const filePath = object.name;
    const fileSize = Number(object.size || 0);
    const ip = object.metadata?.ip;  // <- correct

    // ---------- 1. GLOBAL LIMIT ----------
    const [allFiles] = await bucket.getFiles();
    let totalSize = 0;

    for (const file of allFiles) {
      totalSize += Number(file.metadata.size || 0);
    }

    if (totalSize > MAX_GLOBAL_BYTES) {
      console.log("GLOBAL LIMIT exceeded → deleting", filePath);
      await bucket.file(filePath).delete();
      return;
    }

    // ---------- 2. USER LIMIT ----------
    if (!ip) {
      console.log("Missing 'ip' metadata → deleting", filePath);
      await bucket.file(filePath).delete();
      return;
    }

    const userRef = db.collection("users").doc(ip);
    const statsRef = userRef.collection("storageStats").doc("usage");

    const statsSnap = await statsRef.get();
    const usedBytes = statsSnap.exists ? statsSnap.data().usedBytes : 0;

    if (usedBytes + fileSize > MAX_USER_BYTES) {
      console.log("USER LIMIT exceeded for:", ip);
      await bucket.file(filePath).delete();
      return;
    }

    await statsRef.set({ usedBytes: usedBytes + fileSize }, { merge: true });

    console.log("File accepted:", filePath);

  } catch (err) {
    console.error("Limiter Error:", err);
  }
});
