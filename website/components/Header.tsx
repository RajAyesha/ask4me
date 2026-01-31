import React, { useState, useEffect } from 'react';
import { Github, BookOpen, Globe } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-slate-950/80 backdrop-blur-md border-slate-800 py-3' 
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-slate-900 text-lg">A</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Ask4Me</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#demo" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">{t.nav.demo}</a>
          <a href="#features" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">{t.nav.features}</a>
          <a href="#install" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors">{t.nav.install}</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-medium border border-transparent hover:border-slate-700"
          >
            <Globe size={14} />
            <span>{language === 'en' ? '中文' : 'EN'}</span>
          </button>
          
          <a 
            href="https://github.com/easychen/ask4me" 
            target="_blank" 
            rel="noreferrer"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            aria-label="GitHub"
          >
            <Github size={20} />
          </a>
          <a 
            href="https://github.com/easychen/ask4me/blob/main/README.md"
            target="_blank"
            rel="noreferrer" 
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-sm font-medium transition-colors"
          >
            <BookOpen size={16} />
            <span>{t.nav.docs}</span>
          </a>
        </div>
      </div>
    </header>
  );
};