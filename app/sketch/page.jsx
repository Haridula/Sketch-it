'use client'

import Image from "next/image";
import React from 'react'
import Canvas from '../../components/Canvas'

export default function Sketch() {
  return (
    <div>
      <div></div>
      <Image
        alt="example sketch"
        src="https://firebasestorage.googleapis.com/v0/b/sketchit-f5079.firebasestorage.app/o/drawing-1763853078205.png?alt=media&token=ab12e39e-6a09-47fe-93f1-02a4b0bda58c"
        width={400}
        height={400}
      />
    </div>
  )
}