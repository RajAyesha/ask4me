import React from 'react';
import { 
  Zap, 
  Share2, 
  Radio, 
  RefreshCcw, 
  Github, 
  Download
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-800/50 transition-all duration-300 group">
    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export const Features: React.FC = () => {
  const { t } = useLanguage();

  const featuresList = [
    {
      icon: <Zap size={24} />,
      title: t.features.cards[0].title,
      description: t.features.cards[0].desc
    },
    {
      icon: <Share2 size={24} />,
      title: t.features.cards[1].title,
      description: t.features.cards[1].desc
    },
    {
      icon: <Radio size={24} />,
      title: t.features.cards[2].title,
      description: t.features.cards[2].desc
    },
    {
      icon: <RefreshCcw size={24} />,
      title: t.features.cards[3].title,
      description: t.features.cards[3].desc
    },
    {
      icon: <Github size={24} />,
      title: t.features.cards[4].title,
      description: t.features.cards[4].desc
    },
    {
      icon: <Download size={24} />,
      title: t.features.cards[5].title,
      description: t.features.cards[5].desc
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-950 relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.features.title}</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};