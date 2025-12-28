'use client'

import Image from "next/image";
import React from 'react'
import { useState } from 'react';
import Canvas from '../../components/Canvas'

export default function Sketch() {
  const [drawing, setDrawing] = useState(0);
  return (
    <div>
      <div className="mb-16 w-full relative flex justify-center items-center">
      {drawing === 0 ?<button className="mt-6 border rounded" onClick={() => setDrawing(1)}><p className="mx-12 mt-1 mb-1 text-xl">sketch</p></button> : <></>}
      <br className="border"/>
      </div>
      {drawing === 1 ? <Canvas /> : <></>}
      <div className={`${drawing === 1 ? 'blur ' : ''} grid justify-items-center grid-cols-1 md:grid-cols-4 gap-12 gap-x-32 p-4`}>
        <Image
          alt="example sketch"
          src="https://firebasestorage.googleapis.com/v0/b/sketchit-f5079.firebasestorage.app/o/sketches%2F80.235.68.17%2Fsketch-80.235.68.17-1766936458855.png?alt=media&token=61286fba-6095-4222-942d-8181162f86a5"
          width={400}
          height={400}
        />
      </div>
    </div>
  )
}