'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPageContent, PageContent } from '@/lib/database';

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

export default function Stats() {
  const [trainings, setTrainings] = useState(0);
  const [beneficiaries, setBeneficiaries] = useState(0);
  const [partners, setPartners] = useState(0);
  const [targetTrainings, setTargetTrainings] = useState(38);
  const [targetBeneficiaries, setTargetBeneficiaries] = useState(760);
  const [targetPartners, setTargetPartners] = useState(25);
  const [sectionTitle, setSectionTitle] = useState('');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { language, t } = useLanguage();

  const loadContent = async () => {
    const content = await getPageContent('home');
    if (content) {
      // Find the impact section
      const impactSection = content.sections.find(section => section.id === 'impact');
      if (impactSection) {
        // Set the section title
        setSectionTitle(impactSection.title?.[language] || t('our.impact'));
        
        // Parse the content for statistics
        try {
          // Look for numbers in the content
          const contentText = impactSection.content[language];
          
          // In order to avoid using the 's' flag which is only available in ES2018+,
          // we'll replace newlines with spaces before matching
          const normalizedText = contentText.replace(/\n/g, ' ');
          const statsMatch = normalizedText.match(/(\d+)\s*\+\s*.*?(\d+)\s*\+\s*.*?(\d+)\s*\+/);
          
          if (statsMatch && statsMatch.length >= 4) {
            setTargetTrainings(parseInt(statsMatch[1], 10) || 38);
            setTargetBeneficiaries(parseInt(statsMatch[2], 10) || 760);
            setTargetPartners(parseInt(statsMatch[3], 10) || 25);
          } else {
            // Try to get individual stats from separate lines
            const trainingsMatch = contentText.match(/(\d+)\s*\+\s*.*?Formation/i);
            const beneficiariesMatch = contentText.match(/(\d+)\s*\+\s*.*?Bénéficiaires/i);
            const partnersMatch = contentText.match(/(\d+)\s*\+\s*.*?Partenaires/i);
            
            if (trainingsMatch) setTargetTrainings(parseInt(trainingsMatch[1], 10) || 38);
            if (beneficiariesMatch) setTargetBeneficiaries(parseInt(beneficiariesMatch[1], 10) || 760);
            if (partnersMatch) setTargetPartners(parseInt(partnersMatch[1], 10) || 25);
          }
        } catch (error) {
          console.error("Error parsing impact statistics:", error);
        }
      }
    }
  };

  useEffect(() => {
    loadContent();
    
    // Listen for custom content updated event
    const handleContentUpdated = () => {
      loadContent();
    };
    
    window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
    
    // Listen for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'page_home' || event.key === 'editor_home') {
        loadContent();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language]);

  useEffect(() => {
    if (isInView) {
      const interval = setInterval(() => {
        setTrainings(prev => (prev < targetTrainings ? prev + 1 : prev));
        setBeneficiaries(prev => (prev < targetBeneficiaries ? prev + 20 : prev));
        setPartners(prev => (prev < targetPartners ? prev + 1 : prev));
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isInView, targetTrainings, targetBeneficiaries, targetPartners]);

  const statItems = [
    {
      value: trainings,
      label: t('stats.trainings'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      value: beneficiaries,
      label: t('stats.beneficiaries'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      value: partners,
      label: t('stats.partners'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="py-14 md:py-20 bg-gradient-to-b from-light to-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 md:mb-16"
        >
          <motion.h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-3 md:mb-4 relative inline-block"
            whileHover={{ scale: 1.03 }}
          >
            {sectionTitle || t('our.impact')}
          </motion.h2>
          <div className="flex justify-center items-center gap-1 mt-2">
            <div className="w-12 md:w-16 h-1 md:h-1.5 bg-primary mx-auto rounded-full"></div>
            <div className="w-8 md:w-12 h-1.5 md:h-2 bg-[#FF8A00] mx-auto rounded-full"></div>
            <div className="w-12 md:w-16 h-1 md:h-1.5 bg-primary mx-auto rounded-full"></div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {statItems.map((item, index) => (
            <motion.div
              key={index}
              className={`card bg-white rounded-xl md:rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 text-center transform transition-all hover:shadow-xl
                ${index === 1 ? 'border-t-4 border-[#FF8A00]' : 'border-t-4 border-primary'} 
                relative overflow-hidden group sm:col-span-1 ${index === 1 && 'sm:col-span-2 lg:col-span-1'}`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.2 * index }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: index === 1 ? "0 20px 25px -5px rgba(255, 138, 0, 0.1), 0 10px 10px -5px rgba(255, 138, 0, 0.04)" : "0 20px 25px -5px rgba(42, 160, 132, 0.1), 0 10px 10px -5px rgba(42, 160, 132, 0.04)"
              }}
            >
              {/* Decorative elements */}
              <div className={`absolute w-32 h-32 md:w-40 md:h-40 -right-16 -top-16 ${index === 1 ? 'bg-[#FF8A00]/10' : 'bg-primary/5'} rounded-full`}></div>
              <div className={`absolute w-20 h-20 md:w-24 md:h-24 -left-10 -bottom-10 ${index === 1 ? 'bg-[#FF8A00]/10' : 'bg-accent/5'} rounded-full`}></div>
              
              <div className="flex justify-center mb-4 md:mb-6 relative z-10">
                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${index === 1 ? 'bg-gradient-to-br from-[#FF8A00]/15 to-[#FF8A00]/30 text-[#FF8A00]' : 'bg-gradient-to-br from-primary/10 to-accent/10 text-primary'}`}>
                  {item.icon}
                </div>
              </div>
              
              <div className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4 flex items-center justify-center relative z-10 ${index === 1 ? 'text-[#FF8A00]' : 'bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent'}`}>
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  {item.value}
                </motion.span>
                <span className="text-2xl sm:text-3xl md:text-4xl ml-1">+</span>
              </div>
              
              <div className={`font-semibold text-base md:text-lg mb-4 md:mb-6 relative z-10 ${index === 1 ? 'text-[#FF8A00]/90' : 'text-secondary'}`}>{item.label}</div>
              
              <div className="h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full rounded-full ${index === 1 ? 'bg-[#FF8A00]' : 'bg-gradient-to-r from-primary to-accent'}`}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: "100%" } : { width: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 + (0.2 * index) }}
                ></motion.div>
              </div>
              
              {/* Hover effect */}
              <motion.div 
                className={`absolute inset-0 ${index === 1 ? 'bg-gradient-to-br from-[#FF8A00]/5 to-[#FF8A00]/15' : 'bg-gradient-to-br from-primary/5 to-accent/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />

              {/* New glowing dot in corner for middle card */}
              {index === 1 && (
                <motion.div 
                  className="absolute top-2 right-2 md:top-3 md:right-3 w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#FF8A00]"
                  animate={{ 
                    boxShadow: ['0 0 3px 1px rgba(255, 138, 0, 0.3)', '0 0 5px 2px rgba(255, 138, 0, 0.5)', '0 0 3px 1px rgba(255, 138, 0, 0.3)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Enhanced decorative elements */}
        <div className="relative h-10 md:h-14 mt-8 md:mt-10">
          <motion.div
            className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#FF8A00]/20 blur-xl -bottom-20 right-10"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              repeatType: "mirror" 
            }}
          />
          <motion.div
            className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 blur-xl -bottom-20 left-10"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              repeatType: "mirror",
              delay: 2 
            }}
          />
        </div>
      </div>
    </div>
  );
} 