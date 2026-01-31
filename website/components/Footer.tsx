import React from 'react';
import { Github, Twitter, Heart } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded flex items-center justify-center">
                <span className="font-bold text-slate-900 text-xs">A</span>
             </div>
             <span className="font-bold text-lg tracking-tight text-slate-200">Ask4Me</span>
          </div>

          <div className="text-slate-500 text-sm flex items-center gap-1">
            {t.footer.madeWith} <Heart size={14} className="text-red-500 fill-red-500" /> {t.footer.by}
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/easychen/ask4me" className="text-slate-500 hover:text-white transition-colors" target="_blank" rel="noreferrer">
              <Github size={20} />
            </a>
            <a href="https://x.com/easychen" className="text-slate-500 hover:text-white transition-colors" target="_blank" rel="noreferrer">
              <Twitter size={20} />
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
};