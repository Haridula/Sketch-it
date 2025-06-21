import localFont from "next/font/local";
import "../styles/globals.css"
import Loader from "../components/Loader";

const Hack = localFont({
  src: '../public/fonts/Hack-Regular.ttf',
})

export const metadata = {
  title: "Sketch it!",
  description: "Share your sketches with the world!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={Hack.className}>
      <body className="text-text text-main bg-background">
        <Loader />
        {children}
      </body>
    </html>
  );
}
