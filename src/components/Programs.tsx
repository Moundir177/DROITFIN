'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { FaArrowRight, FaGraduationCap, FaBalanceScale, FaBullhorn } from 'react-icons/fa';
import { getPageContent, PageContent } from '@/lib/database';

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

export default function Programs() {
  const { language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const [sectionTitle, setSectionTitle] = useState(language === 'ar' ? 'برامجنا' : 'Nos Programmes');
  const [sectionDesc, setSectionDesc] = useState(
    language === 'ar' 
      ? 'اكتشف البرامج المختلفة التي نعمل من خلالها على تعزيز وحماية الحقوق الأساسية.'
      : 'Découvrez les différents programmes à travers lesquels nous travaillons pour promouvoir et protéger les droits fondamentaux.'
  );
  const [discoverLabel, setDiscoverLabel] = useState(language === 'ar' ? 'اكتشف عملنا' : 'Découvrez notre travail');
  const [programData, setProgramData] = useState([
    {
      title: language === 'ar' ? 'التثقيف في مجال الحقوق' : 'Éducation aux droits',
      description: language === 'ar'
        ? 'التوعية والتدريب على مبادئ الحقوق الأساسية لمختلف الفئات.'
        : 'Sensibilisation et formation aux principes des droits fondamentaux pour différents publics.',
      image: "/images/programs/rights-education.jpg",
      link: "/training/programs",
      icon: <FaGraduationCap className="text-white group-hover:text-accent transition-colors duration-300" size={24} />
    },
    {
      title: language === 'ar' ? 'المساعدة القانونية' : 'Assistance juridique',
      description: language === 'ar'
        ? 'الدعم القانوني للأفراد والمنظمات في الدفاع عن حقوقهم.'
        : 'Soutien juridique aux individus et organisations dans la défense de leurs droits.',
      image: "/images/programs/legal-assistance.jpg",
      link: "/resources/guides",
      icon: <FaBalanceScale className="text-white group-hover:text-accent transition-colors duration-300" size={24} />
    },
    {
      title: language === 'ar' ? 'المناصرة' : 'Plaidoyer',
      description: language === 'ar'
        ? 'أنشطة المناصرة مع صناع القرار لتحسين السياسات المتعلقة بالحقوق.'
        : 'Actions de plaidoyer auprès des décideurs pour l\'amélioration des politiques liées aux droits.',
      image: "/images/programs/advocacy.jpg",
      link: "/news/projects",
      icon: <FaBullhorn className="text-white group-hover:text-accent transition-colors duration-300" size={24} />
    }
  ]);

  const loadContent = async () => {
    const content = await getPageContent('home');
    if (content) {
      console.log('Programs - Loading content, available sections:', content.sections.map(s => s.id));
      
      // Find the programmes section by checking multiple possible IDs
      const programmesSection = content.sections.find(section => 
        section.id === '9' || 
        section.id === 'section_9' || 
        section.id === 'programmes' ||
        (section.title && (
          section.title.fr?.toLowerCase().includes('programmes') || 
          section.title.ar?.includes('برامجنا')
        ))
      );
      
      if (programmesSection) {
        console.log('Programs - Found section:', programmesSection.title);
        
        // Set the section title and description
        setSectionTitle(programmesSection.title?.[language] || (language === 'ar' ? 'برامجنا' : 'Nos Programmes'));
        
        // Handle non-JSON content safely
        if (programmesSection.content && programmesSection.content[language]) {
          setSectionDesc(programmesSection.content[language]);
        } else {
          setSectionDesc(language === 'ar' 
            ? 'اكتشف البرامج المختلفة التي نعمل من خلالها على تعزيز وحماية الحقوق الأساسية.'
            : 'Découvrez les différents programmes à travers lesquels nous travaillons pour promouvoir et protéger les droits fondamentaux.');
        }
        
        // Check if there's metadata for the discover label
        if (programmesSection.metadata?.discoverLabel) {
          setDiscoverLabel(programmesSection.metadata.discoverLabel[language] || 
            (language === 'ar' ? 'اكتشف عملنا' : 'Découvrez notre travail'));
        }
        
        // Look for programme_items section to update program data
        const programmeItemsSection = content.sections.find(section => 
          section.id === 'programme_items' || 
          section.id === '9_details' ||
          section.id === 'section_9_details' ||
          (section.title && (
            section.title.fr?.toLowerCase().includes('programme') || 
            section.title.ar?.includes('برامج')
          ))
        );
        
        if (programmeItemsSection && programmeItemsSection.content) {
          console.log('Programs - Found items section:', programmeItemsSection.title);
          
          // First check if content is available
          const contentStr = programmeItemsSection.content[language] || '';
          
          // Handle JSON or text content appropriately
          if (contentStr && contentStr.trim()) {
            try {
              // Check if it looks like JSON
              if (contentStr.trim().startsWith('[') && contentStr.trim().endsWith(']')) {
                const programItems = JSON.parse(contentStr);
                if (Array.isArray(programItems) && programItems.length > 0) {
                  // Map the loaded program items to our format, keeping the icons
                  const updatedProgramData = programItems.map((item, index) => {
                    const originalIcon = programData[index % programData.length]?.icon || 
                      [
                        <FaGraduationCap key="graduation" />, 
                        <FaBalanceScale key="balance" />, 
                        <FaBullhorn key="bullhorn" />
                      ][index % 3];
                    
                    return {
                      title: item.title || programData[index % programData.length]?.title || '',
                      description: item.description || programData[index % programData.length]?.description || '',
                      image: item.image || programData[index % programData.length]?.image || "/images/programs/rights-education.jpg",
                      link: item.link || programData[index % programData.length]?.link || "/",
                      icon: originalIcon
                    };
                  });
                  
                  setProgramData(updatedProgramData);
                }
              } else {
                // Not JSON format, try to extract program info from text
                console.log('Programs - Content is not in JSON format, extracting from text');
                extractProgramInfoFromText(contentStr);
              }
            } catch (e) {
              console.error("Error parsing programme items:", e);
              // Try to extract program items from text content as fallback
              extractProgramInfoFromText(contentStr);
            }
          }
        } else {
          console.log('Programs - No items section found, trying to extract from main section');
          if (programmesSection.content && programmesSection.content[language]) {
            extractProgramInfoFromText(programmesSection.content[language]);
          }
        }
      } else {
        console.log('Programs - Section not found!');
      }
    } else {
      console.log('Programs - No content found for home page');
    }
  };

  // Helper function to extract program info from text content
  const extractProgramInfoFromText = (contentText: string) => {
    if (!contentText) return;
    
    try {
      // Check for content that looks like it has program details
      if (contentText.includes('Éducation aux droits') || contentText.includes('التثقيف بالحقوق') ||
          contentText.includes('Assistance juridique') || contentText.includes('المساعدة القانونية') ||
          contentText.includes('Plaidoyer') || contentText.includes('المناصرة')) {
        
        // Extract program items by splitting the content
        const lines = contentText.split('\n\n').filter(line => line.trim());
        
        if (lines.length >= 3) { // At least 3 programs
          const programItems = [];
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const titleMatch = line.match(/^(.+?):/);
            
            if (titleMatch) {
              const title = titleMatch[1].trim();
              const description = line.substring(titleMatch[0].length).trim();
              
              programItems.push({
                title,
                description,
                image: programData[programItems.length % programData.length]?.image || "/images/programs/rights-education.jpg",
                link: programData[programItems.length % programData.length]?.link || "/"
              });
            }
          }
          
          if (programItems.length > 0) {
            const updatedProgramData = programItems.map((item, index) => {
              const originalIcon = programData[index % programData.length]?.icon || 
                [
                  <FaGraduationCap key="graduation" />, 
                  <FaBalanceScale key="balance" />, 
                  <FaBullhorn key="bullhorn" />
                ][index % 3];
              
              return {
                ...item,
                icon: originalIcon
              };
            });
            
            setProgramData(updatedProgramData);
          }
        }
      }
    } catch (e) {
      console.error("Error extracting program items from content:", e);
      // Keep the default program data if extraction fails
    }
  };

  useEffect(() => {
    loadContent();
    
    // Listen for custom content updated event
    const handleContentUpdated = () => {
      console.log('Programs - Content updated event received');
      loadContent();
    };
    
    window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
    
    // Listen for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'page_home' || event.key === 'editor_home') {
        console.log('Programs - Storage change detected');
        loadContent();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [language]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };
  
  return (
    <section ref={ref} className="py-10 sm:py-16 md:py-24 bg-light relative overflow-hidden" id="section_9">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full opacity-40" preserveAspectRatio="none">
          <pattern id="programs-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M10 10L50 50M50 10L10 50" stroke="#2AA084" strokeWidth="0.5" strokeOpacity="0.1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#programs-pattern)" />
        </svg>
        
        {/* Animated background shapes */}
        <motion.div 
          className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.2, 0.3, 0.2],
            x: [0, 20, 0]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-40 left-20 w-80 h-80 rounded-full bg-accent/5 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.1, 0.2, 0.1],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-8 sm:mb-12 md:mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants} className="mb-3">
            <span className="inline-block text-xs sm:text-sm font-semibold text-primary px-2 sm:px-3 py-1 rounded-full bg-primary/10 mb-2 sm:mb-3">
              {discoverLabel}
            </span>
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-4 sm:mb-6 relative inline-block">
            {sectionTitle}
            <div className="absolute -bottom-2 left-0 right-0 mx-auto w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-gray-600 max-w-3xl mx-auto text-sm sm:text-base md:text-lg">
            {sectionDesc}
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-6 md:gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {programData.map((program, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl group relative overflow-hidden transition-all duration-500 transform hover:-translate-y-2"
              variants={itemVariants}
              custom={index}
            >
              <div className="relative">
                <div className="relative h-48 sm:h-52 md:h-60 overflow-hidden rounded-t-xl sm:rounded-t-2xl">
                  <Image 
                    src={program.image} 
                    alt={program.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  
                  {/* Title overlay with icon */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 flex items-center">
                    <div className="bg-primary rounded-full p-2 sm:p-3 mr-2 sm:mr-3 shadow-green transform transition-all duration-300 group-hover:scale-110 group-hover:bg-secondary">
                      <span className="block sm:hidden">{React.cloneElement(program.icon, { size: 16 })}</span>
                      <span className="hidden sm:block">{program.icon}</span>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-accent transition-colors duration-300">
                      {program.title}
                    </h3>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-5 md:p-6">
                <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">
                  {program.description}
                </p>
                
                <Link 
                  href={program.link} 
                  className="inline-flex items-center font-semibold text-primary hover:text-accent transition-colors duration-300 group/link text-sm sm:text-base"
                >
                  <span>{language === 'ar' ? 'اكتشف' : 'Découvrir'}</span>
                  <motion.div
                    className="ml-2 transform transition-transform duration-300 group-hover/link:translate-x-1"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FaArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </motion.div>
                </Link>
                
                {/* Decorative corner accent */}
                <div className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 -right-8 sm:-right-10 md:-right-12 -bottom-8 sm:-bottom-10 md:-bottom-12 rounded-full bg-primary/5"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom CTA */}
        <motion.div 
          className="mt-10 sm:mt-12 md:mt-16 text-center"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href="/programs" 
              className="inline-flex items-center bg-primary hover:bg-accent text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors duration-300 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg"
            >
              <span>{language === 'ar' ? 'جميع برامجنا' : 'Tous nos programmes'}</span>
              <FaArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 