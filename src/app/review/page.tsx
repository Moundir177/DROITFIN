'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaDownload, FaRegCalendarAlt, FaEye, FaRegFileAlt, FaHeadphones, FaPlay, FaBook, FaFile, FaPen, FaNewspaper, FaPodcast, FaSearch } from 'react-icons/fa';
import PageHeader from '@/components/PageHeader';
import { getPageContent, PageContent } from '@/lib/database';
import Newsletter from '@/components/Newsletter';
import { motion } from 'framer-motion';

type Language = 'fr' | 'ar';

interface TranslatedText {
  fr: string;
  ar: string;
}

interface PublicationType {
  id: string;
  fr: string;
  ar: string;
  icon?: React.ReactNode;
}

interface Publication {
  id: number;
  title: TranslatedText;
  date: TranslatedText;
  excerpt: TranslatedText;
  category: PublicationType;
  type: PublicationType;
  pages: number;
  image?: string;
  slug: string;
  pdfUrl: string;
  views?: number;
  listens?: number;
  downloads?: number;
  featured?: boolean;
  duration?: string;
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

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const publicationTypes: PublicationType[] = [
  { id: 'all', fr: 'Toutes les publications', ar: 'جميع المنشورات', icon: <FaBook /> },
  { id: 'reports', fr: 'Rapports', ar: 'تقارير', icon: <FaFile /> },
  { id: 'analyses', fr: 'Analyses', ar: 'تحليلات', icon: <FaPen /> },
  { id: 'guides', fr: 'Guides', ar: 'أدلة', icon: <FaBook /> },
  { id: 'articles', fr: 'Articles', ar: 'مقالات', icon: <FaNewspaper /> }
];

const publicationCategories: PublicationType[] = [
  { id: 'all', fr: 'Tous', ar: 'الكل' },
  { id: 'juridique', fr: 'Juridique', ar: 'قانوني' },
  { id: 'droits-humains', fr: 'Droits humains', ar: 'حقوق الإنسان' },
  { id: 'social', fr: 'Social', ar: 'اجتماعي' }
];

const mediaTypes: PublicationType[] = [
  { id: 'all', fr: 'Tous les médias', ar: 'جميع وسائل الإعلام', icon: <FaPlay /> },
  { id: 'videos', fr: 'Vidéos', ar: 'فيديوهات', icon: <FaPlay /> },
  { id: 'podcasts', fr: 'Podcasts', ar: 'بودكاست', icon: <FaHeadphones /> },
  { id: 'infographics', fr: 'Infographies', ar: 'الرسوم البيانية', icon: <FaFile /> }
];

// Sample publications data
const publications: Publication[] = [
  {
    id: 1,
    title: {
      fr: 'Rapport annuel 2023',
      ar: 'التقرير السنوي 2023'
    },
    date: {
      fr: 'Mai 2023',
      ar: 'مايو 2023'
    },
    excerpt: {
      fr: 'Ce rapport présente un aperçu complet de l\'état des droits humains en Algérie en 2023. Il aborde les avancées et défis dans différents domaines, notamment les libertés civiles, les droits économiques et sociaux, et l\'accès à la justice.',
      ar: 'يقدم هذا التقرير نظرة شاملة عن حالة حقوق الإنسان في الجزائر في عام 2023. ويتناول التقدم والتحديات في مختلف المجالات، بما في ذلك الحريات المدنية والحقوق الاقتصادية والاجتماعية والوصول إلى العدالة.'
    },
    category: { id: 'droits-humains', fr: 'Rapport annuel', ar: 'التقرير السنوي' },
    type: { id: 'reports', fr: 'Rapport', ar: 'تقرير' },
    pages: 120,
    slug: '/review/rapport-annuel-2023',
    pdfUrl: '/documents/rapport-annuel-2023.pdf',
    featured: true
  },
  {
    id: 2,
    title: {
      fr: 'État des lieux de l\'égalité des genres',
      ar: 'واقع المساواة بين الجنسين'
    },
    date: {
      fr: 'Mars 2023',
      ar: 'مارس 2023'
    },
    excerpt: {
      fr: 'Analyse des progrès réalisés et des défis persistants en matière d\'égalité hommes-femmes.',
      ar: 'تحليل التقدم المحرز والتحديات المستمرة في مجال المساواة بين الجنسين.'
    },
    category: { id: 'droits-humains', fr: 'Rapport', ar: 'تقرير' },
    type: { id: 'reports', fr: 'Rapport', ar: 'تقرير' },
    pages: 45,
    slug: '/review/egalite-genres',
    pdfUrl: '/documents/egalite-genres.pdf'
  },
  {
    id: 3,
    title: {
      fr: 'Guide pratique des droits de l\'enfant',
      ar: 'دليل عملي لحقوق الطفل'
    },
    date: {
      fr: 'Février 2023',
      ar: 'فبراير 2023'
    },
    excerpt: {
      fr: 'Ressource complète pour parents, éducateurs et professionnels travaillant avec les enfants.',
      ar: 'مورد شامل للآباء والمعلمين والمختصين العاملين مع الأطفال.'
    },
    category: { id: 'social', fr: 'Guide', ar: 'دليل' },
    type: { id: 'guides', fr: 'Guide', ar: 'دليل' },
    pages: 85,
    slug: '/review/guide-droits-enfant',
    pdfUrl: '/documents/guide-droits-enfant.pdf'
  },
  {
    id: 4,
    title: {
      fr: 'Réformes juridiques et accès à la justice',
      ar: 'الإصلاحات القانونية والوصول إلى العدالة'
    },
    date: {
      fr: 'Janvier 2023',
      ar: 'يناير 2023'
    },
    excerpt: {
      fr: 'Analyse des récentes réformes juridiques et leur impact sur l\'accès des citoyens à la justice.',
      ar: 'تحليل الإصلاحات القانونية الأخيرة وتأثيرها على وصول المواطنين إلى العدالة.'
    },
    category: { id: 'juridique', fr: 'Analyse', ar: 'تحليل' },
    type: { id: 'analyses', fr: 'Analyse', ar: 'تحليل' },
    pages: 60,
    slug: '/review/reformes-juridiques',
    pdfUrl: '/documents/reformes-juridiques.pdf'
  }
];

// Sample media content
const mediaContent = [
  {
    id: 1,
    title: {
      fr: 'Les droits humains : Enjeux et perspectives en Algérie',
      ar: 'حقوق الإنسان: التحديات والآفاق في الجزائر'
    },
    date: {
      fr: 'Mai 2023',
      ar: 'مايو 2023'
    },
    excerpt: {
      fr: 'Conférence-débat sur l\'état des droits humains en Algérie, avec la participation d\'experts nationaux et internationaux.',
      ar: 'ندوة-نقاش حول وضع حقوق الإنسان في الجزائر، بمشاركة خبراء وطنيين ودوليين.'
    },
    category: { id: 'droits-humains', fr: 'Vidéo à la une', ar: 'فيديو بارز' },
    type: { id: 'videos', fr: 'Vidéo', ar: 'فيديو' },
    pages: 0,
    slug: '/review/media/droits-humains-enjeux',
    pdfUrl: '#',
    views: 2456,
    duration: '24:15'
  },
  {
    id: 2,
    title: {
      fr: 'L\'engagement des jeunes pour les droits',
      ar: 'التزام الشباب بالحقوق'
    },
    date: {
      fr: 'Mars 2023',
      ar: 'مارس 2023'
    },
    excerpt: {
      fr: 'Comment les jeunes s\'engagent pour la défense et la promotion des droits humains en Algérie.',
      ar: 'كيف يلتزم الشباب بالدفاع عن حقوق الإنسان وتعزيزها في الجزائر.'
    },
    category: { id: 'droits-humains', fr: 'Vidéo', ar: 'فيديو' },
    type: { id: 'videos', fr: 'Vidéo', ar: 'فيديو' },
    pages: 0,
    slug: '/review/media/engagement-jeunes',
    pdfUrl: '#',
    views: 1245,
    duration: '18:32'
  },
  {
    id: 3,
    title: {
      fr: 'Les défis de l\'accès à la justice',
      ar: 'تحديات الوصول إلى العدالة'
    },
    date: {
      fr: 'Février 2023',
      ar: 'فبراير 2023'
    },
    excerpt: {
      fr: 'Entretien avec des experts juridiques sur les obstacles à l\'accès à la justice et les solutions possibles.',
      ar: 'مقابلة مع خبراء قانونيين حول العقبات التي تعترض الوصول إلى العدالة والحلول الممكنة.'
    },
    category: { id: 'juridique', fr: 'Podcast', ar: 'بودكاست' },
    type: { id: 'podcasts', fr: 'Podcast', ar: 'بودكاست' },
    pages: 0,
    slug: '/review/media/defis-acces-justice',
    pdfUrl: '#',
    listens: 856,
    duration: '45:10'
  },
  {
    id: 4,
    title: {
      fr: 'L\'égalité des genres en chiffres',
      ar: 'المساواة بين الجنسين بالأرقام'
    },
    date: {
      fr: 'Janvier 2023',
      ar: 'يناير 2023'
    },
    excerpt: {
      fr: 'Infographie présentant les statistiques clés sur l\'égalité des genres en Algérie et dans le monde.',
      ar: 'إنفوغرافيك يقدم الإحصاءات الرئيسية حول المساواة بين الجنسين في الجزائر وفي العالم.'
    },
    category: { id: 'droits-humains', fr: 'Infographie', ar: 'إنفوغرافيك' },
    type: { id: 'infographics', fr: 'Infographie', ar: 'إنفوغرافيك' },
    pages: 0,
    slug: '/review/media/egalite-genres-chiffres',
    pdfUrl: '/documents/infographie-egalite-genres.pdf',
    downloads: 378
  }
];

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

export default function ReviewPage() {
  const { language } = useLanguage();
  const [activePublicationType, setActivePublicationType] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeMediaType, setActiveMediaType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  const loadContent = async () => {
    try {
      const content = await getPageContent('review');
      
      if (content) {
        console.log('Review page - Content loaded with sections:', 
          content.sections.map(s => `${s.id}: ${s.title?.fr}`).join(', '));
        setPageContent(content);
        // Force re-render by incrementing the refresh counter
        setForceRefresh(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading review page content:', error);
    }
  };
  
  useEffect(() => {
    setIsClient(true);
    
    // Initial content load
    loadContent();
    
    // Add event listeners for content updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'page_review') {
        console.log('Review page - Storage change detected');
        loadContent();
      }
    };
    
    const handleContentUpdated = () => {
      console.log('Review page - Content updated event received');
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
    console.log('Review page - Language changed, refreshing content');
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
  
  // Default content if not found in database
  const pageTitle = pageContent?.title?.[language] || 
    (language === 'fr' ? 'Revue & Publications' : 'المراجعة والمنشورات');
    
  const pageSubtitle = getSectionContent('intro',
    language === 'fr' ? 'Explorez nos analyses et publications sur les droits humains et les enjeux juridiques actuels' 
    : 'استكشف تحليلاتنا ومنشوراتنا حول حقوق الإنسان والقضايا القانونية الحالية');
  
  const comingSoonTitle = getSectionTitle('coming_soon',
    language === 'fr' ? 'Notre première revue arrive en juillet 2025 !' 
    : 'تصدر مجلتنا الأولى في يوليو 2025!');
    
  const comingSoonContent = getSectionContent('coming_soon',
    language === 'fr' ? 'Nous avons le plaisir de vous annoncer que la première édition de notre revue sera publiée en juillet 2025. Cette revue trimestrielle abordera les questions juridiques, les droits humains et les enjeux sociaux actuels.' 
    : 'يسرنا أن نعلن أن العدد الأول من مجلتنا سيصدر في يوليو 2025. ستتناول هذه المجلة الفصلية القضايا القانونية وحقوق الإنسان والقضايا الاجتماعية الحالية.');
  
  const contributionTitle = getSectionTitle('contribution',
    language === 'fr' ? 'Vous souhaitez contribuer ?' 
    : 'هل ترغب في المساهمة؟');
    
  const contributionContent = getSectionContent('contribution',
    language === 'fr' ? 'Nous invitons les chercheurs, juristes, académiciens et experts à contribuer à notre revue. Si vous souhaitez soumettre un article ou partager votre expertise, n\'hésitez pas à nous contacter via notre formulaire de contact ou sur nos réseaux sociaux.' 
    : 'ندعو الباحثين والمحامين والأكاديميين والخبراء للمساهمة في مجلتنا. إذا كنت ترغب في تقديم مقالة أو مشاركة خبرتك، فلا تتردد في الاتصال بنا من خلال نموذج الاتصال الخاص بنا أو على وسائل التواصل الاجتماعي.');
  
  const recentPublicationsTitle = getSectionTitle('recent_publications',
    language === 'fr' ? 'Publications récentes' 
    : 'المنشورات الحديثة');
    
  const recentPublicationsContent = getSectionContent('recent_publications',
    language === 'fr' ? 'Découvrez l\'ensemble de nos ressources documentaires sur les droits humains et les questions juridiques.' 
    : 'اكتشف جميع مواردنا الوثائقية حول حقوق الإنسان والقضايا القانونية.');
  
  const mediaLibraryTitle = getSectionTitle('media_library',
    language === 'fr' ? 'Médiathèque' 
    : 'مكتبة الوسائط');
    
  const mediaLibraryContent = getSectionContent('media_library',
    language === 'fr' ? 'Explorez notre collection de ressources audiovisuelles sur les droits humains.' 
    : 'استكشف مجموعتنا من الموارد السمعية البصرية حول حقوق الإنسان.');
  
  const featuredTitle = getSectionTitle('featured',
    language === 'fr' ? 'Publication à la une' 
    : 'المنشور المميز');
    
  const featuredContent = getSectionContent('featured',
    language === 'fr' ? 'Notre rapport annuel présente un aperçu complet de l\'état des droits humains en Algérie.' 
    : 'يقدم تقريرنا السنوي نظرة شاملة عن حالة حقوق الإنسان في الجزائر.');

  // Get text aligned correctly based on language
  const textAlign = language === 'ar' ? 'text-right' : 'text-left';
  const rtlClass = language === 'ar' ? 'rtl' : '';

  // Filter publications based on selected type, category and search query
  const filteredPublications = publications.filter(pub => {
    const matchesType = activePublicationType === 'all' || pub.type.id === activePublicationType;
    const matchesSearch = searchTerm === '' || 
      pub.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.excerpt[language].toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Filter media content based on selected type and search query
  const filteredMedia = mediaContent.filter(item => {
    const matchesType = activeMediaType === 'all' || item.type.id === activeMediaType;
    const matchesSearch = searchTerm === '' || 
      item.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt[language].toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className={rtlClass} key={`review-${forceRefresh}`} suppressHydrationWarning>
      {/* Page Header */}
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
              {language === 'fr' ? 'Revue' : 'المراجعة'}
            </span>
          </div>
        </div>
      </div>

      {/* Announcement for First Issue */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-10 border-l-4 border-primary relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange/5 rounded-tr-full"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 relative inline-block">
                {comingSoonTitle}
                <div className="w-full h-1 bg-gradient-to-r from-primary to-orange absolute bottom-[-6px] left-0"></div>
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                {comingSoonContent}
              </p>
              <h3 className="text-xl font-semibold mb-4 text-primary relative inline-block">
                {contributionTitle}
                <div className="w-full h-0.5 bg-gradient-to-r from-primary/50 to-orange/50 absolute bottom-[-4px] left-0"></div>
              </h3>
              <p className="text-gray-700 mb-8">
                {contributionContent}
              </p>
              <div className="flex flex-wrap gap-6 mt-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    href="/contact" 
                    className="bg-gradient-to-r from-primary to-[#8FD694] hover:from-primary/90 hover:to-[#8FD694]/90 text-white px-6 py-3 rounded-full inline-flex items-center transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    {language === 'fr' ? 'Contactez-nous' : 'اتصل بنا'}
                  </Link>
                </motion.div>
                
                <div className="flex space-x-4 items-center">
                  <motion.a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:text-primary/80 bg-primary/10 p-3 rounded-full transition-all"
                    whileHover={{ scale: 1.1 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                    </svg>
                  </motion.a>
                  <motion.a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:text-primary/80 bg-primary/10 p-3 rounded-full transition-all"
                    whileHover={{ scale: 1.1 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </motion.a>
                  <motion.a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:text-primary/80 bg-primary/10 p-3 rounded-full transition-all"
                    whileHover={{ scale: 1.1 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" clipRule="evenodd"></path>
                    </svg>
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Recent Publications Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-orange/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className={`mb-12 ${textAlign}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-6 relative inline-block">
              {recentPublicationsTitle}
              <div className="w-full h-1 bg-gradient-to-r from-primary to-orange absolute bottom-[-6px] left-0"></div>
            </h2>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-end">
              <p className="text-lg text-gray-700 max-w-2xl mb-6 md:mb-0">
                {recentPublicationsContent}
              </p>
              
              {/* Search input */}
              <motion.div 
                className="relative w-full md:w-72"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <input
                  type="text"
                  placeholder={language === 'fr' ? 'Rechercher...' : 'بحث...'}
                  className={`w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm ${textAlign}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className={`absolute top-3.5 ${language === 'ar' ? 'right-3.5' : 'left-3.5'} text-gray-400`} />
              </motion.div>
            </div>
          </motion.div>
          
          {/* Category buttons */}
          <motion.div 
            className="mb-12 flex flex-wrap gap-3 justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {publicationCategories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full transition-all transform hover:scale-105 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-primary to-[#8FD694] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-primary/50 hover:shadow-sm'
                }`}
                variants={itemVariant}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {language === 'fr' ? category.fr : category.ar}
              </motion.button>
            ))}
          </motion.div>
          
          {/* Publication Types */}
          <motion.div 
            className="mb-12 flex flex-wrap gap-3 justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {publicationTypes.map((type, index) => (
              <motion.button
                key={type.id}
                onClick={() => setActivePublicationType(type.id)}
                className={`flex items-center px-6 py-3 rounded-full transition-all transform hover:scale-105 ${
                  activePublicationType === type.id
                    ? 'bg-gradient-to-r from-orange to-[#FF9F5A] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-orange/50 hover:shadow-sm'
                }`}
                variants={itemVariant}
                transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
              >
                {type.icon && <span className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`}>{type.icon}</span>}
                {language === 'fr' ? type.fr : type.ar}
              </motion.button>
            ))}
          </motion.div>
          
          {/* Featured Publication */}
          {publications.find(p => p.featured) && (
            <motion.div 
              className="mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8 relative">
                  <div className="absolute top-0 right-0 bg-orange/10 w-48 h-48 rounded-bl-full -mt-6 -mr-6 z-0"></div>
                  
                  <div className="md:flex items-start relative z-10">
                    <div className="md:w-2/3 md:pr-10">
                      <span className="inline-block px-4 py-1 bg-orange text-white text-sm font-semibold rounded-full mb-4">
                        {featuredTitle}
                      </span>
                      <h3 className="text-2xl font-bold mb-4 text-gray-800">
                        {publications.find(p => p.featured)?.title[language]}
                      </h3>
                      <p className="text-gray-700 mb-6">
                        {publications.find(p => p.featured)?.excerpt[language]}
                      </p>
                      
                      <div className="flex items-center text-gray-500 text-sm mb-6">
                        <FaRegCalendarAlt className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                        <span>{publications.find(p => p.featured)?.date[language]}</span>
                        <span className="mx-3">•</span>
                        <FaRegFileAlt className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                        <span>{publications.find(p => p.featured)?.pages} {language === 'fr' ? 'pages' : 'صفحات'}</span>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="inline-block"
                      >
                        <a
                          href={publications.find(p => p.featured)?.pdfUrl}
                          className="inline-flex items-center bg-gradient-to-r from-primary to-[#8FD694] hover:from-primary/90 hover:to-[#8FD694]/90 text-white font-bold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all"
                        >
                          <FaDownload className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                          {language === 'fr' ? 'Télécharger le rapport' : 'تحميل التقرير'}
                        </a>
                      </motion.div>
                    </div>
                    
                    <div className="md:w-1/3 mt-8 md:mt-0">
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="aspect-w-3 aspect-h-4 relative rounded-lg overflow-hidden shadow-md">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange/30 z-10 mix-blend-overlay"></div>
                          {/* Placeholder image with gradient */}
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-3xl font-bold">FPRA</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Media Library Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8FD694]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#171717]/5 rounded-full blur-3xl"></div>
        <motion.div 
          className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-[#8FD694]/40"
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/4 w-6 h-6 rounded-full bg-orange/20"
          animate={{
            y: [0, 40, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className={`mb-16 ${textAlign}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-block px-4 py-1 bg-[#8FD694]/10 text-[#2AA084] text-sm font-medium rounded-full mb-4">
                  {language === 'fr' ? 'RESSOURCES AUDIOVISUELLES' : 'الموارد السمعية البصرية'}
                </span>
                <h2 className="text-4xl font-bold text-[#171717] mb-4 relative inline-block">
                  {mediaLibraryTitle}
                  <motion.div 
                    className="h-1.5 bg-gradient-to-r from-[#8FD694] to-[#2AA084] absolute -bottom-2 left-0"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mt-6">
                  {mediaLibraryContent}
                </p>
              </div>
              
              {/* Search box with animation */}
              <motion.div 
                className="mt-8 md:mt-0 relative max-w-md"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <input
                  type="text"
                  placeholder={language === 'fr' ? 'Rechercher dans la médiathèque...' : 'البحث في مكتبة الوسائط...'}
                  className={`w-full p-4 pl-12 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8FD694] focus:border-transparent shadow-sm hover:shadow-md transition-all duration-300 outline-none ${textAlign}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <motion.span 
                  className={`absolute top-0 bottom-0 ${language === 'ar' ? 'right-3' : 'left-3'} flex items-center text-gray-400`}
                  whileHover={{ scale: 1.1, color: '#8FD694' }}
                >
                  <FaSearch size={18} />
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Media type tabs with animation */}
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-gray-50 p-2 rounded-2xl inline-flex flex-wrap justify-center shadow-sm">
              {mediaTypes.map((type, index) => (
                <motion.button
                  key={type.id}
                  onClick={() => setActiveMediaType(type.id)}
                  className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center ${
                    activeMediaType === type.id
                      ? 'bg-[#8FD694] text-white shadow-md'
                      : 'bg-transparent text-gray-600 hover:bg-white hover:shadow-sm'
                  }`}
                  whileHover={{ scale: activeMediaType === type.id ? 1 : 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {type.icon && <span className={`${language === 'ar' ? 'ml-2' : 'mr-2'}`}>{type.icon}</span>}
                  {language === 'fr' ? type.fr : type.ar}
                  {activeMediaType === type.id && (
                    <span className="ml-2 bg-white w-2 h-2 rounded-full" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
          
          {/* Media Grid with staggered animation */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {filteredMedia.map((media, index) => (
              <motion.div 
                key={media.id} 
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                variants={itemVariant}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="relative h-56 bg-gradient-to-r from-[#1c1c1c] to-[#333333] flex items-center justify-center overflow-hidden">
                  {/* Animated gradient background */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-[#2AA084]/20 via-transparent to-[#8FD694]/20 opacity-60"
                    animate={{
                      background: [
                        'radial-gradient(circle at 30% 50%, rgba(42, 160, 132, 0.3) 0%, transparent 70%)',
                        'radial-gradient(circle at 70% 50%, rgba(143, 214, 148, 0.3) 0%, transparent 70%)',
                        'radial-gradient(circle at 30% 50%, rgba(42, 160, 132, 0.3) 0%, transparent 70%)'
                      ]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Media type icon with animation */}
                  {media.type.id === 'videos' && (
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center z-10"
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.div 
                        className="bg-white/90 text-[#8FD694] rounded-full p-5 shadow-lg hover:bg-white transition-colors duration-300 cursor-pointer"
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <FaPlay size={24} />
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {media.type.id === 'podcasts' && (
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center z-10"
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.div 
                        className="bg-white/90 text-[#8FD694] rounded-full p-5 shadow-lg hover:bg-white transition-colors duration-300 cursor-pointer"
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <FaHeadphones size={24} />
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {media.type.id === 'infographics' && (
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center z-10"
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.div 
                        className="bg-white/90 text-[#8FD694] rounded-full p-5 shadow-lg hover:bg-white transition-colors duration-300 cursor-pointer"
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <FaFile size={24} />
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {/* Media type badge with improved design */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#171717] px-4 py-1.5 rounded-full text-sm font-medium shadow-sm z-10">
                    {media.type[language]}
                  </div>
                  
                  {/* Title overlay with gradient and animation */}
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300"
                    initial={{ opacity: 0.9 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <h3 className="text-lg font-bold leading-snug line-clamp-2">
                      {media.title[language]}
                    </h3>
                    <div className="flex items-center text-sm mt-2 text-gray-300">
                      <FaRegCalendarAlt className={`${language === 'ar' ? 'ml-2' : 'mr-2'} text-[#8FD694]`} />
                      <span>{media.date[language]}</span>
                      {media.duration && (
                        <>
                          <span className="mx-3 text-gray-500">•</span>
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${language === 'ar' ? 'ml-1' : 'mr-1'} text-[#8FD694]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {media.duration}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>
                </div>
                
                <div className="p-6">
                  <p className={`text-gray-600 mb-5 line-clamp-3 ${textAlign} text-sm leading-relaxed`}>
                    {media.excerpt[language]}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <motion.div
                      whileHover={{ scale: 1.05, x: language === 'ar' ? -5 : 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link 
                        href={media.slug}
                        className="text-[#2AA084] hover:text-[#8FD694] font-medium flex items-center transition-colors duration-300"
                      >
                        <FaEye className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                        {language === 'fr' ? 'Voir en détail' : 'عرض التفاصيل'}
                      </Link>
                    </motion.div>
                    
                    <div className="flex items-center text-gray-400 text-sm">
                      {media.views && (
                        <motion.div 
                          className="flex items-center mr-4"
                          whileHover={{ scale: 1.1, color: '#8FD694' }}
                        >
                          <FaEye className="mr-1" />
                          <span>{media.views.toLocaleString()}</span>
                        </motion.div>
                      )}
                      {media.listens && (
                        <motion.div 
                          className="flex items-center mr-4"
                          whileHover={{ scale: 1.1, color: '#8FD694' }}
                        >
                          <FaHeadphones className="mr-1" />
                          <span>{media.listens.toLocaleString()}</span>
                        </motion.div>
                      )}
                      {media.downloads && (
                        <motion.div 
                          className="flex items-center"
                          whileHover={{ scale: 1.1, color: '#8FD694' }}
                        >
                          <FaDownload className="mr-1" />
                          <span>{media.downloads.toLocaleString()}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* View All Button with animation */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Link 
                href="/review/media"
                className="bg-white border-2 border-[#8FD694] text-[#2AA084] hover:bg-[#f7fcf8] hover:shadow-md px-8 py-3.5 rounded-full inline-flex items-center transition-all duration-300 font-medium"
              >
                {language === 'fr' ? 'EXPLORER TOUTE LA MÉDIATHÈQUE' : 'استكشاف مكتبة الوسائط كاملةً'}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${language === 'ar' ? 'mr-2' : 'ml-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Featured Publication */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-24 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#2AA084]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange/5 rounded-full blur-3xl"></div>
        
        <motion.div 
          className="absolute top-1/4 left-1/3 w-5 h-5 rounded-full bg-[#8FD694]/20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-orange/20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="flex justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center max-w-2xl">
              <span className="inline-block px-4 py-1 bg-orange/10 text-orange text-sm font-medium rounded-full mb-4">
                {language === 'fr' ? 'PUBLICATION PHARE' : 'المنشور الرئيسي'}
              </span>
              <h2 className="text-4xl font-bold text-[#171717] mb-4">
                {featuredTitle}
              </h2>
              <motion.div 
                className="h-1.5 bg-gradient-to-r from-orange to-[#FF9F5A] w-24 mx-auto mb-6"
                initial={{ width: 0 }}
                whileInView={{ width: '6rem' }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <p className="text-gray-600">
                {featuredContent}
              </p>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <motion.div 
              className={`lg:col-span-5 ${textAlign}`}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {publications.filter(p => p.featured).map(publication => (
                <motion.div 
                  key={publication.id} 
                  className="bg-white p-8 rounded-xl shadow-xl h-full border border-gray-100 relative overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange/10 to-transparent rounded-bl-[100px] -mt-10 -mr-10 z-0"></div>
                  
                  <div className="relative z-10">
                    <div className="mb-6 flex flex-wrap gap-3">
                      <span className="bg-orange text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
                        {publication.category[language]}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium">
                        {publication.type[language]}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                      {publication.title[language]}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-6">
                      <div className="flex items-center">
                        <FaRegCalendarAlt className={`text-orange ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        <span>{publication.date[language]}</span>
                      </div>
                      <span className="mx-3 text-gray-300">•</span>
                      <div className="flex items-center">
                        <FaRegFileAlt className={`text-orange ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        <span>{publication.pages} {language === 'fr' ? 'pages' : 'صفحات'}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      {publication.excerpt[language]}
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link 
                          href={publication.slug}
                          className="bg-gradient-to-r from-orange to-[#FF9F5A] hover:from-orange/90 hover:to-[#FF9F5A]/90 text-white shadow-md hover:shadow-lg px-6 py-3 rounded-full inline-flex items-center transition-all duration-300 font-medium"
                        >
                          <FaEye className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                          {language === 'fr' ? 'Lire le rapport' : 'قراءة التقرير'}
                        </Link>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link 
                          href={publication.pdfUrl}
                          className="bg-white border-2 border-orange text-orange hover:bg-orange/5 px-6 py-3 rounded-full inline-flex items-center transition-colors duration-300"
                          download
                        >
                          <FaDownload className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                          {language === 'fr' ? 'Télécharger PDF' : 'تحميل PDF'}
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              className="lg:col-span-7 relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative h-full rounded-xl overflow-hidden shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#171717] to-[#2C2C2C] z-0"></div>
                
                {/* Animated background pattern */}
                <motion.div 
                  className="absolute inset-0 opacity-10 z-0"
                  style={{
                    backgroundImage: "url('/images/texture.png')",
                    backgroundSize: "cover"
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.15, 0.1]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Animated gradient overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-orange/20 via-transparent to-[#2AA084]/20 opacity-30 z-0 mix-blend-overlay"
                  animate={{
                    background: [
                      'linear-gradient(to top right, rgba(255,138,0,0.2), transparent, rgba(42,160,132,0.2))',
                      'linear-gradient(to top right, rgba(42,160,132,0.2), transparent, rgba(255,138,0,0.2))',
                      'linear-gradient(to top right, rgba(255,138,0,0.2), transparent, rgba(42,160,132,0.2))'
                    ]
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <div className="relative z-10 p-10 flex flex-col items-center justify-center h-full text-center">
                  <motion.div 
                    className="inline-block"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <span className="inline-block bg-white/90 text-[#171717] px-5 py-2 rounded-full text-sm font-bold mb-8 backdrop-blur-sm shadow-lg">
                      {language === 'fr' ? 'RAPPORT ANNUEL 2023' : 'التقرير السنوي 2023'}
                    </span>
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange to-[#FF9F5A] mx-auto mb-8 flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </motion.div>
                  
                  <motion.h2 
                    className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    {language === 'fr' 
                      ? "L'état des droits humains en Algérie" 
                      : "حالة حقوق الإنسان في الجزائر"}
                  </motion.h2>
                  
                  <motion.p 
                    className="text-white/80 mb-10 max-w-xl mx-auto text-lg"
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    {language === 'fr' 
                      ? "Une analyse complète des avancées et défis en matière de droits humains en Algérie durant l'année 2023." 
                      : "تحليل شامل للتقدم والتحديات في مجال حقوق الإنسان في الجزائر خلال عام 2023."}
                  </motion.p>
                  
                  <motion.div 
                    className="flex flex-wrap justify-center gap-5"
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link 
                        href="/review/rapport-annuel-2023"
                        className="bg-gradient-to-r from-orange to-[#FF9F5A] hover:from-orange/90 hover:to-[#FF9F5A]/90 text-white shadow-md hover:shadow-lg px-8 py-4 rounded-full inline-flex items-center transition-all duration-300 font-medium"
                      >
                        <FaEye className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                        {language === 'fr' ? 'Lire le rapport' : 'قراءة التقرير'}
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link 
                        href="/documents/rapport-annuel-2023.pdf"
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-8 py-4 rounded-full inline-flex items-center transition-all duration-300"
                        download
                      >
                        <FaDownload className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                        {language === 'fr' ? 'Télécharger PDF' : 'تحميل PDF'}
                      </Link>
                    </motion.div>
                  </motion.div>
                  
                  {/* Key statistics */}
                  <motion.div 
                    className="grid grid-cols-3 gap-4 mt-12 w-full max-w-lg mx-auto"
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">120+</div>
                      <div className="text-xs text-white/70">{language === 'fr' ? 'PAGES' : 'صفحات'}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">15+</div>
                      <div className="text-xs text-white/70">{language === 'fr' ? 'CHAPITRES' : 'فصول'}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white">30+</div>
                      <div className="text-xs text-white/70">{language === 'fr' ? 'EXPERTS' : 'خبراء'}</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
} 