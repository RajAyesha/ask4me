import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Installation } from './components/Installation';
import { Footer } from './components/Footer';
import { LanguageProvider } from './LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-white overflow-x-hidden">
        <Header />
        <main className="flex-grow">
          <Hero />
          <Features />
          <Installation />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}