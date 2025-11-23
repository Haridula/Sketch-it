"use client";

import { useRef, useEffect, useState } from "react";
import axios from "axios";
import {ref, uploadBytes, getDownloadURL, deleteObject, getMetadata, } from "firebase/storage";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, } from "firebase/firestore";
import { storage, db } from "../firebaseСonfig";

export default function Canvas() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ip, setIP] = useState("");

  const getIP = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    setIP(res.data.ip);
  };

  useEffect(() => {
    getIP();
  }, []);

  async function deleteImage(path, ip) {
    try {
      const fileRef = ref(storage, path);

      // File size from metadata
      const metadata = await getMetadata(fileRef);
      const size = metadata.size;

      // Delete from storage
      await deleteObject(fileRef);

      // Subtract from Firestore usage
      const statsRef = doc(db, "users", ip, "storageStats", "usage");
      await updateDoc(statsRef, {
        usedBytes: increment(-size),
      });

      console.log("Deleted:", path);
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  const saveImage = async () => {
    if (!ip) {
      alert("try again in a moment.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;

        const filename = `drawing-${ip}-${Date.now()}.png`;
        const path = `drawings/${ip}/${filename}`;

        const storageRef = ref(storage, path);

        // Upload with IP metadata (needed for Cloud Function limit checks)
        await uploadBytes(storageRef, blob, {
          customMetadata: { ip },
        });

        // URL for Firestore record
        const url = await getDownloadURL(storageRef);

        // Save the record
        await addDoc(collection(db, "sketches"), {
          imageUrl: url,
          ip: ip,
          storagePath: path,
          createdAt: serverTimestamp(),
        });

        alert("Saved to Firestore.");
      },
      "image/png",
      1.0
    );
  };
  
  // Canvas Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerWidth * 0.4;

    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
  }, []);

  const startDrawing = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="border bg-gray-300 rounded"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      <button onClick={saveImage}>Save</button>
    </>
  );
}