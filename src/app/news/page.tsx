'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaRegCalendarAlt, FaUser, FaTag, FaSearch } from 'react-icons/fa';
import PageHeader from '@/components/PageHeader';
import { getPageContent, PageContent } from '@/lib/database';
import Newsletter from '@/components/Newsletter';
import { motion } from 'framer-motion';

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

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

type Language = 'fr' | 'ar';

interface TranslatedText {
  fr: string;
  ar: string;
}

interface NewsItem {
  id: number;
  title: TranslatedText;
  date: TranslatedText;
  author: TranslatedText;
  category: TranslatedText;
  excerpt: TranslatedText;
  image: string;
  slug: string;
  content: string;
}

interface Category {
  id: string;
  fr: string;
  ar: string;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: {
      fr: 'Publication du Rapport Annuel 2023',
      ar: 'نشر التقرير السنوي 2023'
    },
    date: {
      fr: '18 août 2023',
      ar: '18 أغسطس 2023'
    },
    author: {
      fr: 'Équipe de recherche',
      ar: 'فريق البحث'
    },
    category: {
      fr: 'Rapports',
      ar: 'تقارير'
    },
    excerpt: {
      fr: 'Notre rapport annuel sur l\'état des droits est désormais disponible. Ce document de référence présente une analyse détaillée des avancées et des défis en matière de droits humains au cours de l\'année écoulée.',
      ar: 'تقريرنا السنوي عن حالة الحقوق متاح الآن. تقدم هذه الوثيقة المرجعية تحليلاً مفصلاً للتقدم والتحديات في مجال حقوق الإنسان خلال العام الماضي.'
    },
    image: '/images/report/report.jpg',
    slug: '/news/rapport-annuel-2023',
    content: 'Texte de contenu à remplir pour cet article.'
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
      fr: 'Équipe de formation',
      ar: 'فريق التدريب'
    },
    category: {
      fr: 'Formation',
      ar: 'تدريب'
    },
    excerpt: {
      fr: 'Nouvelle session de formation prévue dans la ville pour les défenseurs des droits, axée sur les mécanismes de protection internationaux.',
      ar: 'دورة تدريبية جديدة مخططة في المدينة للمدافعين عن الحقوق، تركز على آليات الحماية الدولية.'
    },
    image: '/images/news/formation.jpg',
    slug: '/news/formation-droits-fondamentaux',
    content: 'Texte de contenu à remplir pour cet article.'
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
      fr: 'Équipe des partenariats',
      ar: 'فريق الشراكات'
    },
    category: {
      fr: 'Partenariats',
      ar: 'شراكات'
    },
    excerpt: {
      fr: 'Un nouveau partenariat stratégique avec des organisations internationales pour renforcer la promotion des droits.',
      ar: 'شراكة استراتيجية جديدة مع منظمات دولية لتعزيز الحقوق.'
    },
    image: '/images/news/partenariats.jpg',
    slug: '/news/collaboration-ong-internationales',
    content: 'Texte de contenu à remplir pour cet article.'
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
      fr: 'Équipe des événements',
      ar: 'فريق الفعاليات'
    },
    category: {
      fr: 'Événements',
      ar: 'فعاليات'
    },
    excerpt: {
      fr: 'Une journée d\'étude dédiée aux récentes réformes juridiques et à leur impact sur les droits des citoyens.',
      ar: 'يوم دراسي مخصص للإصلاحات القانونية الأخيرة وتأثيرها على حقوق المواطنين.'
    },
    image: '/images/news/evenements.jpg',
    slug: '/news/table-ronde-reformes-juridiques',
    content: 'Texte de contenu à remplir pour cet article.'
  },
  {
    id: 5,
    title: {
      fr: 'Lancement de l\'Initiative Droits des Jeunes',
      ar: 'إطلاق مبادرة حقوق الشباب'
    },
    date: {
      fr: '28 juillet 2023',
      ar: '28 يوليو 2023'
    },
    author: {
      fr: 'Équipe des programmes',
      ar: 'فريق البرامج'
    },
    category: {
      fr: 'Programmes',
      ar: 'برامج'
    },
    excerpt: {
      fr: 'Une nouvelle initiative visant à éduquer les jeunes sur leurs droits et à encourager leur engagement civique.',
      ar: 'مبادرة جديدة تهدف إلى تثقيف الشباب حول حقوقهم وتشجيع مشاركتهم المدنية.'
    },
    image: '/images/programs/rights-education.jpg',
    slug: '/news/initiative-droits-jeunes',
    content: 'Texte de contenu à remplir pour cet article.'
  },
  {
    id: 6,
    title: {
      fr: 'Conférence sur les Droits Numériques',
      ar: 'مؤتمر حول الحقوق الرقمية'
    },
    date: {
      fr: '15 juillet 2023',
      ar: '15 يوليو 2023'
    },
    author: {
      fr: 'Équipe des événements',
      ar: 'فريق الفعاليات'
    },
    category: {
      fr: 'Événements',
      ar: 'فعاليات'
    },
    excerpt: {
      fr: 'Une conférence abordant les défis et les opportunités de la protection des droits à l\'ère numérique.',
      ar: 'مؤتمر يتناول تحديات وفرص حماية الحقوق في العصر الرقمي.'
    },
    image: '/images/law/justice-law-scales.jpg',
    slug: '/news/conference-droits-numeriques',
    content: 'Texte de contenu à remplir pour cet article.'
  },
  {
    id: 7,
    title: {
      fr: 'Guide sur l\'Accès à la Justice',
      ar: 'دليل حول الوصول إلى العدالة'
    },
    date: {
      fr: '5 juillet 2023',
      ar: '5 يوليو 2023'
    },
    author: {
      fr: 'Équipe des publications',
      ar: 'فريق المنشورات'
    },
    category: {
      fr: 'Publications',
      ar: 'منشورات'
    },
    excerpt: {
      fr: 'Publication d\'un guide pratique pour aider les citoyens à comprendre et à naviguer dans le système judiciaire.',
      ar: 'نشر دليل عملي لمساعدة المواطنين على فهم نظام العدالة والتنقل فيه.'
    },
    image: '/images/law-books-library.jpg',
    slug: '/news/guide-acces-justice',
    content: 'Texte de contenu à remplir pour cet article. Ce guide pratique offre des informations essentielles sur le système judiciaire et les procédures à suivre pour accéder à la justice.'
  },
  {
    id: 8,
    title: {
      fr: 'Atelier sur les Droits des Femmes',
      ar: 'ورشة عمل حول حقوق المرأة'
    },
    date: {
      fr: '28 juin 2023',
      ar: '28 يونيو 2023'
    },
    author: {
      fr: 'Équipe de formation',
      ar: 'فريق التدريب'
    },
    category: {
      fr: 'Formation',
      ar: 'تدريب'
    },
    excerpt: {
      fr: 'Un atelier axé sur les droits des femmes et les stratégies de lutte contre la discrimination fondée sur le genre.',
      ar: 'ورشة عمل تركز على حقوق المرأة واستراتيجيات مكافحة التمييز القائم على النوع الاجتماعي.'
    },
    image: '/images/programs/foundation-image.jpg',
    slug: '/news/atelier-droits-femmes',
    content: 'Texte de contenu à remplir pour cet article. Cet atelier a réuni des experts et des participants pour discuter des stratégies efficaces de lutte contre la discrimination fondée sur le genre.'
  }
];

const categories: Category[] = [
  { id: 'all', fr: 'Tous', ar: 'الكل' },
  { id: 'rapports', fr: 'Rapports', ar: 'تقارير' },
  { id: 'formation', fr: 'Formation', ar: 'تدريب' },
  { id: 'partenariats', fr: 'Partenariats', ar: 'شراكات' },
  { id: 'événements', fr: 'Événements', ar: 'فعاليات' },
  { id: 'programmes', fr: 'Programmes', ar: 'برامج' },
  { id: 'publications', fr: 'Publications', ar: 'منشورات' },
];

export default function NewsPage() {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  const loadContent = async () => {
    try {
      const content = await getPageContent('news');
      
      if (content) {
        console.log('News page - Content loaded with sections:', 
          content.sections.map(s => `${s.id}: ${s.title?.fr}`).join(', '));
        setPageContent(content);
        // Force re-render by incrementing the refresh counter
        setForceRefresh(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading news page content:', error);
    }
  };
  
  useEffect(() => {
    setIsClient(true);
    
    // Initial content load
    loadContent();
    
    // Add event listeners for content updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'page_news') {
        console.log('News page - Storage change detected');
        loadContent();
      }
    };
    
    const handleContentUpdated = () => {
      console.log('News page - Content updated event received');
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
    console.log('News page - Language changed, refreshing content');
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
  
  // Extract unique categories from news items
  const filteredCategories = categories.filter(cat => cat.id === activeCategory || cat.id === 'all');
  
  // Filter news items based on active category and search query
  const filteredNews = newsItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || 
      item.category.fr.toLowerCase() === filteredCategories.find(c => c.id === activeCategory)?.fr.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      item.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt[language].toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Get text aligned correctly based on language
  const textAlign = language === 'ar' ? 'text-right' : 'text-left';
  const flexDirection = language === 'ar' ? 'flex-row-reverse' : 'flex-row';

  // Get page title from content or use default
  const pageTitle = pageContent?.title?.[language as 'fr' | 'ar'] || 
    (language === 'fr' ? 'Actualités' : 'الأخبار');
  
  // Get page subtitle or use default
  const pageSubtitle = getSectionContent('intro',
    language === 'fr' 
      ? 'Restez informé des dernières initiatives, événements et développements concernant notre travail sur les droits humains.' 
      : 'ابق على اطلاع بآخر المبادرات والأحداث والتطورات المتعلقة بعملنا في مجال حقوق الإنسان.');

  return (
    <div className={`${language === 'ar' ? 'rtl' : ''}`} key={`news-${forceRefresh}`} suppressHydrationWarning>
      <PageHeader 
        title={pageTitle}
        subtitle={pageSubtitle}
        language={language}
      />

      {/* Breadcrumbs */}
      <div className="bg-white py-4 shadow-sm">
        <div className="container mx-auto px-4">
          <div className={`flex items-center text-gray-500 text-sm ${language === 'ar' ? 'justify-end' : ''}`}>
            <Link href="/" className="hover:text-primary transition-colors">
              {language === 'fr' ? 'Accueil' : 'الرئيسية'}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium">
              {language === 'fr' ? 'Actualités' : 'أخبار'}
            </span>
          </div>
        </div>
      </div>

      {/* Featured News */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              {language === 'fr' ? 'À LA UNE' : 'الأخبار البارزة'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {getSectionTitle('featuredTitle', language === 'fr' ? 'Actualités à la Une' : 'الأخبار البارزة')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-orange mx-auto"></div>
          </motion.div>

          {/* Featured news showcase - enhanced layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            {/* Main featured article */}
            <motion.div 
              className="lg:col-span-8 bg-white rounded-xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative h-96 overflow-hidden">
                <Image 
                  src={newsItems[0].image}
                  alt={newsItems[0].title[language]}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80"></div>
                <div className="absolute top-6 left-6">
                  <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                    {newsItems[0].category[language]}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-center mb-4 text-sm">
                    <FaRegCalendarAlt className="mr-2" />
                    <span>{newsItems[0].date[language]}</span>
                    <span className="mx-2">•</span>
                    <FaUser className="mr-2" />
                    <span>{newsItems[0].author[language]}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary/90 transition-colors">
                    <Link href={newsItems[0].slug}>{newsItems[0].title[language]}</Link>
                  </h3>
                  <p className="text-white/90 mb-4 line-clamp-2">
                    {newsItems[0].excerpt[language]}
                  </p>
                  <Link 
                    href={newsItems[0].slug}
                    className="inline-flex items-center bg-primary/90 hover:bg-primary text-white font-medium px-4 py-2 rounded-lg transition-all"
                  >
                    {language === 'fr' ? 'Lire l\'article' : 'قراءة المقال'}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${language === 'ar' ? 'mr-1 rotate-180' : 'ml-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
            
            {/* Secondary featured articles */}
            <div className="lg:col-span-4">
              <div className="grid grid-cols-1 gap-6">
                {newsItems.slice(1, 3).map((item, index) => (
                  <motion.div 
                    key={item.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                  >
                    <div className="flex flex-col sm:flex-row h-full">
                      <div className="relative sm:w-1/3 h-32 sm:h-auto">
                        <Image 
                          src={item.image} 
                          alt={item.title[language]} 
                          fill 
                          style={{ objectFit: 'cover' }}
                          className="transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20"></div>
                      </div>
                      <div className="sm:w-2/3 p-4 flex flex-col">
                        <span className="text-primary text-xs font-medium mb-1">{item.category[language]}</span>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          <Link href={item.slug}>{item.title[language]}</Link>
                        </h3>
                        <div className="flex items-center text-gray-500 text-xs mb-2 mt-auto">
                          <FaRegCalendarAlt className="mr-1" />
                          <span>{item.date[language]}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Standard news grid - enhanced with card design */}
          <div className="grid md:grid-cols-3 gap-8">
            {newsItems.slice(3, 6).map((item, index) => (
              <motion.div 
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform flex flex-col h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index + 3) * 0.1 }}
              >
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-70 z-10"></div>
                  <Image 
                    src={item.image} 
                    alt={item.title[language]} 
                    fill 
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium z-20">
                    {item.category[language]}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center text-gray-500 text-xs mb-3">
                    <FaRegCalendarAlt className="mr-1" />
                    <span>{item.date[language]}</span>
                    <span className="mx-2">•</span>
                    <FaUser className="mr-1" />
                    <span>{item.author[language]}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-primary transition-colors">
                    <Link href={item.slug}>{item.title[language]}</Link>
                  </h3>
                  
                  <p className="text-gray-600 mb-5 flex-grow">
                    {item.excerpt[language].length > 100 
                      ? `${item.excerpt[language].substring(0, 100)}...` 
                      : item.excerpt[language]}
                  </p>
                  
                  <div className="mt-auto">
                    <Link 
                      href={item.slug}
                      className="inline-flex items-center font-medium text-primary hover:text-orange transition-colors"
                    >
                      {language === 'fr' ? 'Lire plus' : 'قراءة المزيد'}
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${language === 'ar' ? 'mr-1 rotate-180' : 'ml-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main News Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Search bar and filter */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6">
            <motion.div 
              className="relative max-w-md w-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher des articles...' : 'البحث عن مقالات...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${textAlign}`}
              />
              <FaSearch className={`absolute top-3.5 ${language === 'ar' ? 'right-4' : 'left-4'} text-gray-400`} />
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category[language]}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Latest News heading with decorative element */}
          <motion.div 
            className="mb-12 flex flex-col md:flex-row items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`md:w-2/3 ${textAlign}`}>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 relative inline-block">
                {getSectionTitle('latestNewsTitle', language === 'fr' ? 'Dernières Actualités' : 'آخر الأخبار')}
                <div className="w-full h-1 bg-gradient-to-r from-primary to-orange absolute bottom-[-6px] left-0"></div>
              </h2>
              <p className="text-gray-600 max-w-2xl">
                {getSectionContent('latestNewsContent', language === 'fr' ? 'Restez informé de nos dernières activités, publications et événements dans le domaine des droits humains.' : 'ابق على اطلاع بآخر أنشطتنا ومنشوراتنا وفعالياتنا في مجال حقوق الإنسان.')}
              </p>
            </div>
            
            <div className="md:w-1/3">
              <div className="relative h-40 rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src="/images/law/justice-law-scales.jpg"
                  alt={language === 'fr' ? "Actualités récentes" : "الأخبار الحديثة"}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                  <div className="px-6">
                    <p className="text-white font-medium">
                      {language === 'fr' ? 'Toutes nos actualités' : 'جميع أخبارنا'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* News Grid - improved layout with visual enhancements */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredNews.map((item, index) => (
              <motion.div 
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl group flex flex-col h-full"
                variants={itemVariant}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div className="relative h-52 overflow-hidden">
                  {/* Category badge */}
                  <div className="absolute top-3 right-3 z-20">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.category.fr === 'Rapports' ? 'bg-blue-100 text-blue-800' :
                      item.category.fr === 'Formation' ? 'bg-green-100 text-green-800' :
                      item.category.fr === 'Partenariats' ? 'bg-purple-100 text-purple-800' :
                      item.category.fr === 'Événements' ? 'bg-yellow-100 text-yellow-800' :
                      item.category.fr === 'Programmes' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.category[language]}
                    </span>
                  </div>
                  
                  {/* Image with hover effect */}
                  <Image 
                    src={item.image} 
                    alt={item.title[language]}
                    fill 
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  
                  {/* Date overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <div className="flex items-center text-white/90 text-xs">
                      <FaRegCalendarAlt className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                      <span>{item.date[language]}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={item.slug}>{item.title[language]}</Link>
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {item.excerpt[language]}
                  </p>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500 flex items-center">
                      <FaUser className={language === 'ar' ? 'ml-1' : 'mr-1'} />
                      {item.author[language]}
                    </span>
                    
                    <Link 
                      href={item.slug}
                      className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {language === 'fr' ? 'Lire' : 'قراءة'}
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${language === 'ar' ? 'mr-1 rotate-180' : 'ml-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Load more button - enhanced */}
          <div className="text-center">
            <motion.button
              className="px-8 py-3 bg-primary/10 border-2 border-primary text-primary rounded-full font-medium hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-md group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center justify-center">
                {language === 'fr' ? 'Charger plus d\'articles' : 'تحميل المزيد من المقالات'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </span>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
} 