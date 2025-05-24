'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaQuoteLeft, FaRegCalendarAlt, FaStar, FaPaperPlane, FaUserCircle, FaBuilding, FaEnvelope } from 'react-icons/fa';
import PageHeader from '@/components/PageHeader';
import { getPageContent, PageContent } from '@/lib/database';
import Newsletter from '@/components/Newsletter';
import { motion } from 'framer-motion';

type Language = 'fr' | 'ar';

interface TranslatedText {
  fr: string;
  ar: string;
}

interface Category {
  id: string;
  fr: string;
  ar: string;
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

export default function TestimonialsPage() {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  const loadContent = async () => {
    try {
      const content = await getPageContent('testimonials');
      
      if (content) {
        console.log('Testimonials page - Content loaded with sections:', 
          content.sections.map(s => `${s.id}: ${s.title?.fr}`).join(', '));
        setPageContent(content);
        // Force re-render by incrementing the refresh counter
        setForceRefresh(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading testimonials page content:', error);
    }
  };
  
  useEffect(() => {
    setIsClient(true);
    
    // Initial content load
    loadContent();
    
    // Add event listeners for content updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'page_testimonials') {
        console.log('Testimonials page - Storage change detected');
        loadContent();
      }
    };
    
    const handleContentUpdated = () => {
      console.log('Testimonials page - Content updated event received');
      loadContent();
    };
    
    // Listen for direct localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for our custom content updated event
    window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
    };
  }, []);
  
  // When the language changes, we should refresh the content too
  useEffect(() => {
    console.log('Testimonials page - Language changed, refreshing content');
    // This forces a re-render with the new language
    setForceRefresh(prev => prev + 1);
  }, [language]);
  
  // Get section content by id
  const getSectionContent = (sectionId: string, defaultText: string) => {
    if (!pageContent || !pageContent.sections) return defaultText;
    
    const section = pageContent.sections.find(s => s.id === sectionId);
    if (!section) return defaultText;
    
    return section.content?.[language as 'fr' | 'ar'] || defaultText;
  };

  // Get section title by id
  const getSectionTitle = (sectionId: string, defaultText: string) => {
    if (!pageContent || !pageContent.sections) return defaultText;
    
    const section = pageContent.sections.find(s => s.id === sectionId);
    if (!section || !section.title) return defaultText;
    
    return section.title[language as 'fr' | 'ar'] || defaultText;
  };
  
  // Get text aligned correctly based on language
  const textAlign = language === 'ar' ? 'text-right' : 'text-left';
  const rtlClass = language === 'ar' ? 'rtl' : '';
  const flexDirection = language === 'ar' ? 'flex-row-reverse' : 'flex-row';

  // Categories
  const categories: Category[] = [
    { id: 'all', fr: 'Tous', ar: 'الكل' },
    { id: 'beneficiaries', fr: 'Bénéficiaires', ar: 'المستفيدون' },
    { id: 'partners', fr: 'Partenaires', ar: 'الشركاء' },
    { id: 'volunteers', fr: 'Volontaires', ar: 'المتطوعون' },
    { id: 'experts', fr: 'Experts', ar: 'الخبراء' }
  ];

  // Get categories from content if available
  const getCategoriesFromContent = () => {
    const categoriesSection = pageContent?.sections.find(s => s.id === 'categories');
    if (!categoriesSection || !categoriesSection.content) return categories;
    
    const categoriesText = categoriesSection.content[language as 'fr' | 'ar'] || '';
    const lines = categoriesText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return categories;
    
    return lines.map((line, index) => {
      const id = index === 0 ? 'all' : line.toLowerCase().replace(/\s+/g, '_');
      return {
        id,
        fr: language === 'fr' ? line : '',
        ar: language === 'ar' ? line : ''
      };
    });
  };

  const displayCategories = getCategoriesFromContent();

  return (
    <div className={rtlClass} key={`testimonials-${forceRefresh}`} suppressHydrationWarning>
      {/* Page Header */}
      <PageHeader 
        title={pageContent?.title?.[language as 'fr' | 'ar'] || 
          (language === 'fr' ? 'Témoignages' : 'الشهادات')}
        subtitle={getSectionContent('intro', 
          language === 'fr' 
          ? 'Découvrez ce que nos bénéficiaires, partenaires et volontaires disent de notre travail' 
          : 'اكتشف ما يقوله المستفيدون وشركاؤنا ومتطوعونا عن عملنا')}
        language={language as 'fr' | 'ar'}
      />

      {/* Breadcrumbs */}
      <div className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className={`flex items-center text-gray-500 text-sm ${language === 'ar' ? 'justify-end' : ''}`}>
            <Link href="/" className="hover:text-primary transition-colors">
              {language === 'fr' ? 'Accueil' : 'الرئيسية'}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium">
              {pageContent?.title?.[language as 'fr' | 'ar'] || 
                (language === 'fr' ? 'Témoignages' : 'الشهادات')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className={`mb-16 text-center ${textAlign}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6 relative inline-block">
              {getSectionTitle('header', 
                language === 'fr' ? 'Ce qu\'ils disent de nous' : 'ما يقولونه عنا')}
              <div className="w-full h-1 bg-gradient-to-r from-primary to-orange absolute bottom-[-6px] left-0"></div>
            </h2>
            
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              {getSectionContent('header', 
                language === 'fr' 
                ? 'Voici les témoignages de personnes et d\'organisations qui ont bénéficié de nos programmes et collaboré avec nous.' 
                : 'فيما يلي شهادات من الأشخاص والمنظمات التي استفادت من برامجنا وتعاونت معنا.')}
            </p>
          </motion.div>
          
          {/* Category Filters */}
          <motion.div 
            className="mb-12 flex flex-wrap gap-3 justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {displayCategories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full transition-all transform hover:scale-105 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-primary to-[#8FD694] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-primary/50 hover:shadow-sm'
                }`}
                variants={fadeIn}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {language === 'fr' ? category.fr : category.ar}
              </motion.button>
            ))}
          </motion.div>
          
          {/* Coming Soon Message */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-12 text-center mb-16 relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-primary/5 rounded-br-3xl"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#8FD694]/5 rounded-tl-3xl"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange/5 rounded-full blur-xl"></div>
            
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-[#8FD694]/20 rounded-full flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-[#8FD694]/10 animate-pulse"></div>
              <FaQuoteLeft className="text-primary text-4xl relative z-10" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
              {getSectionTitle('coming_soon', 
                language === 'fr' ? 'Témoignages à venir' : 'شهادات قادمة')}
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">
              {getSectionContent('coming_soon', 
                language === 'fr' 
                ? 'Nous sommes en train de recueillir des témoignages de nos bénéficiaires, partenaires et volontaires. Revenez bientôt pour découvrir leurs expériences avec notre fondation.' 
                : 'نحن نجمع الشهادات من المستفيدين وشركائنا ومتطوعينا. عد قريبًا لاكتشاف تجاربهم مع مؤسستنا.')}
            </p>
            <div className="flex justify-center">
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    className="text-orange text-2xl"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Share Your Experience Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className={`text-center mb-12 ${textAlign}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4 relative inline-block">
                {getSectionTitle('share', 
                  language === 'fr' ? 'Partagez votre expérience' : 'شارك تجربتك')}
                <div className="w-full h-1 bg-gradient-to-r from-[#8FD694] to-orange absolute bottom-[-6px] left-0"></div>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {getSectionContent('share', 
                  language === 'fr' 
                  ? 'Avez-vous participé à l\'un de nos programmes ou collaboré avec nous ? Nous serions ravis d\'entendre votre histoire.' 
                  : 'هل شاركت في أحد برامجنا أو تعاونت معنا؟ يسعدنا سماع قصتك.')}
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-10 shadow-lg relative overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange/5 rounded-tr-full"></div>
              
              <form className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-gray-700 font-medium mb-2 ${textAlign}`}>
                      {language === 'fr' ? 'Nom complet' : 'الاسم الكامل'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUserCircle className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        className={`w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD694] focus:border-transparent transition-all outline-none ${textAlign}`}
                        placeholder={language === 'fr' ? 'Votre nom' : 'اسمك'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-gray-700 font-medium mb-2 ${textAlign}`}>
                      {language === 'fr' ? 'Email' : 'البريد الإلكتروني'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input 
                        type="email" 
                        className={`w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD694] focus:border-transparent transition-all outline-none ${textAlign}`}
                        placeholder={language === 'fr' ? 'Votre email' : 'بريدك الإلكتروني'}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-gray-700 font-medium mb-2 ${textAlign}`}>
                      {language === 'fr' ? 'Organisation' : 'المنظمة'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBuilding className="text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        className={`w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD694] focus:border-transparent transition-all outline-none ${textAlign}`}
                        placeholder={language === 'fr' ? 'Votre organisation' : 'منظمتك'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-gray-700 font-medium mb-2 ${textAlign}`}>
                      {language === 'fr' ? 'Rôle / Fonction' : 'الدور / الوظيفة'}
                    </label>
                    <input 
                      type="text" 
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD694] focus:border-transparent transition-all outline-none ${textAlign}`}
                      placeholder={language === 'fr' ? 'Votre rôle' : 'دورك'}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-gray-700 font-medium mb-2 ${textAlign}`}>
                    {language === 'fr' ? 'Votre expérience avec nous' : 'تجربتك معنا'}
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <FaQuoteLeft className="text-gray-400" />
                    </div>
                    <textarea 
                      rows={5}
                      className={`w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8FD694] focus:border-transparent transition-all outline-none ${textAlign}`}
                      placeholder={language === 'fr' ? 'Partagez votre expérience en détail...' : 'شارك تجربتك بالتفصيل...'}
                    ></textarea>
                  </div>
                </div>
                
                <div className="text-center py-4">
                  <p className={`mb-3 font-medium ${textAlign}`}>
                    {language === 'fr' ? 'Votre évaluation' : 'تقييمك'}
                  </p>
                  <div className="flex justify-center space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => setRating(i + 1)}
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-2xl focus:outline-none transition-transform transform hover:scale-110"
                      >
                        <FaStar 
                          className={`${
                            (hoverRating || rating) > i 
                              ? 'text-orange' 
                              : 'text-gray-300'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-primary to-[#8FD694] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center mx-auto"
                  >
                    <FaPaperPlane className="mr-2" />
                    {language === 'fr' ? 'Soumettre votre témoignage' : 'إرسال شهادتك'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
} 