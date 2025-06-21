'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  useEffect(() => {
    const audio = document.getElementById("my_audio");
    if (audio) {
      audio.play();
    }
  }, []);

  return (
    <div className="h-screen flex justify-center items-center grid-cols-3 gap-40">
      <div>
        <Image
          src='/images/tree1.png'
          alt='Hero Image'
          width={600}
          height={600}
          className='max-sm:hidden max-md:hidden appear'
        />
      </div>
      <div className="text-center h-full items-center flex flex-col min-h-screen justify-center">
        <div className="flex-wrap">
          <h1 className="font-bold text-xl enlarge-step-text enlarge">
            <p1 className='appear-text'>Sketch</p1> <p2 className='appear-text1'>it!</p2>
          </h1>
          <Link href="/sketch">
            <p className="text-4xl border rounded-sm mt-14 appear">
              try out
            </p>
          </Link>
        </div>
        <Image
          src='/images/tree2.png'
          alt='Hero Image'
          width={350}
          height={350}
          className='mt-40 appear'
        />
      </div>
      <div>
        <Image
          src='/images/tree3.png'
          alt=''
          width={600}
          height={600}
          className='max-sm:hidden max-md:hidden appear'
        />
      </div>
      <audio id="my_audio" src="/audio/sketchit.ogg"></audio>
    </div>
  );
}