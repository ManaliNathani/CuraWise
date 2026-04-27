import "./globals.css";
import type { ReactNode } from "react";
// import ThreeBackground from "./components/ThreeBackground";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata = {
  title: "CuraWise",
  description: "AI-Based Symptom Checker and Hospital Recommendation System"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
        <body className="min-h-screen bg-paper text-ink flex flex-col">
          <Header />
        <div className="relative z-20 flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
