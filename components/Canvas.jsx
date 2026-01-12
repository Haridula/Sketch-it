"use client";

import { useRef, useEffect, useState } from "react";
import axios from "axios";
import {ref, uploadBytes, getDownloadURL, deleteObject, getMetadata, } from "firebase/storage";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, } from "firebase/firestore";
import { storage, db } from "../firebaseConfig";

export default function Canvas({ drawing, setDrawing }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ip, setIP] = useState("");
  const [isEraser, setIsEraser] = useState(false);
  let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // History for undo/redo: stores dataURLs
  const historyRef = useRef([]);
  const historyIndexRef = useRef(0);

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Convert canvas to blob
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;

        const filename = `sketch-${ip}-${Date.now()}.png`;
        const path = `sketches/${ip}/${filename}`;

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
        setDrawing(0);
        alert("Success :)");
        location.reload(); 
      },
      "image/png",
      1.0
    );
  };
  
  // Canvas Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isMobile) {
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerWidth * 0.8;
    } else {
      canvas.width = window.innerWidth * 0.45;
      canvas.height = window.innerWidth * 0.4;
    }
    
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#cdd6f4";

    // Push initial blank state into history
    try {
      historyRef.current = [];
      historyIndexRef.current = -1;
      pushHistory();
    } catch (err) {
      console.error("History init error:", err);
    }
  }, []);

  // Save state after drawing completes
  const saveDrawingState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL();

    // If we undid some steps and draw again, drop future states
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(data);
    historyIndexRef.current = historyRef.current.length - 1;
  };

  const pushHistory = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const data = canvas.toDataURL();

  historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
  historyRef.current.push(data);
  historyIndexRef.current = historyRef.current.length - 1;
};

  // Get coordinates for mouse or touch events relative to the canvas
  const getCoords = (evt) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Touch event
    if (evt.touches && evt.touches[0]) {
      return {
        x: evt.touches[0].clientX - rect.left,
        y: evt.touches[0].clientY - rect.top,
      };
    }

    // Mouse event (React synthetic)
    if (evt.nativeEvent && typeof evt.nativeEvent.offsetX === "number") {
      return { x: evt.nativeEvent.offsetX, y: evt.nativeEvent.offsetY };
    }

    // Fallback using clientX/Y
    if (typeof evt.clientX === "number") {
      return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    }

    return { x: 0, y: 0 };
  };

  const restoreFromDataURL = (dataURL) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      // clear then draw image stretched to canvas size
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = dataURL;
  };

  const startDrawing = (e) => {
    const ctx = canvasRef.current.getContext("2d");

    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  // drawing/erasing logic
  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 20;
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#cdd6f4";
    }

    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Touch handlers that delegate to mouse handlers (prevent scrolling)
  const handleTouchStart = (e) => {
    e.preventDefault();
    startDrawing(e);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    draw(e);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopDrawing();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveDrawingState();
  };

  // undo/redo functions
  const undo = () => {
    if (historyIndexRef.current === 0) {
      return;
    }

    historyIndexRef.current -= 1;
    restoreFromDataURL(historyRef.current[historyIndexRef.current]);
  };

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const data = historyRef.current[historyIndexRef.current];
    if (data) restoreFromDataURL(data);
  };

  const toggleEraser = () => setIsEraser((s) => !s);
  return (
    <div>
      <div className="mb-2 flex">
        <div/>
        <button className="border rounded ml-auto" onClick={() => setDrawing(0)}><p className="mx-2">x</p></button>
      </div>
      <canvas
        ref={canvasRef}
        className="border rounded"
        style={{ touchAction: "none" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      <div className="flex mt-2">
        <button className="border rounded mr-4" onClick={undo}>
          <p className="mx-3 text-2xl">←</p>
        </button>
        <button className="border rounded ml-2 mr-6" onClick={redo}>
          <p className="mx-3 text-2xl">→</p>
        </button>
        <button className="border rounded mx-4" onClick={toggleEraser}>
          <p className="mx-1">{isEraser ? "Mode: Erase" : "Mode: Draw"}</p>
        </button>
        <button className="border rounded ml-auto" onClick={saveImage}>
          <p className="mx-1">Save</p>
        </button>
      </div>
    </div>
  );
}