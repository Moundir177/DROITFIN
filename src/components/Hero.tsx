'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getPageContent, PageContent } from '@/lib/database';

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

// Client-only component for the hero background and animations
function HeroBackground({ backgroundImage, mousePosition }: { 
  backgroundImage: string, 
  mousePosition: { x: number, y: number } 
}) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    // Server-side render a simpler version without animations
    return (
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ 
          backgroundImage: `url('${backgroundImage}')`, 
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-secondary/85 to-[#2AA084]/70"></div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="absolute inset-0 bg-cover bg-center z-0" 
      initial={{ scale: 1.1, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.5 }}
      style={{ 
        backgroundImage: `url('${backgroundImage}')`, 
        backgroundPosition: 'center',
      }}
    >
      {/* Modern gradient overlay with orange accents */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-black/95 via-secondary/85 to-[#2AA084]/70"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 1.5 }}
        style={{
          backgroundPosition: `${mousePosition.x / 100}px ${mousePosition.y / 100}px`
        }}
      ></motion.div>
      
      {/* Animated orange accent lines */}
      <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
        <motion.path 
          d="M0,30 Q25,35 50,30 T100,30" 
          fill="none" 
          stroke="#FF8A00" 
          strokeWidth="0.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{ 
            strokeDasharray: 1000,
            strokeDashoffset: 1000,
            y: "20%"
          }}
        />
        <motion.path 
          d="M0,80 Q25,70 50,80 T100,80" 
          fill="none" 
          stroke="#FF8A00" 
          strokeWidth="0.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }}
          style={{ 
            strokeDasharray: 1000,
            strokeDashoffset: 1000,
            y: "70%"
          }}
        />
      </svg>
      
      {/* Animated overlay for depth */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(42, 160, 132, 0.4) 0%, transparent 50%)",
            "radial-gradient(circle at 60% 70%, rgba(42, 160, 132, 0.4) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, rgba(42, 160, 132, 0.4) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 40%, rgba(42, 160, 132, 0.4) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 30%, rgba(42, 160, 132, 0.4) 0%, transparent 50%)"
          ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      ></motion.div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#2AA084]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-orange/5 rounded-full blur-3xl"></div>
    </motion.div>
  );
}

export default function Hero() {
  const { language } = useLanguage();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [pageContent, setPageContent] = useState<PageContent | null>(null);

  const loadContent = async () => {
    try {
      const content = await getPageContent('home');
      if (content) {
        setPageContent(content);
      }
    } catch (error) {
      console.error('Error loading hero content:', error);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    loadContent(); // Initial load

    // Add event listeners for content updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'page_home') {
        loadContent();
      }
    };
    
    const handleContentUpdated = () => {
      loadContent();
    };
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom content updated event
    window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Get hero section content
  const heroSection = pageContent?.sections.find(section => section.id === 'hero');
  const missionSection = pageContent?.sections.find(section => section.id === 'mission');
  
  // Default content if not found in database
  const heroTitle = heroSection?.title?.[language] || 
    (language === 'fr' ? 'Bannière principale' : 'البانر الرئيسي');
    
  const heroText = heroSection?.content?.[language] || 
    (language === 'fr' ? 'Fondation pour la Promotion des Droits' : 'المؤسسة من اجل ترقية الحقوق');
  
  const missionTitle = missionSection?.title?.[language] || 
    (language === 'fr' ? 'Notre mission' : 'مهمتنا');
    
  const missionText = missionSection?.content?.[language] || 
    (language === 'fr' ? 'Notre mission est de promouvoir et défendre les droits par la sensibilisation, la formation, la documentation des violations et le soutien aux acteurs de la société civile.' 
    : 'مهمتنا هي تعزيز والدفاع عن الحقوق من خلال التوعية والتدريب وتوثيق الانتهاكات ودعم الفاعلين في المجتمع المدني.');
  
  // Get background image or use default
  const backgroundImage = heroSection?.image || '/images/hero-background.jpg';

  return (
    <div className="relative h-screen min-h-[600px] sm:min-h-[700px] flex items-center overflow-hidden">
      {/* Background image with overlay - now client-only */}
      <HeroBackground backgroundImage={backgroundImage} mousePosition={mousePosition} />
      
      <div className="container mx-auto px-4 z-10 relative">
        <motion.div
          className="absolute top-0 left-0 w-1/4 h-full border-l-2 border-[#2AA084]/10"
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        <motion.div
          className="absolute top-0 right-0 w-1/4 h-full border-r-2 border-[#2AA084]/10"
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      
        <div className="max-w-5xl mx-auto text-center">
          {/* Highlight accent for hero title */}
          <motion.div
            className="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/3 w-40 h-40 rounded-full blur-3xl bg-[#2AA084]/20 z-0"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              repeatType: "mirror"
            }}
          />
          
          {/* Subtitle with orange accent */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-[#2AA084] uppercase tracking-widest text-xs sm:text-sm md:text-base font-medium mb-2 sm:mb-4">
              {heroTitle}
            </p>
          </motion.div>
          
          {/* Main title with animated characters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-8 leading-tight tracking-tight relative z-10">
              {heroText}
              <motion.div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 bg-orange"
                initial={{ width: 0 }}
                animate={{ width: "40%" }}
                transition={{ delay: 1, duration: 1 }}
              ></motion.div>
            </h1>
          </motion.div>
          
          {/* Mission text with animated orange quote marks */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="relative"
          >
            <motion.div 
              className="absolute -left-4 sm:-left-6 -top-4 sm:-top-6 text-4xl sm:text-6xl text-orange/40"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 10, repeat: Infinity }}
            >
              "
            </motion.div>
            <motion.div 
              className="absolute -right-4 sm:-right-6 -bottom-4 sm:-bottom-6 text-4xl sm:text-6xl text-orange/40"
              animate={{ rotate: [5, -5, 5] }}
              transition={{ duration: 10, repeat: Infinity }}
            >
              "
            </motion.div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-16 max-w-3xl mx-auto leading-relaxed px-4 sm:px-8">
              {missionText}
            </p>
          </motion.div>
          
          {/* CTA Buttons with enhanced orange glow */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 sm:mt-10 px-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden group"
            >
              <motion.div 
                className="absolute inset-0 bg-[#2AA084]/20 blur-lg transform scale-110 translate-y-3 z-0 transition-all duration-300 group-hover:translate-y-5"
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1.1, 1.15, 1.1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              ></motion.div>
              <Link 
                href="/about" 
                className="bg-[#2AA084] hover:bg-[#228E74] text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-lg transition-all shadow-lg flex items-center gap-2 sm:gap-3 transform relative z-10 text-sm sm:text-base"
              >
                <span>{language === 'fr' ? 'Qui sommes-nous' : 'من نحن'}</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden group"
            >
              <motion.div 
                className="absolute inset-0 bg-orange/20 blur-lg transform scale-110 translate-y-3 z-0 transition-all duration-300 group-hover:translate-y-5"
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1.1, 1.15, 1.1]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              ></motion.div>
              <Link 
                href="/contact" 
                className="bg-orange hover:bg-orange-dark text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-lg transition-all shadow-lg flex items-center gap-2 sm:gap-3 transform relative z-10 text-sm sm:text-base"
              >
                <span>{language === 'fr' ? 'Nous contacter' : 'اتصل بنا'}</span>
                <motion.div
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </motion.div>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden group"
            >
              <motion.div 
                className="absolute inset-0 bg-white/10 blur-lg transform scale-110 translate-y-3 z-0 transition-all duration-300 group-hover:translate-y-5"
                animate={{ 
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1.1, 1.15, 1.1]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              ></motion.div>
              <Link 
                href="/resources" 
                className="bg-transparent hover:bg-white/10 text-white border-2 border-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-lg transition-all flex items-center gap-2 sm:gap-3 transform relative z-10 group-hover:border-orange text-sm sm:text-base"
              >
                <span>{language === 'fr' ? 'Nos publications' : 'منشوراتنا'}</span>
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 group-hover:text-orange transition-colors" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Animated scroll indicator with orange accent */}
          <motion.div
            className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ 
              opacity: { delay: 1.5, duration: 1 },
              y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
            }}
          >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.2 }}
            >
              <motion.div 
                className="absolute inset-0 bg-orange/40 rounded-full blur-md"
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-[#2AA084]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 