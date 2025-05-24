'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useInView, useSpring, useTransform } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaCalendarAlt, FaUser, FaArrowRight, FaRegNewspaper, FaCheckCircle } from 'react-icons/fa';
import { getPageContent, PageContent } from '@/lib/database';

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

const newsItems = [
  {
    id: 1,
    title: {
      fr: 'Journée internationale des droits des migrants',
      ar: 'اليوم العالمي لحقوق المهاجرين'
    },
    date: {
      fr: '18 décembre 2023',
      ar: '18 ديسمبر 2023'
    },
    author: {
      fr: 'Équipe de Sensibilisation',
      ar: 'فريق التوعية'
    },
    category: {
      fr: 'Rapports',
      ar: 'تقارير'
    },
    excerpt: {
      fr: 'À l\'occasion de la Journée internationale des droits des migrants, nous mettons en lumière les défis et les avancées concernant la protection des droits des personnes migrantes en Algérie et dans la région.',
      ar: 'بمناسبة اليوم العالمي لحقوق المهاجرين، نسلط الضوء على التحديات والتقدم المحرز في حماية حقوق المهاجرين في الجزائر والمنطقة.'
    },
    image: '/images/report/report.jpg',
    slug: '/news/journee-internationale-droits-migrants'
  },
  {
    id: 2,
    title: {
      fr: 'Formation sur les Droits Fondamentaux',
      ar: 'تدريب على الحقوق الأساسية'
    },
    date: {
      fr: '25 août 2023',
      ar: '25 أغسطس 2023'
    },
    author: {
      fr: 'Équipe de Formation',
      ar: 'فريق التدريب'
    },
    category: {
      fr: 'Formation',
      ar: 'تدريب'
    },
    excerpt: {
      fr: 'Nouvelle session de formation prévue à Alger pour les défenseurs des droits, axée sur les mécanismes de protection internationale.',
      ar: 'دورة تدريبية جديدة مخططة في الجزائر العاصمة للمدافعين عن الحقوق، تركز على آليات الحماية الدولية.'
    },
    image: '/images/programs/rights-education.jpg',
    slug: '/news/formation-droits-fondamentaux'
  },
  {
    id: 3,
    title: {
      fr: 'Collaboration avec des ONG Internationales',
      ar: 'التعاون مع المنظمات غير الحكومية الدولية'
    },
    date: {
      fr: '10 août 2023',
      ar: '10 أغسطس 2023'
    },
    author: {
      fr: 'Équipe des Partenariats',
      ar: 'فريق الشراكات'
    },
    category: {
      fr: 'Partenariats',
      ar: 'شراكات'
    },
    excerpt: {
      fr: 'Un nouveau partenariat stratégique avec des organisations internationales pour renforcer la promotion des droits.',
      ar: 'شراكة استراتيجية جديدة مع منظمات دولية لتعزيز تعزيز الحقوق.'
    },
    image: '/images/programs/advocacy.jpg',
    slug: '/news/collaboration-ong-internationales'
  },
  {
    id: 4,
    title: {
      fr: 'Table Ronde sur les Réformes Juridiques',
      ar: 'طاولة مستديرة حول الإصلاحات القانونية'
    },
    date: {
      fr: '5 août 2023',
      ar: '5 أغسطس 2023'
    },
    author: {
      fr: 'Équipe des Événements',
      ar: 'فريق الفعاليات'
    },
    category: {
      fr: 'Événements',
      ar: 'فعاليات'
    },
    excerpt: {
      fr: 'Une journée d\'étude consacrée aux récentes réformes juridiques et à leur impact sur les droits des citoyens.',
      ar: 'يوم دراسي مخصص للإصلاحات القانونية الأخيرة وتأثيرها على حقوق المواطنين.'
    },
    image: '/images/law/justice-law-scales.jpg',
    slug: '/news/table-ronde-reformes-juridiques'
  }
];

const categories = [
  { fr: 'Tous', ar: 'الكل' },
  { fr: 'Formation', ar: 'تدريب' },
  { fr: 'Rapports', ar: 'تقارير' },
  { fr: 'Partenariats', ar: 'شراكات' },
  { fr: 'Événements', ar: 'فعاليات' }
];

const keyPoints = [
  { fr: 'Analyse de la situation des migrants', ar: 'تحليل وضع المهاجرين' },
  { fr: 'Mécanismes de protection disponibles', ar: 'آليات الحماية المتاحة' },
  { fr: 'Recommandations pour l\'amélioration', ar: 'توصيات للتحسين' }
];

export default function NewsSection() {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(categories[0].fr);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end end"]
  });
  
  const [sectionTitle, setSectionTitle] = useState(language === 'ar' ? 'أخبار حديثة' : 'Actualités Récentes');
  const [sectionDesc, setSectionDesc] = useState(language === 'ar' 
    ? 'اكتشف أحدث المعلومات حول أنشطتنا ومشاريعنا والتزاماتنا.'
    : 'Découvrez les dernières informations sur nos activités, projets et engagements.');
  const [updateLabel, setUpdateLabel] = useState(language === 'ar' ? 'آخر التحديثات' : 'Dernières mises à jour');

  const loadContent = async () => {
    try {
      // Get the page content for the news section configuration
      const content = await getPageContent('home');
      if (content) {
        console.log('NewsSection - Loading content, available sections:', content.sections.map(s => s.id));
        
        // Find the actualites section by checking multiple possible IDs
        const actualitesSection = content.sections.find(section => 
          section.id === '10' || 
          section.id === 'section_10' || 
          section.id === 'actualites' ||
          (section.title && (
            section.title.fr?.toLowerCase().includes('actualités') || 
            section.title.ar?.includes('أخبار')
          ))
        );
        
        if (actualitesSection) {
          console.log('NewsSection - Found section:', actualitesSection.title, actualitesSection.content);
          
          // Set the section title and description
          setSectionTitle(actualitesSection.title?.[language] || (language === 'ar' ? 'أخبار حديثة' : 'Actualités Récentes'));
          setSectionDesc(actualitesSection.content?.[language] || 
            (language === 'ar' 
              ? 'اكتشف أحدث المعلومات حول أنشطتنا ومشاريعنا والتزاماتنا.'
              : 'Découvrez les dernières informations sur nos activités, projets et engagements.')
          );
          
          // Check if there's metadata for the updates label
          if (actualitesSection.metadata?.updateLabel) {
            setUpdateLabel(actualitesSection.metadata.updateLabel[language] || 
              (language === 'ar' ? 'آخر التحديثات' : 'Dernières mises à jour'));
          }
        } else {
          console.log('NewsSection - Section not found!');
        }
      } else {
        console.log('NewsSection - No content found for home page');
      }
    } catch (error) {
      console.error('NewsSection - Error loading content:', error);
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
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const filteredNews = activeCategory === categories[0].fr || activeCategory === categories[0].ar
    ? newsItems 
    : newsItems.filter(item => 
        item.category.fr === activeCategory || 
        item.category.ar === activeCategory
      );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 12 
      } 
    }
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.7 
      } 
    }
  };

  return (
    <section 
      ref={ref} 
      className="py-24 relative overflow-hidden bg-light" 
      id="section_10"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute -top-10 right-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <pattern id="news-pattern" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(10)">
            <rect width="1" height="70" fill="#2AA084" fillOpacity="0.3" x="0" y="0"></rect>
            <rect width="70" height="1" fill="#2AA084" fillOpacity="0.3" x="0" y="0"></rect>
          </pattern>
          <rect width="100%" height="100%" fill="url(#news-pattern)" />
        </svg>
        
        {/* Animated background shapes */}
        <motion.div 
          className="absolute -top-40 left-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
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
          className="absolute -bottom-40 right-0 w-80 h-80 rounded-full bg-accent/5 blur-3xl"
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
      
      <div className="container mx-auto px-4 relative z-10" ref={scrollRef}>
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="mb-3">
            <span className="inline-block text-sm font-semibold text-orange px-3 py-1 rounded-full bg-orange/10 mb-3">
              {updateLabel}
            </span>
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-secondary mb-6 relative inline-block">
            {sectionTitle}
            <div className="absolute -bottom-2 left-0 right-0 mx-auto w-24 h-1.5 bg-orange rounded-full"></div>
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-gray-600 max-w-2xl mx-auto text-lg">
            {sectionDesc}
          </motion.p>
          
          {/* Animated scroll progress indicator */}
          <motion.div 
            className="w-32 h-1 bg-gray-200 rounded-full mx-auto mt-10 overflow-hidden" 
            variants={itemVariants}
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-orange to-orange-light"
              style={{ scaleX, transformOrigin: "0%" }}
            />
          </motion.div>
        </motion.div>
        
        {/* Featured news */}
        <motion.div 
          variants={fadeInUpVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              className="lg:col-span-2 bg-white rounded-2xl overflow-hidden shadow-xl group relative"
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
            >
              {/* YouTube video embed instead of image */}
              <div className="relative h-96 overflow-hidden">
                <iframe 
                  src="https://www.youtube.com/embed/ne8ZEXcXa6A" 
                  title={language === 'ar' ? newsItems[0].title.ar : newsItems[0].title.fr}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
                
                {/* Category badge */}
                <div className="absolute top-6 left-6 z-10">
                  <motion.span 
                    className="inline-flex items-center bg-orange text-white px-4 py-2 text-sm font-semibold rounded-full shadow-orange"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <FaRegNewspaper className="mr-2" size={14} />
                    {language === 'ar' ? newsItems[0].category.ar : newsItems[0].category.fr}
                  </motion.span>
                </div>
              </div>
              
              <div className="p-8 relative">
                {/* Decorative corner accent */}
                <div className="absolute w-32 h-32 -right-16 -bottom-16 rounded-full bg-primary/5"></div>
                
                <h3 className="text-3xl font-bold mb-4 text-secondary group-hover:text-primary transition-colors duration-300">
                  {language === 'ar' ? newsItems[0].title.ar : newsItems[0].title.fr}
                </h3>
                
                <div className="flex items-center text-sm text-gray-500 mb-5 space-x-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-primary mr-2" size={14} />
                    <span>{language === 'ar' ? newsItems[0].date.ar : newsItems[0].date.fr}</span>
                  </div>
                  <div className="flex items-center">
                    <FaUser className="text-primary mr-2" size={14} />
                    <span>{language === 'ar' ? newsItems[0].author.ar : newsItems[0].author.fr}</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                  {language === 'ar' ? newsItems[0].excerpt.ar : newsItems[0].excerpt.fr}
                </p>
                
                <div className="mb-8 bg-light p-6 rounded-2xl backdrop-blur-sm shadow-inner">
                  <h4 className="font-semibold mb-4 text-secondary flex items-center">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white mr-3">
                      <FaCheckCircle size={14} />
                    </span>
                    {language === 'ar' ? 'النقاط الرئيسية للتقرير:' : 'Points clés du rapport:'}
                  </h4>
                  
                  <ul className="space-y-3">
                    {keyPoints.map((point, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-center group/item" 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (index * 0.1) }}
                        whileHover={{ x: 5 }}
                      >
                        <div className="w-6 h-6 rounded-full bg-accent/20 text-primary flex items-center justify-center mr-3 transform transition-transform duration-300 group-hover/item:scale-110">
                          <FaCheckCircle size={12} />
                        </div>
                        <span className="text-gray-700 group-hover/item:text-primary transition-colors duration-300">
                          {language === 'ar' ? point.ar : point.fr}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                
                <motion.div 
                  className="inline-block"
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href={newsItems[0].slug} 
                    className="btn-orange group flex items-center"
                  >
                    <span>{language === 'ar' ? 'قراءة المزيد' : 'En savoir plus'}</span>
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <FaArrowRight size={14} />
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
            
            <div className="space-y-6">
              {/* Categories */}
              <motion.div 
                className="bg-white p-7 rounded-2xl shadow-lg"
                variants={itemVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
              >
                <h3 className="font-bold text-xl mb-5 text-secondary flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange to-orange-light flex items-center justify-center text-white shadow-orange mr-3">
                    <span className="text-xs font-bold">+</span>
                  </div>
                  {language === 'ar' ? 'الفئات' : 'Catégories'}
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {categories.map((category, idx) => (
                    <motion.button
                      key={language === 'ar' ? category.ar : category.fr}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeCategory === (language === 'ar' ? category.ar : category.fr)
                          ? 'bg-gradient-to-r from-orange to-orange-light text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveCategory(language === 'ar' ? category.ar : category.fr)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (idx * 0.05) }}
                    >
                      {language === 'ar' ? category.ar : category.fr}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
              
              {/* Newsletter */}
              <motion.div 
                className="bg-gradient-to-br from-secondary to-secondary/90 p-7 rounded-2xl text-white shadow-xl relative overflow-hidden"
                variants={itemVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {/* Decorative elements */}
                <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-accent/10 blur-xl"></div>
                <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-primary/10 blur-xl"></div>
                
                <h3 className="font-bold text-xl mb-2 text-white relative z-10">
                  {language === 'ar' ? 'اشترك في نشرتنا الإخبارية' : 'Abonnez-vous à notre newsletter'}
                </h3>
                
                <p className="text-white/90 mb-5 relative z-10">
                  {language === 'ar' ? 'ابق على اطلاع بأحدث أخبارنا وفعالياتنا' : 'Restez informé de nos dernières actualités et événements'}
                </p>
                
                <div className="relative z-10">
                  <div className="flex rounded-full overflow-hidden border-2 border-white/20 bg-white/10 backdrop-blur-sm p-1">
                    <input 
                      type="email" 
                      placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Votre email'} 
                      className="flex-1 px-4 py-2.5 bg-transparent text-white placeholder-white/50 focus:outline-none text-sm"
                    />
                    <motion.button 
                      className="bg-primary hover:bg-accent px-5 py-2.5 rounded-full text-white font-medium transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="sr-only">{language === 'ar' ? 'إرسال' : 'Envoyer'}</span>
                      <FaArrowRight size={14} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* News grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {filteredNews.slice(1).map((newsItem, index) => (
            <motion.div 
              key={newsItem.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-lg group relative"
              variants={itemVariants}
              custom={index}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
            >
              <div className="h-52 relative overflow-hidden">
                <Image
                  src={
                    newsItem.category.fr === 'Formation' 
                      ? '/images/news/formation.jpg' 
                      : newsItem.category.fr === 'Partenariats' 
                        ? '/images/news/partenariats.jpg' 
                        : newsItem.category.fr === 'Événements'
                          ? '/images/news/evenements.jpg'
                          : '/images/law/justice-law-scales.jpg'
                  }
                  alt={language === 'ar' ? newsItem.title.ar : newsItem.title.fr}
                  fill
                  style={{objectFit: "cover"}}
                  className="transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/40 to-transparent"></div>
                
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-block bg-white text-primary px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm transform transition-transform duration-300 group-hover:scale-105">
                    {language === 'ar' ? newsItem.category.ar : newsItem.category.fr}
                  </span>
                </div>
                
                {/* Date */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 text-xs font-medium rounded-full">
                    <FaCalendarAlt className="mr-1.5" size={10} />
                    {language === 'ar' ? newsItem.date.ar : newsItem.date.fr}
                  </span>
                </div>
              </div>
              
              <div className="p-6 relative">
                {/* Decorative corner accent */}
                <div className="absolute w-24 h-24 -right-12 -bottom-12 rounded-full bg-primary/5"></div>
                
                <h3 className="text-xl font-bold mb-4 text-secondary group-hover:text-primary transition-colors duration-300">
                  {language === 'ar' ? newsItem.title.ar : newsItem.title.fr}
                </h3>
                
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {language === 'ar' ? newsItem.excerpt.ar : newsItem.excerpt.fr}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-xs text-gray-500">
                    <FaUser className="text-primary/70 mr-1.5" size={12} />
                    <span>{language === 'ar' ? newsItem.author.ar : newsItem.author.fr}</span>
                  </div>
                  
                  <Link 
                    href={newsItem.slug} 
                    className="inline-flex items-center font-semibold text-primary hover:text-accent transition-colors duration-300 group/link"
                  >
                    <span>{language === 'ar' ? 'قراءة المزيد' : 'Lire la suite'}</span>
                    <motion.div
                      className="ml-1.5 transform transition-transform duration-300 group-hover/link:translate-x-1"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <FaArrowRight size={12} />
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* View All News CTA */}
        <motion.div 
          className="mt-16 text-center"
          variants={fadeInUpVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/news" 
              className="inline-flex items-center btn-orange group"
            >
              <span>{language === 'ar' ? 'جميع الأخبار' : 'Toutes les actualités'}</span>
              <motion.div
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaArrowRight size={14} />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 