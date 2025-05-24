'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaBalanceScale, FaBullhorn, FaChalkboardTeacher, FaUsers, FaUserGraduate, FaHandsHelping } from 'react-icons/fa';
import PageHeader from '@/components/PageHeader';
import { getPageContent, PageContent } from '@/lib/database';
import Newsletter from '@/components/Newsletter';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

export default function AboutPage() {
  const { language } = useLanguage();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  // Classes for RTL/LTR layout
  const textAlign = language === 'ar' ? 'text-right' : 'text-left';

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const loadContent = async () => {
    try {
      const content = await getPageContent('about');
      if (content) {
        console.log('About page - Content loaded:', content);
        setPageContent(content);
      }
    } catch (error) {
      console.error('Error loading about page content:', error);
    }
  };

  useEffect(() => {
    loadContent(); // Initial load

    // Listen for storage events (localStorage changes)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'page_about' || event.key === 'editor_about') {
        console.log('About page - Storage change detected');
        loadContent();
      }
    };

    // Listen for custom content updated event
    const handleContentUpdated = () => {
      console.log('About page - Content updated event received');
      loadContent();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
    };
  }, [language]);

  // Helper function to get section content
  const getSectionContent = (sectionId: string) => {
    if (!pageContent) return null;
    return pageContent.sections.find(s => s.id === sectionId);
  };

  // Get page title from content or use default
  const pageTitle = pageContent?.title?.[language as 'fr' | 'ar'] || 
    (language === 'fr' ? 'À propos de la Fondation' : 'حول المؤسسة');
  
  // Get page sections
  const introSection = getSectionContent('intro') || getSectionContent('about_intro');
  const missionSection = getSectionContent('mission');
  const visionSection = getSectionContent('vision');
  const justiceSection = getSectionContent('justice');
  const objectivesSection = getSectionContent('objectives');
  const objectivesIntroSection = getSectionContent('objectives_intro');
  const targetAudienceSection = getSectionContent('target_audience');
  const historySection = getSectionContent('history');
  
  // Get page subtitle or use default
  const pageSubtitle = introSection?.content?.[language as 'fr' | 'ar'] || 
    (language === 'fr' 
      ? 'Découvrez notre mission, nos valeurs et notre équipe dédiée à la promotion et à la défense des droits humains.' 
      : 'اكتشف مهمتنا وقيمنا وفريقنا المكرس لتعزيز وحماية حقوق الإنسان.');

  // Get mission content
  const missionContent = missionSection?.content?.[language as 'fr' | 'ar'] || 
    (language === 'fr'
      ? 'Notre mission principale est de contribuer à la construction d\'un État de droit solide et inclusif. Pour cela, nous mettons en place des actions de plaidoyer, des campagnes de sensibilisation, des formations juridiques et des programmes d\'éducation civique. Nous exhortons les citoyennes et citoyens à s\'engager activement, à faire respecter la loi et à défendre leurs droits avec responsabilité et solidarité.'
      : 'مهمتنا هي تعزيز والدفاع عن الحقوق من خلال التوعية والتدريب وتوثيق الانتهاكات ودعم الفاعلين في المجتمع المدني.');

  // Get vision content
  const visionContent = visionSection?.content?.[language as 'fr' | 'ar'] || 
    (language === 'fr'
      ? '"Contribuer à l\'édification d\'une société où la dignité humaine est respectée et où les droits sont garantis pour tous, sans discrimination."'
      : '"المساهمة في بناء مجتمع تُحترم فيه كرامة الإنسان وتُضمن فيه الحقوق للجميع، دون تمييز."');

  // Get mission statement content
  const missionStatementContent = justiceSection?.content?.[language as 'fr' | 'ar'] || 
    (language === 'fr'
      ? 'Face aux défis, nous restons engagés et mobilisés pour faire avancer la justice et promouvoir le respect des droits fondamentaux.'
      : 'في مواجهة التحديات، نبقى ملتزمين ومجندين لدفع العدالة وتعزيز احترام الحقوق الأساسية.');

  // Get objectives intro content
  const objectivesIntroContent = objectivesIntroSection?.content?.[language as 'fr' | 'ar'] || 
    (language === 'fr'
      ? 'La Fondation pour la promotion des droits poursuit les objectifs suivants pour concrétiser sa vision d\'une société juste et respectueuse des droits fondamentaux.'
      : 'تسعى مؤسسة تعزيز الحقوق لتحقيق الأهداف التالية لتجسيد رؤيتها لمجتمع عادل يحترم الحقوق الأساسية.');

  return (
    <div>
      {/* Page Header */}
      <PageHeader 
        title={pageTitle}
        subtitle={pageSubtitle}
        language={language as 'fr' | 'ar'}
      />

      {/* Breadcrumbs */}
      <div className="bg-white py-4 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className={`flex items-center text-gray-500 text-sm ${language === 'ar' ? 'justify-end' : ''}`}>
            <Link href="/" className="hover:text-[#8FD694] transition-colors duration-300">
              {language === 'fr' ? 'Accueil' : 'الرئيسية'}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium">
              {language === 'fr' ? 'À propos' : 'من نحن'}
            </span>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-16 bg-white overflow-hidden relative" ref={sectionRef}>
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2AA084]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF8A00]/5 rounded-full blur-3xl"></div>
        <motion.div 
          className="absolute left-1/3 bottom-1/4 w-24 h-24 rounded-full bg-[#8FD694]/20 blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "mirror" 
          }}
        />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className={textAlign}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h2 
                className="text-4xl font-bold mb-6"
                whileHover={{ scale: 1.02 }}
              >
                {missionSection?.title?.[language as 'fr' | 'ar'] || (language === 'fr' ? 'Notre mission' : 'مهمتنا')}
              </motion.h2>
              
              <div className="flex mb-4">
                <div className="h-1 w-16 bg-[#8FD694] rounded-full"></div>
                <div className="h-1 w-16 bg-[#FF8A00] ml-1 rounded-full"></div>
              </div>
              
              <motion.div 
                className="text-gray-700 mb-6 text-lg leading-relaxed"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                dangerouslySetInnerHTML={{ __html: missionContent.replace(/\n/g, '<br/>') }}
              ></motion.div>
              
              <motion.p 
                className="text-gray-700 text-lg"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {language === 'fr'
                  ? 'La Fondation pour la promotion des droits s\'engage à travailler en étroite collaboration avec les communautés locales, les organisations de la société civile, les institutions académiques et les organismes internationaux pour créer un impact durable.'
                  : 'تلتزم مؤسسة تعزيز الحقوق بالعمل بشكل وثيق مع المجتمعات المحلية ومنظمات المجتمع المدني والمؤسسات الأكاديمية والهيئات الدولية لخلق تأثير مستدام.'}
              </motion.p>
              
              <motion.p 
                className="text-gray-700 mt-6 text-lg"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {language === 'fr'
                  ? 'Portée par des valeurs d\'intégrité, de liberté, d\'équité et de respect de la dignité humaine, la Fondation pour la promotion des droits est bien plus qu\'une organisation : c\'est un mouvement, un espoir, un levier pour le changement.'
                  : ''}
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="md:ml-auto"
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div 
                className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-[#8FD694] relative overflow-hidden"
                whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {/* Decorative gradient */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-[#8FD694]/30 to-[#2AA084]/10 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-[#FF8A00]/20 to-[#FF8A00]/5 rounded-full"></div>
                
                <motion.h3 
                  className="text-2xl font-bold text-[#8FD694] mb-4 relative"
                  initial={{ y: 20, opacity: 0 }}
                  animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  {visionSection?.title?.[language as 'fr' | 'ar'] || (language === 'fr' ? 'Notre vision' : 'رؤيتنا')}
                </motion.h3>
                
                <motion.p 
                  className="text-gray-700 italic text-lg relative"
                  initial={{ y: 20, opacity: 0 }}
                  animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  dangerouslySetInnerHTML={{ __html: visionContent.replace(/\n/g, '<br/>') }}
                ></motion.p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gray-50 relative overflow-hidden">
        {/* Decorative elements */}
        <motion.div 
          className="absolute right-1/4 top-1/4 w-32 h-32 rounded-full bg-[#FF8A00]/10 blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "mirror" 
          }}
        />
        <motion.div 
          className="absolute left-1/4 bottom-1/4 w-40 h-40 rounded-full bg-[#2AA084]/10 blur-xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            repeatType: "mirror",
            delay: 1
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.3 }}
              className="text-center"
            >
              <motion.h2 
                className="text-4xl font-bold text-center mb-6"
                whileHover={{ scale: 1.02 }}
              >
                {missionSection?.title?.[language as 'fr' | 'ar'] || (language === 'fr' ? 'Notre mission' : 'مهمتنا')}
              </motion.h2>
              
              <div className="flex justify-center items-center gap-1 mt-2 mb-12">
                <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#8FD694] mx-auto rounded-full"></div>
                <div className="w-8 md:w-12 h-1.5 md:h-2 bg-[#FF8A00] mx-auto rounded-full"></div>
                <div className="w-12 md:w-16 h-1 md:h-1.5 bg-[#8FD694] mx-auto rounded-full"></div>
              </div>
            </motion.div>
            
            <motion.p 
              className="text-xl text-gray-700 text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              dangerouslySetInnerHTML={{ __html: missionStatementContent.replace(/\n/g, '<br/>') }}
            ></motion.p>
            
            <motion.div 
              className="relative h-96 rounded-xl overflow-hidden mb-12 shadow-2xl group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Main image with overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
              
              {/* Background image */}
              <img 
                src={justiceSection?.image || "/images/law/justice-law-scales.jpg"}
                alt={justiceSection?.title?.[language as 'fr' | 'ar'] || (language === 'fr' ? "Justice et droits" : "العدالة والحقوق")} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Legal symbols overlay */}
              <motion.div 
                className="absolute top-4 right-4 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center z-20"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
              >
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 5H7C5.89543 5 5 5.89543 5 7V7C5 8.10457 5.89543 9 7 9H17C18.1046 9 19 8.10457 19 7V7C19 5.89543 18.1046 5 17 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 20L19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 20H21V22H3V20Z" fill="currentColor"/>
                </svg>
              </motion.div>
              
              {/* Decorative scales of justice */}
              <motion.div 
                className="absolute top-4 left-4 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center z-20"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1 }}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
              >
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3V7M12 21V16M6 21H18M15 7L9 7M12 7V16M9 7C9 7 5 8 5 12C5 16 9 16 9 16M15 7C15 7 19 8 19 12C19 16 15 16 15 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
              
              {/* Title overlay */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col items-center justify-center z-20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">
                  {justiceSection?.title?.[language as 'fr' | 'ar'] || (language === 'fr' ? "Justice et Droits" : "العدالة والحقوق")}
                </h3>
                <div className="h-1 w-20 bg-[#8FD694] rounded-full"></div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-[#8FD694] mb-12 relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
              }}
            >
              {/* Decorative element */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#8FD694]/10 rounded-full"></div>
              
              <motion.p 
                className="text-xl text-gray-700 italic relative z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                {language === 'fr'
                  ? 'La justice n\'est pas seulement ce que la loi nous dicte, mais ce que l\'humanité exige de nous.'
                  : 'العدالة ليست فقط ما يمليه علينا القانون، بل ما تتطلبه الإنسانية منا.'}
              </motion.p>
              <motion.p 
                className="text-right mt-4 text-gray-600 font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                — Nelson Mandela
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Objectives Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-[#8FD694] font-semibold mb-4">
              {language === 'fr' ? 'NOTRE ENGAGEMENT' : 'التزامنا'}
            </div>
            <h2 className="text-4xl font-bold mb-6">
              {objectivesSection?.title?.[language as 'fr' | 'ar'] || (language === 'fr' ? 'Nos objectifs' : 'أهدافنا')}
            </h2>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-16 bg-[#8FD694]"></div>
              <div className="h-1 w-16 bg-[#171717] ml-1"></div>
            </div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: objectivesIntroContent.replace(/\n/g, '<br/>') }}></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-2 bg-[#8FD694]"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-[#8FD694]/10 rounded-full flex items-center justify-center mb-6">
                  <FaBalanceScale className="text-[#8FD694] text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4">
                  {language === 'fr' ? 'Construction d\'un État de droit' : 'بناء دولة القانون'}
                </h3>
                <p className="text-gray-700">
                  {language === 'fr'
                    ? 'Contribuer et œuvrer à la construction d\'un État de droit en exhortant les citoyens à s\'engager à faire appliquer et respecter la loi et à promouvoir les droits.'
                    : 'المساهمة والعمل على بناء دولة القانون من خلال حث المواطنين على الالتزام بتطبيق واحترام القانون وتعزيز الحقوق.'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-2 bg-[#171717]"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-[#171717]/10 rounded-full flex items-center justify-center mb-6">
                  <FaBullhorn className="text-[#171717] text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4">
                  {language === 'fr' ? 'Sensibilisation et médias' : 'التوعية والإعلام'}
                </h3>
                <p className="text-gray-700">
                  {language === 'fr'
                    ? 'Réaliser toute activité de sensibilisation et médiatique liée à la promotion des droits pour informer et éduquer le public.'
                    : 'تنفيذ جميع أنشطة التوعية والإعلام المتعلقة بتعزيز الحقوق لإعلام وتثقيف الجمهور.'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-2 bg-[#8FD694]"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-[#8FD694]/10 rounded-full flex items-center justify-center mb-6">
                  <FaChalkboardTeacher className="text-[#8FD694] text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4">
                  {language === 'fr' ? 'Formations et recherches' : 'التدريب والبحوث'}
                </h3>
                <p className="text-gray-700">
                  {language === 'fr'
                    ? 'Organiser des formations continues et des forums et réaliser des recherches et des études dans le domaine de la promotion des droits.'
                    : 'تنظيم دورات تدريبية مستمرة ومنتديات وإجراء بحوث ودراسات في مجال تعزيز الحقوق.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-teal-600 font-semibold mb-4">
              {language === 'fr' ? 'QUI NOUS SERVONS' : 'من نخدم'}
            </div>
            <h2 className="text-4xl font-bold mb-6">
              {language === 'fr' ? 'Notre public cible' : 'جمهورنا المستهدف'}
            </h2>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-16 bg-yellow-500"></div>
              <div className="h-1 w-16 bg-teal-500 ml-1"></div>
            </div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              {language === 'fr'
                ? 'Nos actions et programmes sont conçus pour répondre aux besoins spécifiques de différentes catégories de personnes concernées par les droits humains.'
                : 'تم تصميم إجراءاتنا وبرامجنا لتلبية الاحتياجات المحددة لمختلف فئات الأشخاص المعنيين بحقوق الإنسان.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-2 bg-teal-500"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                  <FaUsers className="text-teal-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4">
                  {language === 'fr' ? 'Citoyens et citoyennes' : 'المواطنون والمواطنات'}
                </h3>
                <p className="text-gray-700">
                  {language === 'fr'
                    ? 'Souhaitant mieux comprendre et défendre leurs droits, et participer activement à la construction d\'une société juste.'
                    : 'الراغبون في فهم حقوقهم والدفاع عنها بشكل أفضل، والمشاركة بنشاط في بناء مجتمع عادل.'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-2 bg-yellow-500"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                  <FaUserGraduate className="text-yellow-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4">
                  {language === 'fr' ? 'Jeunes et étudiants' : 'الشباب والطلاب'}
                </h3>
                <p className="text-gray-700">
                  {language === 'fr'
                    ? 'Particulièrement sensibles aux enjeux de droits et désireux de s\'engager pour construire un avenir plus équitable.'
                    : 'المهتمون بشكل خاص بقضايا الحقوق والراغبون في الالتزام ببناء مستقبل أكثر إنصافًا.'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-2 bg-orange-500"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <FaHandsHelping className="text-orange-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4">
                  {language === 'fr' ? 'Acteurs de la société civile' : 'فاعلو المجتمع المدني'}
                </h3>
                <p className="text-gray-700">
                  {language === 'fr'
                    ? 'Organisations et militants travaillant dans le domaine des droits humains et cherchant à renforcer leurs capacités.'
                    : 'منظمات ونشطاء يعملون في مجال حقوق الإنسان ويسعون إلى تعزيز قدراتهم.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our History Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-teal-600 font-semibold mb-4">
              {language === 'fr' ? 'D\'OÙ NOUS VENONS' : 'من أين أتينا'}
            </div>
            <h2 className="text-4xl font-bold mb-6">
              {language === 'fr' ? 'Notre histoire' : 'تاريخنا'}
            </h2>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-16 bg-yellow-500"></div>
              <div className="h-1 w-16 bg-teal-500 ml-1"></div>
            </div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              {language === 'fr'
                ? 'Notre histoire est avant tout celle d\'un engagement collectif. Face aux défis persistants liés au respect des droits fondamentaux, nous avons choisi d\'unir nos expertises et nos convictions pour créer une structure indépendante, transparente et active. Depuis sa création, la Fondation œuvre pour renforcer la culture des droits humains, sensibiliser les citoyennes et citoyens à leurs droits et devoirs, et promouvoir une société fondée sur la loi, la justice et l\'égalité.'
                : 'اكتشف تطور مؤسسة تعزيز الحقوق منذ إنشائها والأحداث التي ميزت مسارها.'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-teal-500"></div>
            
            <div className="relative z-10 mb-24">
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute w-full h-px bg-teal-500"></div>
                <div className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-full z-10">
                  {language === 'fr' ? 'Février 2024' : 'فبراير 2024'}
                </div>
              </div>
              
              <div className="md:w-1/2 md:ml-auto md:pl-12 bg-white p-6 rounded-lg shadow-lg mb-12">
                <h3 className="text-2xl font-bold text-teal-600 mb-2">
                  {language === 'fr' ? 'Création officielle' : 'الإنشاء الرسمي'}
                </h3>
                <p className="text-gray-700">
                  {language === 'fr'
                    ? 'Fondation de l\'association le 14 février 2024 par un groupe de militants des droits humains et d\'avocats.'
                    : 'تأسيس الجمعية في 14 فبراير 2024 من قبل مجموعة من نشطاء حقوق الإنسان والمحامين.'}
                </p>
              </div>
              
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute w-full h-px bg-yellow-500"></div>
                <div className="bg-yellow-500 text-white font-semibold py-2 px-6 rounded-full z-10">
                  {language === 'fr' ? 'Mars 2024' : 'مارس 2024'}
                </div>
              </div>
              
              <div className="md:w-1/2 md:mr-auto md:pr-12 bg-white p-6 rounded-lg shadow-lg mb-12">
                <h3 className="text-2xl font-bold text-yellow-600 mb-2">
                  {language === 'fr' ? 'Notre équipe diverse' : 'فريقنا المتنوع'}
                </h3>
                <p className="text-gray-700 mb-4">
                  {language === 'fr'
                    ? 'Créée le 14 février 2024, la Fondation pour la promotion des droits est née de l\'initiative de militantes, militants et avocat(e)s engagé(e)s, forts d\'une longue expérience dans le domaine des droits humains. Constituée sous l\'égide de la loi 12/06 relative aux associations, notre Fondation s\'inscrit dans une dynamique citoyenne, juridique et sociale en faveur de la dignité humaine, de la justice et de l\'État de droit.'
                    : 'تأسست في 14 فبراير 2024، ولدت المؤسسة من اجل ترقية الحقوق من مبادرة ناشطين وناشطات ومحامين ملتزمين، يتمتعون بخبرة طويلة في مجال حقوق الإنسان. تأسست تحت رعاية القانون 12/06 المتعلق بالجمعيات، وتندرج مؤسستنا في ديناميكية مواطنة وقانونية واجتماعية لصالح الكرامة الإنسانية والعدالة وسيادة القانون.'}
                </p>
                <p className="text-gray-700">
                  {language === 'fr'
                    ? 'Notre histoire est avant tout celle d\'un engagement collectif. Face aux défis persistants liés au respect des droits fondamentaux, nous avons choisi d\'unir nos expertises et nos convictions pour créer une structure indépendante, transparente et active.'
                    : 'تاريخنا هو قبل كل شيء تاريخ التزام جماعي. في مواجهة التحديات المستمرة المرتبطة باحترام الحقوق الأساسية، اخترنا توحيد خبراتنا وقناعاتنا لإنشاء هيكل مستقل وشفاف ونشط.'}
                </p>
              </div>

              <div className="md:w-1/2 md:ml-auto md:pl-12 bg-white p-6 rounded-lg shadow-lg mb-12">
                <h3 className="text-2xl font-bold text-yellow-600 mb-2">
                  {language === 'fr' ? 'Premier programme de formation' : 'البرنامج التدريبي الأول'}
                </h3>
                <p className="text-gray-700">
                  {language === 'fr'
                    ? 'Lancement du premier cycle de formation sur les droits juridiques fondamentaux à Alger.'
                    : 'إطلاق الدورة التدريبية الأولى حول الحقوق القانونية الأساسية في الجزائر.'}
                </p>
              </div>
              
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute w-full h-px bg-orange-500"></div>
                <div className="bg-orange-500 text-white font-semibold py-2 px-6 rounded-full z-10">
                  {language === 'fr' ? 'Avril 2024' : 'أبريل 2024'}
                </div>
              </div>
              
              <div className="md:w-1/2 md:mr-auto md:pr-12 bg-white p-6 rounded-lg shadow-lg mb-12">
                <h3 className="text-2xl font-bold text-orange-600 mb-2">
                  {language === 'fr' ? 'Premier partenariat international' : 'أول شراكة دولية'}
                </h3>
                <p className="text-gray-700">
                  {language === 'fr'
                    ? 'Signature d\'un accord de collaboration avec une ONG internationale reconnue dans le domaine des droits humains.'
                    : 'توقيع اتفاقية تعاون مع منظمة غير حكومية دولية معترف بها في مجال حقوق الإنسان.'}
                </p>
              </div>
              
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute w-full h-px bg-teal-500"></div>
                <div className="bg-teal-500 text-white font-semibold py-2 px-6 rounded-full z-10">
                  {language === 'fr' ? 'Juin 2024' : 'يونيو 2024'}
                </div>
              </div>
              
              <div className="md:w-1/2 md:ml-auto md:pl-12 bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold text-teal-600 mb-2">
                  {language === 'fr' ? 'Lancement du site web' : 'إطلاق الموقع الإلكتروني'}
                </h3>
                <p className="text-gray-700">
                  {language === 'fr'
                    ? 'Mise en ligne de notre plateforme digitale pour amplifier notre impact et élargir notre audience.'
                    : 'إطلاق منصتنا الرقمية لتعزيز تأثيرنا وتوسيع جمهورنا.'}
                </p>
              </div>
              
              <div className="relative flex items-center justify-center mt-12">
                <div className="bg-gray-200 p-6 rounded-lg border-2 border-dashed border-gray-400">
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-gray-400 text-3xl">⌛</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {language === 'fr' ? 'À suivre...' : 'يتبع...'}
                  </h3>
                  <p className="text-gray-500">
                    {language === 'fr'
                      ? 'Notre histoire continue de s\'écrire. Rejoignez-nous dans ce parcours pour la défense et la promotion des droits fondamentaux.'
                      : 'ما زال تاريخنا قيد الكتابة. انضموا إلينا في هذه الرحلة للدفاع عن وتعزيز الحقوق الأساسية.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Director's Message */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-teal-600 font-semibold mb-4">
              {language === 'fr' ? 'NOTRE DIRECTION' : 'إدارتنا'}
            </div>
            <h2 className="text-4xl font-bold mb-6">
              {language === 'fr' ? 'Mot du Gérant' : 'كلمة المدير'}
            </h2>
            <div className="flex justify-center mb-8">
              <div className="h-1 w-16 bg-yellow-500"></div>
              <div className="h-1 w-16 bg-teal-500 ml-1"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="md:col-span-1">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="h-72 bg-gradient-to-b from-gray-100 to-gray-300 flex items-center justify-center">
                  <img src="/images/zakaria.jpg" alt="Zakaria Benlahrech" className="w-full h-full object-cover" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Zakaria Benlahrech</h3>
                  <p className="text-gray-600 mb-6">
                    {language === 'fr' ? 'Avocat et défenseur des droits humains' : 'محام ومدافع عن حقوق الإنسان'}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white hover:bg-teal-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white hover:bg-yellow-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.057 10.057 0 01-3.127 1.184A4.92 4.92 0 0016.5 2.5a4.923 4.923 0 00-4.923 4.923c0 .39.044.768.128 1.126a13.98 13.98 0 01-10.14-5.147 4.897 4.897 0 00-.665 2.474c0 1.71.87 3.213 2.188 4.096a4.913 4.913 0 01-2.228-.616v.06a4.924 4.924 0 003.946 4.828 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209-.005-.418-.014-.629a9.936 9.936 0 002.46-2.548l-.047-.02z"/>
                      </svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-teal-500 text-white p-6 rounded-lg shadow-lg mt-8">
                <p className="italic text-lg">
                  {language === 'fr'
                    ? "La loi est un outil de protection, non de répression ; un instrument d'équilibre, non de pouvoir."
                    : "القانون أداة للحماية، وليس للقمع؛ أداة للتوازن، وليس للسلطة."}
                </p>
                <p className="text-right mt-2">— Zakaria Benlahrech</p>
              </div>
            </div>
            
            <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-teal-600 mb-6">
                {language === 'fr' ? 'Chères amies, chers amis,' : 'أصدقائي الأعزاء،'}
              </h3>
              <p className="text-gray-500 italic mb-4">
                {language === 'fr' ? 'Un message de notre fondateur' : 'رسالة من مؤسسنا'}
              </p>
              
              <p className="text-gray-700 mb-4">
                {language === 'fr'
                  ? "C'est avec une grande fierté et une profonde conviction que je vous adresse ces quelques mots en tant que gérant de la Fondation pour la promotion des droits."
                  : "بكل فخر وقناعة عميقة أخاطبكم بهذه الكلمات القليلة كمدير لمؤسسة تعزيز الحقوق."}
              </p>
              
              <p className="text-gray-700 mb-4">
                {language === 'fr'
                  ? "Notre monde traverse une période où les droits fondamentaux sont souvent remis en question, ignorés, voire bafoués. Face à ces défis, il est impératif de ne pas rester silencieux. C'est cette urgence qui a motivé, avec mes collègues militants et avocats, la création de cette Fondation : un espace d'action, de veille et d'engagement en faveur de la justice, de la dignité et de l'État de droit."
                  : "يمر عالمنا بفترة يتم فيها غالبًا التشكيك في الحقوق الأساسية أو تجاهلها أو حتى انتهاكها. في مواجهة هذه التحديات، من الضروري عدم البقاء صامتين. هذه الضرورة هي التي دفعتني، مع زملائي الناشطين والمحامين، إلى إنشاء هذه المؤسسة: مساحة للعمل والمراقبة والالتزام بالعدالة والكرامة وسيادة القانون."}
              </p>
              
              <p className="text-gray-700 mb-8">
                {language === 'fr'
                  ? "Notre Fondation est née d'un combat de terrain, d'une volonté collective d'apporter une contribution concrète à l'édification d'une société plus équitable, plus libre, et plus humaine. Elle se veut une passerelle entre le droit et la citoyenneté, entre la justice et la conscience."
                  : "ولدت مؤسستنا من نضال ميداني، من إرادة جماعية لتقديم مساهمة ملموسة في بناء مجتمع أكثر إنصافًا وحرية وإنسانية. إنها تهدف إلى أن تكون جسرًا بين القانون والمواطنة، بين العدالة والضمير."}
              </p>
              
              <div className="border-l-4 border-teal-500 pl-4 mb-8">
                <p className="text-gray-700 mb-4">
                  {language === 'fr'
                    ? "En tant qu'avocat et défenseur des droits humains, je reste convaincu que seule une mobilisation citoyenne consciente et informée peut permettre des avancées durables. Nous croyons en la force de l'engagement, en la puissance de la parole, mais surtout en l'efficacité de l'action."
                    : "بصفتي محاميًا ومدافعًا عن حقوق الإنسان، ما زلت مقتنعًا بأن التعبئة المواطنية الواعية والمطلعة وحدها هي التي يمكن أن تحقق تقدمًا مستدامًا. نحن نؤمن بقوة الالتزام، بقوة الكلمة، ولكن قبل كل شيء بفعالية العمل."}
                </p>
              </div>
              
              <p className="text-gray-700 mb-4">
                {language === 'fr'
                  ? "Je vous invite à nous rejoindre, à soutenir nos initiatives, et à faire entendre votre voix pour que la justice ne soit pas un privilège, mais un droit partagé par toutes et tous."
                  : "أدعوكم للانضمام إلينا، ودعم مبادراتنا، والتعبير عن صوتكم حتى لا تكون العدالة امتيازًا، بل حقًا يتشاركه الجميع."}
              </p>
              
              <p className="text-gray-700 mb-6">
                {language === 'fr'
                  ? "Ensemble pour des droits connus, reconnus et défendus."
                  : "معًا من أجل حقوق معروفة ومعترف بها ومدافع عنها."}
              </p>
              
              <p className="text-teal-600 mb-2">
                {language === 'fr' ? "Avec respect et détermination," : "مع كل الاحترام والتصميم،"}
              </p>
              
              <div className="flex items-center">
                <svg viewBox="0 0 100 50" className="h-8 text-teal-500 mr-2">
                  <path fill="currentColor" d="M10 25C10 25 20 10 30 25C40 40 50 10 60 25C70 40 80 10 90 25"/>
                </svg>
                <span className="text-xl font-bold">Zakaria Benlahrech</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Decorative elements */}
        <motion.div 
          className="absolute left-1/3 bottom-1/3 w-40 h-40 rounded-full bg-[#8FD694]/10 blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "mirror" 
          }}
        />
        <motion.div 
          className="absolute right-1/4 top-1/3 w-32 h-32 rounded-full bg-[#FF8A00]/10 blur-xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            repeatType: "mirror",
            delay: 1
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <Newsletter />
          </motion.div>
        </div>
      </section>
    </div>
  );
} 