"use client";

import { useRef, useEffect, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "../firebaseСonfig";
import axios from "axios";

export default function Canvas() {
    // IP fetching code
    const [ip, setIP] = useState("");
    const getData = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    setIP(res.data.ip);
  };

  useEffect(() => {
    getData();
  }, []);

    const saveImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
    if (!blob) return;

    // Create a unique filename
    const filename = `drawing-${ip}-${Date.now()}.png`;
    const storageRef = ref(storage, filename);

    // Upload blob
    await uploadBytes(storageRef, blob);

    // Get public URL
    const url = await getDownloadURL(storageRef);

    // Save URL to Firestore
    await addDoc(collection(db, "sketches"), {
      imageUrl: url,
      createdAt: serverTimestamp(),
    });

    alert("Saved to Firestore!");
  });
};

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerWidth * 0.4;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
