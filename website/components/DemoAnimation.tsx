import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Smartphone, Server, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

enum Step {
  Idle = 0,
  Sending = 1,
  Pending = 2,
  Notified = 3,
  Action = 4,
  Response = 5
}

export const DemoAnimation: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Idle);
  const { t } = useLanguage();

  useEffect(() => {
    const sequence = async () => {
      // Loop forever
      while (true) {
        setStep(Step.Idle);
        await new Promise(r => setTimeout(r, 1000));
        
        // 1. Curl Request Starts
        setStep(Step.Sending);
        await new Promise(r => setTimeout(r, 1500));
        
        // 2. Server Processes
        setStep(Step.Pending);
        await new Promise(r => setTimeout(r, 800));
        
        // 3. Notification Arrives on Phone
        setStep(Step.Notified);
        await new Promise(r => setTimeout(r, 1500));
        
        // 4. User Clicks Action
        setStep(Step.Action);
        await new Promise(r => setTimeout(r, 1000));
        
        // 5. Response goes back
        setStep(Step.Response);
        await new Promise(r => setTimeout(r, 4000));
      }
    };
    sequence();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center min-h-[400px]">
        
        {/* LEFT: Terminal / Source */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 text-slate-400">
            <Terminal size={20} />
            <span className="font-semibold text-sm tracking-wider">CLIENT / TERMINAL</span>
          </div>
          <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs md:text-sm shadow-2xl relative overflow-hidden">
            <div className="flex gap-1.5 mb-4 border-b border-slate-800 pb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
            </div>
            
            <div className="text-slate-300">
              <span className="text-emerald-400 mr-2">$</span>
              curl -X POST /ask \<br/>
              &nbsp;&nbsp;-d '&#123;"title": "Deploy?",<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"mcd": ":::buttons..."&#125;'
            </div>

            <AnimatePresence mode="wait">
              {step >= Step.Sending && step < Step.Response && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-slate-500 flex items-center gap-2"
                >
                  <Loader2 className="animate-spin" size={14} />
                  {t.hero.demo.waiting}
                </motion.div>
              )}
              {step === Step.Response && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-slate-800 text-emerald-400"
                >
                  &#123;<br/>
                  &nbsp;&nbsp;"status": "user.submitted",<br/>
                  &nbsp;&nbsp;"data": &#123; "action": "ok" &#125;<br/>
                  &#125;
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CENTER: Server & Flow Visualization */}
        <div className="relative flex flex-col items-center justify-center h-full min-h-[200px]">
          
          {/* Animated connection lines (simplified for responsiveness) */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 hidden lg:block" />
          
          {/* Packet: Client -> Server */}
          {step === Step.Sending && (
            <motion.div 
              layoutId="packet-right"
              className="absolute hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-20"
              initial={{ left: '0%', top: '50%', y: '-50%', opacity: 0 }}
              animate={{ left: '50%', opacity: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              <Send size={14} className="text-slate-900" />
            </motion.div>
          )}

          {/* Packet: Server -> Phone */}
          {step === Step.Pending && (
            <motion.div 
              layoutId="packet-right-2"
              className="absolute hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20"
              initial={{ left: '50%', top: '50%', y: '-50%' }}
              animate={{ left: '100%', opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Send size={14} className="text-white" />
            </motion.div>
          )}

           {/* Packet: Phone -> Server -> Client */}
           {step === Step.Action && (
            <motion.div 
              layoutId="packet-left"
              className="absolute hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)] z-20"
              initial={{ left: '100%', top: '50%', y: '-50%' }}
              animate={{ left: '0%' }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <CheckCircle2 size={16} className="text-slate-900" />
            </motion.div>
          )}

          {/* Central Server Icon */}
          <div className={`relative z-10 w-24 h-24 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${
            [Step.Pending, Step.Notified, Step.Action].includes(step)
              ? 'bg-slate-800 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
              : 'bg-slate-900 border-slate-700'
          }`}>
            <Server size={40} className={
               [Step.Pending, Step.Notified, Step.Action].includes(step) ? "text-emerald-400" : "text-slate-600"
            } />
            <div className="absolute -bottom-8 text-xs font-mono text-slate-500">ASK4ME SERVER</div>
            
            {/* Status Indicator */}
            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
              step !== Step.Idle ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'
            }`} />
          </div>

          {/* Mobile connecting lines for vertical layout */}
          <motion.div 
            className="lg:hidden w-0.5 bg-gradient-to-b from-slate-800 via-emerald-500 to-slate-800 h-24 my-4"
            animate={{ 
              opacity: step !== Step.Idle ? 1 : 0.2,
              height: step !== Step.Idle ? 96 : 40 
            }}
          />
        </div>

        {/* RIGHT: User / Phone */}
        <div className="relative z-10 flex justify-center lg:justify-end">
          <div className="flex flex-col items-center lg:items-end">
             <div className="flex items-center gap-2 mb-3 text-slate-400 w-full lg:justify-end">
              <Smartphone size={20} />
              <span className="font-semibold text-sm tracking-wider">YOUR PHONE</span>
            </div>

            {/* Phone Bezel */}
            <div className={`relative w-[280px] bg-slate-900 rounded-[2rem] border-4 border-slate-800 shadow-2xl overflow-hidden transition-all duration-500 ${
              step === Step.Notified ? 'ring-4 ring-blue-500/30 -translate-y-2' : ''
            }`}>
              {/* Phone Status Bar */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20" />
              
              {/* Phone Screen */}
              <div className="h-[400px] bg-slate-950 p-4 pt-10 flex flex-col relative">
                
                {/* Notification Banner */}
                <AnimatePresence>
                  {step >= Step.Notified && step < Step.Response && (
                    <motion.div 
                      initial={{ y: -100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -100, opacity: 0 }}
                      className="bg-slate-800/90 backdrop-blur p-3 rounded-xl mb-4 border border-slate-700 shadow-lg cursor-pointer"
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                          <span className="font-bold text-white">A</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-200">{t.hero.demo.notificationTitle}</h4>
                          <p className="text-xs text-slate-400">{t.hero.demo.notificationBody}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main App UI (Simulated Browser) */}
                <AnimatePresence>
                  {step >= Step.Notified && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex flex-col"
                    >
                      <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <h3 className="font-bold text-lg text-white mb-2">{t.hero.demo.appTitle}</h3>
                        <p className="text-sm text-slate-400 mb-6">{t.hero.demo.appBody}</p>
                        
                        {step === Step.Action || step === Step.Response ? (
                          <div className="w-full py-3 bg-emerald-500/20 text-emerald-400 rounded-lg font-medium text-center border border-emerald-500/50 flex items-center justify-center gap-2">
                            <CheckCircle2 size={18} />
                            {t.hero.demo.submitted}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20">
                              {t.hero.demo.buttonApprove}
                            </button>
                            <button className="w-full py-3 bg-slate-800 text-slate-400 rounded-lg font-medium border border-slate-700">
                              {t.hero.demo.buttonReject}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Idle State for Phone */}
                {step < Step.Notified && (
                  <div className="flex-1 flex items-center justify-center text-slate-700">
                    <div className="text-center">
                      <div className="w-16 h-1 bg-slate-800 rounded mx-auto mb-2" />
                      <div className="text-xs">{t.hero.demo.phoneWaiting}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="absolute bottom-4 left-0 w-full text-center text-xs text-slate-600 font-mono uppercase tracking-widest">
        {step === Step.Idle && t.hero.demo.systemReady}
        {step === Step.Sending && t.hero.demo.sending}
        {step === Step.Pending && t.hero.demo.waitingUser}
        {step === Step.Notified && t.hero.demo.notified}
        {step === Step.Action && t.hero.demo.interacting}
        {step === Step.Response && t.hero.demo.responseDelivered}
      </div>
    </div>
  );
};