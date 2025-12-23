'use client';

import { useEffect } from "react";
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
    <div className="flex items-center justify-between h-screen">
      <Image
        src='/images/tree1.png'
        width={600}
        height={600}
        alt="tree"
        className="hidden md:block appear"
      />
      <div className="h-64 items-center text-center gap-y-5 flex-col flex max-sm:hidden max-md:hidden">
      <h1 className="font-bold text-xl enlarge-step-text enlarge">
        <span className="appear-text">Sketch</span> <span className="appear-text1">it!</span>
      </h1>
      <Link href="/sketch">
        <h1 className="text-4xl border rounded-sm mt-9 appear">
          <p className="mx-1 mt-1 mb-1">try out</p>
        </h1>
      </Link>
      <Image
        alt=""
        src='/images/tree2.png'
        width={300}
        height={300}
        className="appear mt-64"
      />
      </div>

      {/* Mobile */}
      <div className="h-64 items-center gap-y-5 flex flex-col min-w-full md:hidden">
      <h1 className="font-bold text-sm enlarge-step-text enlarge">
        <span className="appear-text">Sketch</span> <span className="appear-text1">it!</span>
      </h1>
      <Link className="text-4xl border rounded-sm mt-4 appear" href="/sketch">
        <p className="text-2xl">try out</p>
      </Link>
      <Image
        alt=""
        src='/images/tree2.png'
        width={300}
        height={300}
        className="appear mt-32"
      />
      </div>
      <Image
        src='/images/tree3.png'
        width={600}
        height={600}
        alt="tree"
        className="hidden md:block appear"
      />
      <audio id="my_audio" src="/audio/sketchit.ogg"/>
    </div>
  );
}