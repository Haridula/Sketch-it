import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="flex flex-col text-center w-full justify-center items-center min-h-screen">
        <h1 className="font-bold text-xl enlarge-step-text">Sketch it!</h1>
          <Link href="/sketch">
            <p className="text-2xl border rounded-sm mt-10 appear">
              try out
            </p>
          </Link>
      </div>
    </div>
  );
}

