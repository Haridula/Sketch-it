'use client'

import Image from "next/image";
import React from 'react'
import { useState, useEffect } from 'react';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebaseConfig';
import Canvas from '../../components/Canvas'

export default function Sketch() {
  const [drawing, setDrawing] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(12);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const listRef = ref(storage, 'sketches');
        const res = await listAll(listRef);
        
        // Get all files from subdirectories (IP folders)
        const imageUrls = [];
        
        for (const folder of res.prefixes) {
          const folderContents = await listAll(folder);
          const urls = await Promise.all(
            folderContents.items.map(item => getDownloadURL(item))
          );
          imageUrls.push(...urls);
        }
        
        // Shuffle the array
        for (let i = imageUrls.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [imageUrls[i], imageUrls[j]] = [imageUrls[j], imageUrls[i]];
        }
        
        setImages(imageUrls);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 600) {
        setDisplayCount(prev => prev + 12);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      <div className="mb-16 w-full relative flex justify-center items-center">
      {drawing === 0 ?<button className="mt-6 border rounded w-64" onClick={() => setDrawing(1)}><p className="mx- mt-1 mb-1 text-xl">sketch</p></button> : <></>}
      <br className="border"/>
      </div>
      {drawing === 1 ? <div className="fixed inset-0 flex items-center justify-center z-50"><Canvas drawing={drawing} setDrawing={setDrawing} /></div> : <></>}
      <div className={`${drawing === 1 ? 'blur non-interactive' : ''} grid justify-items-center grid-cols-1 md:grid-cols-4 gap-12 gap-x-8 p-4`}>
        {loading ? (
          <p>Loading images...</p>
        ) : images.length > 0 ? (
          images.slice(0, displayCount).map((url, index) => (
            <Image
              key={index}
              alt={`sketch ${index}`}
              src={url}
              width={400}
              height={400}
              className="border border-main rounded"
            />
          ))
        ) : (
          <p>No images uploaded</p>
        )}
      </div>
    </div>
  )
}