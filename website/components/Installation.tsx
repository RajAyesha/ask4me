import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export const Installation: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const { t } = useLanguage();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ id, label, command }: { id: string, label: string, command: string }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-400">{label}</span>
      </div>
      <div className="relative group">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm text-emerald-400 overflow-x-auto custom-scrollbar">
          {command}
        </div>
        <button 
          onClick={() => copyToClipboard(command, id)}
          className="absolute right-3 top-3 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md opacity-0 group-hover:opacity-100 transition-all border border-slate-700"
          aria-label="Copy command"
        >
          {copied === id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <section id="install" className="py-24 bg-slate-950 relative overflow-hidden">
        {/* Background blobs */}
      <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-emerald-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t.install.titleStart} <span className="text-emerald-400">{t.install.titleHighlight}</span>
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              {t.install.desc}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 font-bold text-emerald-400">1</div>
                <div>
                  <h4 className="font-semibold text-white">{t.install.steps[0].title}</h4>
                  <p className="text-slate-500 text-sm mt-1">{t.install.steps[0].desc}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 font-bold text-emerald-400">2</div>
                <div>
                  <h4 className="font-semibold text-white">{t.install.steps[1].title}</h4>
                  <p className="text-slate-500 text-sm mt-1">{t.install.steps[1].desc}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 font-bold text-emerald-400">3</div>
                <div>
                  <h4 className="font-semibold text-white">{t.install.steps[2].title}</h4>
                  <p className="text-slate-500 text-sm mt-1">{t.install.steps[2].desc}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl">
            <CodeBlock 
              id="install-cmd" 
              label={t.install.cmdInstall}
              command="npm install -g ask4me-server" 
            />
            <CodeBlock 
              id="run-cmd" 
              label={t.install.cmdRun}
              command="ask4me-server" 
            />
            <CodeBlock 
              id="curl-cmd" 
              label={t.install.cmdTest}
              command={`curl -X POST http://localhost:8080/v1/ask \\
  -H 'Authorization: Bearer YOUR_KEY' \\
  -d '{"title":"Test","body":"Hello World","mcd":":::buttons\\n- [OK](ok)\\n:::"}'`} 
            />
          </div>

        </div>
      </div>
    </section>
  );
};