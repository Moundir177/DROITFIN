'use client';

import { useState, useEffect } from 'react';
import { FaGraduationCap, FaBullhorn, FaBalanceScale } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { getPageContent, PageContent } from '@/lib/database';

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

export default function Objectives() {
  const { language } = useLanguage();
  const [sectionTitle, setSectionTitle] = useState('Nos objectifs');
  const [sectionDesc, setSectionDesc] = useState('');
  const [objectiveItems, setObjectiveItems] = useState([
    {
      id: "formations",
      icon: <FaGraduationCap />,
      title: "Formations et recherches",
      content: "Organiser des formations continues et des forums et réaliser des recherches et des études dans le domaine de la promotion des droits."
    },
    {
      id: "sensibilisation",
      icon: <FaBullhorn />,
      title: "Sensibilisation et médias",
      content: "Réaliser toute activité de sensibilisation et médiatique liée à la promotion des droits pour informer et éduquer le public."
    },
    {
      id: "droit",
      icon: <FaBalanceScale />,
      title: "Construction d'un État de droit",
      content: "Contribuer et œuvrer à la construction d'un État de droit en exhortant les citoyens à s'engager à faire appliquer et respecter la loi et à promouvoir les droits."
    }
  ]);

  const loadContent = async () => {
    const content = await getPageContent('home');
    if (content) {
      // Find the objectives section
      const objectivesSection = content.sections.find(section => section.id === 'objectives');
      if (objectivesSection) {
        // Set the section title and description
        setSectionTitle(objectivesSection.title?.[language] || 'Nos objectifs');
        setSectionDesc(objectivesSection.content?.[language] || '');
        
        // Look for details in the objectifs_details section
        const objectivesDetailsSection = content.sections.find(section => section.id === 'objectifs_details');
        if (objectivesDetailsSection && objectivesDetailsSection.content) {
          const detailsContent = objectivesDetailsSection.content[language];
          
          // Parse the content to extract the three objectives
          // Assuming the content follows a format with "Formations et recherches:", "Sensibilisation et médias:", etc.
          try {
            // Create updated objectives with content from the database
            const updatedObjectives = [...objectiveItems];
            
            // Convert newlines to spaces to ensure matches work across lines
            const normalizedContent = detailsContent.replace(/\n/g, ' ');
            
            // Update formations content if found
            const formationsMatch = normalizedContent.match(/Formations et recherches:([^]*?)(?=Sensibilisation et médias:|$)/);
            if (formationsMatch && formationsMatch[1]) {
              updatedObjectives[0].content = formationsMatch[1].trim();
            }
            
            // Update sensibilisation content if found
            const sensibilisationMatch = normalizedContent.match(/Sensibilisation et médias:([^]*?)(?=Construction d'un État de droit:|$)/);
            if (sensibilisationMatch && sensibilisationMatch[1]) {
              updatedObjectives[1].content = sensibilisationMatch[1].trim();
            }
            
            // Update droit content if found
            const droitMatch = normalizedContent.match(/Construction d'un État de droit:([^]*?)$/);
            if (droitMatch && droitMatch[1]) {
              updatedObjectives[2].content = droitMatch[1].trim();
            }
            
            setObjectiveItems(updatedObjectives);
          } catch (error) {
            console.error("Error parsing objectives details:", error);
          }
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

  // Icons to use
  const icons = [
    <FaGraduationCap key="graduation" size={36} className="text-white" />,
    <FaBullhorn key="bullhorn" size={36} className="text-white" />,
    <FaBalanceScale key="balance" size={36} className="text-white" />
  ];

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-light" id="objectifs">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-2">
            {sectionTitle}
          </h2>
          <motion.div 
            className="w-16 sm:w-20 md:w-24 h-1 bg-orange mx-auto"
            initial={{ width: 0 }}
            animate={{ width: "4rem" }}
            transition={{ duration: 0.8, delay: 0.3 }}
          ></motion.div>
        </motion.div>
        
        <motion.p 
          className="text-center max-w-4xl mx-auto text-gray-700 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {sectionDesc}
        </motion.p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {objectiveItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + (index * 0.2) }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className={`relative ${index === 2 ? 'sm:col-span-2 md:col-span-1 sm:max-w-md sm:mx-auto md:max-w-none md:mx-0' : ''}`}
            >
              {/* 3D Shadow Effect */}
              <div className={`absolute inset-0 ${index === 1 ? 'bg-orange/10' : 'bg-[#2AA084]/10'} rounded-lg blur-xl transform translate-y-4 scale-95 z-0`}></div>
              
              <motion.div 
                className={`relative border-t-[3px] ${index === 1 ? 'border-t-orange' : 'border-t-[#2AA084]'} bg-white shadow-lg hover:shadow-2xl transition-all duration-300 z-10`}
                animate={{ 
                  y: [0, -10, 0], 
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: index
                }}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                  backfaceVisibility: "hidden"
                }}
              >
                <div className="p-4 sm:p-6 md:p-8 text-center">
                  <motion.div 
                    className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 ${index === 1 ? 'bg-orange' : 'bg-[#2AA084]'} rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 md:mb-8 shadow-xl`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      boxShadow: index === 1 
                        ? "0 10px 15px -3px rgba(255, 138, 0, 0.3), 0 4px 6px -4px rgba(255, 138, 0, 0.3)"
                        : "0 10px 15px -3px rgba(42, 160, 132, 0.3), 0 4px 6px -4px rgba(42, 160, 132, 0.3)"
                    }}
                  >
                    {icons[index]}
                  </motion.div>
                  
                  <h3 className="text-xl sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 text-secondary">
                    {item.title.split(' et').join(' et<br/>')}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {item.content.split('. ').join('.<br/>')}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 