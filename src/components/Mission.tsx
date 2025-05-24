'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState, useRef } from 'react';
import { getPageContent, PageContent } from '@/lib/database';
import { motion, useInView } from 'framer-motion';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function Mission() {
  const { language } = useLanguage();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await getPageContent('home');
        if (content) {
          setPageContent(content);
        }
      } catch (error) {
        console.error('Error loading mission content:', error);
      }
    };
    
    loadContent();
  }, []);

  // Get mission and droits_egaux sections
  const missionSection = pageContent?.sections.find(section => section.id === 'mission');
  const droitsEgauxSection = pageContent?.sections.find(section => section.id === 'droits_egaux');
  const pointsFortsSection = pageContent?.sections.find(section => section.id === 'points_forts');
  
  // Default content if not found in database
  const missionText = missionSection?.content[language] || 
    (language === 'fr' 
      ? 'Notre mission est de promouvoir et défendre les droits par la sensibilisation, la formation, la documentation des violations et le soutien aux acteurs de la société civile.'
      : 'مهمتنا هي تعزيز والدفاع عن الحقوق من خلال التوعية والتدريب وتوثيق الانتهاكات ودعم الفاعلين في المجتمع المدني.');
  
  const droitsEgauxText = droitsEgauxSection?.content[language] || 
    (language === 'fr' 
      ? 'Nous croyons que le respect des droits humains est essentiel au développement de sociétés justes et pacifiques. Notre travail se concentre sur la garantie que ces droits soient connus, reconnus et défendus.'
      : 'نؤمن بأن احترام حقوق الإنسان أمر ضروري لتطوير مجتمعات عادلة وسلمية. يركز عملنا على ضمان أن تكون هذه الحقوق معروفة ومعترف بها ومدافع عنها.');

  // Extract points forts content or use default
  let pointsForts = [
    language === 'fr' ? 'Promotion des principes démocratiques et de l\'état de droit' : 'تعزيز المبادئ الديمقراطية وسيادة القانون',
    language === 'fr' ? 'Protection des droits des populations vulnérables' : 'حماية حقوق الفئات الضعيفة',
    language === 'fr' ? 'Éducation et sensibilisation aux droits' : 'التعليم والتوعية بالحقوق',
    language === 'fr' ? 'Renforcement des capacités de la société civile' : 'تعزيز قدرات المجتمع المدني'
  ];
  
  // If we have points forts section, try to parse its content
  if (pointsFortsSection) {
    const pointsFortsText = pointsFortsSection.content[language];
    if (pointsFortsText) {
      // Try to split by commas
      const parsedPoints = pointsFortsText.split(',').map(point => point.trim());
      if (parsedPoints.length > 1) {
        pointsForts = parsedPoints;
      }
    }
  }
  
  // Get image URL or use default
  const missionImage = missionSection?.image || '/images/droits-egaux.jpg';
  
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
    hidden: { y: 20, opacity: 0 },
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
    <section className="pt-12 sm:pt-16 md:pt-24 bg-light relative overflow-hidden" ref={ref}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full opacity-30" preserveAspectRatio="none">
          <pattern id="mission-grid" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="#2AA084" strokeWidth="0.5" strokeOpacity="0.05" />
            <line x1="0" y1="0" x2="40" y2="0" stroke="#2AA084" strokeWidth="0.5" strokeOpacity="0.05" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#mission-grid)" />
        </svg>
        
        {/* Animated background gradients */}
        <motion.div 
          className="absolute top-20 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.2, 0.3, 0.2],
            y: [0, 30, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute -bottom-40 right-0 w-80 h-80 rounded-full bg-orange/5 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.1, 0.2, 0.1],
            x: [0, -20, 0]
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-10 items-center">
          {/* Left column (3 columns wide) */}
          <motion.div 
            className="lg:col-span-3"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div
              variants={itemVariants}
              className="mb-6 md:mb-8"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-3 md:mb-4 relative inline-block">
                {missionSection?.title?.[language] || (language === 'fr' ? 'Notre Mission' : 'مهمتنا')}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange rounded-full"></div>
              </h2>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mt-6 sm:mt-8">
                {missionText}
              </p>
            </motion.div>

            <motion.ul 
              className="space-y-4 sm:space-y-6 mb-6 sm:mb-8 md:mb-10"
              variants={containerVariants}
            >
              {pointsForts.map((point, index) => (
                <motion.li 
                  className="flex items-start group" 
                  key={index}
                  variants={itemVariants}
                  custom={index}
                >
                  <div className={`flex-shrink-0 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full ${index % 2 === 0 ? 'bg-gradient-to-r from-primary to-accent' : 'bg-gradient-to-r from-orange to-orange-light'} flex items-center justify-center text-white ${index % 2 === 0 ? 'shadow-green' : 'shadow-orange'} mr-3 md:mr-4 transform transition-transform duration-300 group-hover:scale-110`}>
                    <FaCheckCircle className="text-xs sm:text-sm" />
                  </div>
                  <div className="pt-0.5 md:pt-1">
                    <span className="font-medium text-secondary text-sm sm:text-base group-hover:text-primary transition-colors duration-300">{point}</span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
            
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mb-8 md:mb-0"
            >
              <Link 
                href="/about/mission" 
                className="inline-flex items-center btn-primary text-sm sm:text-base py-2 px-4 sm:py-3 sm:px-6 group"
              >
                <span>{language === 'fr' ? 'En Savoir Plus' : 'معرفة المزيد'}</span>
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FaArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right column (2 columns wide) */}
          <motion.div 
            className="lg:col-span-2"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <motion.div 
              className="relative rounded-lg overflow-hidden shadow-xl"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-orange/20 mix-blend-overlay z-10"></div>
              <motion.div
                className="absolute inset-0 border-4 border-white/30 m-4 z-20 rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              ></motion.div>
              <Image 
                src={missionImage} 
                alt={missionSection?.title?.[language] || "Mission Image"} 
                width={800} 
                height={600}
                className="w-full h-auto object-cover transform scale-105 hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Quote overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-10 px-4 pb-4 z-30">
                <div className="text-white text-xs sm:text-sm md:text-base italic relative">
                  <div className="absolute -top-5 left-0 text-orange text-2xl sm:text-3xl md:text-4xl opacity-70">"</div>
                  {droitsEgauxText}
                  <div className="absolute -bottom-2 right-0 text-orange text-2xl sm:text-3xl md:text-4xl opacity-70">"</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Orange wave separator */}
      <div className="mt-16 sm:mt-20 md:mt-24 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
          <path 
            fill="#FF8A00" 
            fillOpacity="0.2" 
            d="M0,64L60,58.7C120,53,240,43,360,53.3C480,64,600,96,720,101.3C840,107,960,85,1080,69.3C1200,53,1320,43,1380,37.3L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
} 