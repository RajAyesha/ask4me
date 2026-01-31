import React from 'react';
import { ArrowRight } from 'lucide-react';
import { DemoAnimation } from './DemoAnimation';
import { useLanguage } from '../LanguageContext';

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="demo" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {t.hero.version}
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            {t.hero.titleStart} <br className="hidden md:block" />
            <span className="text-emerald-400">{t.hero.titleHighlight}</span> {t.hero.titleEnd}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.hero.subtitle}
            <br/>
            <span className="text-slate-500 text-base">{t.hero.tags}</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#install" 
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold rounded-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {t.hero.getStarted} <ArrowRight size={18} />
            </a>
            <a 
              href="https://github.com/easychen/ask4me"
              target="_blank"
              rel="noreferrer" 
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              {t.hero.viewGithub}
            </a>
          </div>
        </div>

        {/* The Core Interactive Demo */}
        <div className="mt-16 relative">
          <DemoAnimation />
        </div>
      </div>
    </section>
  );
};