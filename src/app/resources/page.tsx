'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaDownload, FaRegCalendarAlt, FaSearch, FaExternalLinkAlt, FaBook, FaFileAlt, FaVideo, FaTools, FaGavel } from 'react-icons/fa';
import PageHeader from '@/components/PageHeader';
import { getPageContent, PageContent } from '@/lib/database';
import Newsletter from '@/components/Newsletter';
import { motion } from 'framer-motion';

type Language = 'fr' | 'ar';

interface TranslatedText {
  fr: string;
  ar: string;
}

interface ResourceType {
  id: string;
  fr: string;
  ar: string;
  icon: React.ReactNode;
}

interface Resource {
  id: number;
  title: TranslatedText;
  description: TranslatedText;
  type: string;
  format: string;
  thumbnail?: string;
  downloadUrl: string;
  date: TranslatedText;
  fileSize?: string;
  featured?: boolean;
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

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

export default function ResourcesPage() {
  const { language } = useLanguage();
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  // Function to load page content from localStorage
  const loadContent = async () => {
    try {
      const content = await getPageContent('resources');
      
      if (content) {
        console.log('Resources page - Content loaded with sections:', 
          content.sections.map(s => `${s.id}: ${s.title?.fr}`).join(', '));
        setPageContent(content);
        // Force re-render by incrementing the refresh counter
        setForceRefresh(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading resources page content:', error);
    }
  };
  
  useEffect(() => {
    setIsClient(true);
    
    // Initial content load
    loadContent();
    
    // Add event listeners for content updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'page_resources') {
        console.log('Resources page - Storage change detected');
        loadContent();
      }
    };
    
    const handleContentUpdated = () => {
      console.log('Resources page - Content updated event received');
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
    console.log('Resources page - Language changed, refreshing content');
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

  // Resource types with icons
  const resourceTypes: ResourceType[] = [
    { id: 'all', fr: 'Toutes les ressources', ar: 'جميع الموارد', icon: <FaSearch className={language === 'ar' ? 'ml-2' : 'mr-2'} /> },
    { id: 'guides', fr: 'Guides pratiques', ar: 'أدلة عملية', icon: <FaBook className={language === 'ar' ? 'ml-2' : 'mr-2'} /> },
    { id: 'toolkits', fr: 'Boîtes à outils', ar: 'مجموعات أدوات', icon: <FaTools className={language === 'ar' ? 'ml-2' : 'mr-2'} /> },
    { id: 'legal', fr: 'Textes juridiques', ar: 'نصوص قانونية', icon: <FaGavel className={language === 'ar' ? 'ml-2' : 'mr-2'} /> },
    { id: 'training', fr: 'Matériel de formation', ar: 'مواد تدريبية', icon: <FaFileAlt className={language === 'ar' ? 'ml-2' : 'mr-2'} /> },
    { id: 'multimedia', fr: 'Ressources multimédias', ar: 'موارد متعددة الوسائط', icon: <FaVideo className={language === 'ar' ? 'ml-2' : 'mr-2'} /> },
  ];

  // Sample resources data
  const resources: Resource[] = [
    {
      id: 1,
      title: {
        fr: "Guide des droits fondamentaux en Algérie",
        ar: "دليل الحقوق الأساسية في الجزائر"
      },
      description: {
        fr: "Un guide complet sur les droits fondamentaux garantis par la Constitution algérienne et les conventions internationales ratifiées par l'Algérie. Ce document présente les mécanismes de protection et les recours disponibles pour les citoyens.",
        ar: "دليل شامل عن الحقوق الأساسية التي يضمنها الدستور الجزائري والاتفاقيات الدولية التي صادقت عليها الجزائر. تقدم هذه الوثيقة آليات الحماية وسبل الانتصاف المتاحة للمواطنين."
      },
      type: "guides",
      format: "PDF",
      thumbnail: "/images/law/justice-law-scales.jpg",
      downloadUrl: "/images/law/justice-law-scales.jpg",
      date: {
        fr: "Janvier 2024",
        ar: "يناير 2024"
      },
      fileSize: "4.2 MB",
      featured: true
    },
    {
      id: 2,
      title: {
        fr: "Boîte à outils pour défenseurs des droits humains",
        ar: "مجموعة أدوات للمدافعين عن حقوق الإنسان"
      },
      description: {
        fr: "Ressources pratiques pour les défenseurs des droits humains, incluant des stratégies de plaidoyer, des modèles de documentation des violations, et des conseils de sécurité numérique.",
        ar: "موارد عملية للمدافعين عن حقوق الإنسان، بما في ذلك استراتيجيات المناصرة، ونماذج لتوثيق الانتهاكات، ونصائح حول الأمن الرقمي."
      },
      type: "toolkits",
      format: "ZIP",
      thumbnail: "/images/programs/advocacy.jpg",
      downloadUrl: "/images/programs/advocacy.jpg",
      date: {
        fr: "Novembre 2023",
        ar: "نوفمبر 2023"
      },
      fileSize: "12.8 MB"
    },
    {
      id: 3,
      title: {
        fr: "Recueil des textes juridiques sur la liberté d'association",
        ar: "مجموعة النصوص القانونية حول حرية تكوين الجمعيات"
      },
      description: {
        fr: "Compilation des lois, décrets et règlements relatifs à la liberté d'association en Algérie, avec annotations et commentaires juridiques.",
        ar: "تجميع للقوانين والمراسيم واللوائح المتعلقة بحرية تكوين الجمعيات في الجزائر، مع تعليقات وشروحات قانونية."
      },
      type: "legal",
      format: "PDF",
      thumbnail: "/images/law-books-library.jpg",
      downloadUrl: "/images/law-books-library.jpg",
      date: {
        fr: "Septembre 2023",
        ar: "سبتمبر 2023"
      },
      fileSize: "3.5 MB"
    },
    {
      id: 4,
      title: {
        fr: "Manuel de formation sur les droits des femmes",
        ar: "دليل تدريبي حول حقوق المرأة"
      },
      description: {
        fr: "Manuel destiné aux formateurs et éducateurs pour animer des sessions de sensibilisation sur les droits des femmes, incluant des activités interactives et études de cas.",
        ar: "دليل موجه للمدربين والمعلمين لتنظيم جلسات توعية حول حقوق المرأة، بما في ذلك أنشطة تفاعلية ودراسات حالة."
      },
      type: "training",
      format: "PDF",
      thumbnail: "/images/programs/rights-education.jpg",
      downloadUrl: "/images/programs/rights-education.jpg",
      date: {
        fr: "Août 2023",
        ar: "أغسطس 2023"
      },
      fileSize: "8.7 MB"
    },
    {
      id: 5,
      title: {
        fr: "Série de webinaires sur l'accès à la justice",
        ar: "سلسلة ندوات عبر الإنترنت حول الوصول إلى العدالة"
      },
      description: {
        fr: "Enregistrements de webinaires animés par des experts juridiques sur les différentes voies d'accès à la justice pour les populations vulnérables.",
        ar: "تسجيلات لندوات عبر الإنترنت يقدمها خبراء قانونيون حول مختلف سبل الوصول إلى العدالة للفئات الضعيفة."
      },
      type: "multimedia",
      format: "MP4",
      thumbnail: "/images/programs/legal-assistance.jpg",
      downloadUrl: "/images/programs/legal-assistance.jpg",
      date: {
        fr: "Juillet 2023",
        ar: "يوليو 2023"
      },
      fileSize: "450 MB"
    },
    {
      id: 6,
      title: {
        fr: "Guide de plaidoyer pour la société civile",
        ar: "دليل المناصرة لمنظمات المجتمع المدني"
      },
      description: {
        fr: "Méthodologies et stratégies de plaidoyer adaptées au contexte algérien pour les organisations de la société civile travaillant sur les questions de droits.",
        ar: "منهجيات واستراتيجيات المناصرة المكيفة مع السياق الجزائري لمنظمات المجتمع المدني العاملة في قضايا الحقوق."
      },
      type: "guides",
      format: "PDF",
      thumbnail: "/images/droits-egaux.jpg",
      downloadUrl: "/images/droits-egaux.jpg",
      date: {
        fr: "Juin 2023",
        ar: "يونيو 2023"
      },
      fileSize: "5.1 MB"
    },
    {
      id: 7,
      title: {
        fr: "Documentation sur les droits des jeunes",
        ar: "وثائق حول حقوق الشباب"
      },
      description: {
        fr: "Ensemble de documents expliquant les droits et protections spécifiques des jeunes dans le cadre légal algérien et international.",
        ar: "مجموعة من الوثائق توضح الحقوق والحماية الخاصة بالشباب في الإطار القانوني الجزائري والدولي."
      },
      type: "guides",
      format: "PDF",
      thumbnail: "/images/programs/foundation-image.jpg",
      downloadUrl: "/images/programs/foundation-image.jpg",
      date: {
        fr: "Mai 2023",
        ar: "مايو 2023"
      },
      fileSize: "6.3 MB"
    },
    {
      id: 8,
      title: {
        fr: "Recueil de jurisprudence sur les droits humains",
        ar: "مجموعة من السوابق القضائية المتعلقة بحقوق الإنسان"
      },
      description: {
        fr: "Compilation de décisions judiciaires importantes relatives aux droits humains en Algérie et dans la région, avec analyse juridique.",
        ar: "تجميع لقرارات قضائية مهمة تتعلق بحقوق الإنسان في الجزائر والمنطقة، مع تحليل قانوني."
      },
      type: "legal",
      format: "PDF",
      thumbnail: "/images/news/partenariats.jpg",
      downloadUrl: "/images/news/partenariats.jpg",
      date: {
        fr: "Avril 2023",
        ar: "أبريل 2023"
      },
      fileSize: "7.8 MB"
    }
  ];

  // Filter resources based on type and search query
  const filteredResources = resources.filter(resource => {
    const matchesType = activeType === 'all' || resource.type === activeType;
    const matchesSearch = searchQuery === '' || 
      resource.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description[language].toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className={rtlClass} key={`resources-${forceRefresh}`} suppressHydrationWarning>
      {/* Page Header */}
      <PageHeader 
        title={pageContent?.title?.[language as 'fr' | 'ar'] || 
          (language === 'fr' ? 'Ressources' : 'الموارد')}
        subtitle={getSectionContent('intro', 
          language === 'fr' 
            ? 'Découvrez nos ressources pour comprendre et défendre les droits fondamentaux.' 
            : 'اكتشف مواردنا لفهم الحقوق الأساسية والدفاع عنها.')}
        language={language as 'fr' | 'ar'}
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
              {pageContent?.title?.[language as 'fr' | 'ar'] || 
                (language === 'fr' ? 'Ressources' : 'الموارد')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="flex flex-col md:flex-row items-center mb-16 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <div className={`md:w-1/2 ${textAlign}`}>
              <h2 className="text-4xl font-bold mb-6 relative inline-block">
                {getSectionTitle('guides', 
                  language === 'fr' ? 'Guides pratiques' : 'أدلة عملية')}
                <div className="w-full h-1 bg-gradient-to-r from-primary to-orange absolute bottom-[-6px] left-0"></div>
              </h2>
              
              <p className="text-lg text-gray-700">
                {getSectionContent('guides', 
                  language === 'fr' 
                    ? 'Nos guides expliquent les droits fondamentaux dans un langage accessible à tous. Téléchargez-les gratuitement et partagez-les avec votre entourage.'
                    : 'توضح أدلتنا الحقوق الأساسية بلغة يسهل فهمها للجميع. قم بتنزيلها مجانًا ومشاركتها مع من حولك.')}
              </p>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative rounded-xl overflow-hidden shadow-xl h-64 w-full">
                <Image 
                  src="/images/law/justice-law-scales.jpg"
                  alt={language === 'fr' ? "Guides pratiques sur les droits" : "أدلة عملية حول الحقوق"}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <p className="text-lg font-medium">
                      {language === 'fr' 
                        ? 'Ressources complètes pour comprendre vos droits' 
                        : 'موارد شاملة لفهم حقوقك'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Search and Filter UI */}
          <motion.div 
            className="mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 mb-10 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange/5 rounded-tr-full"></div>
              
              <div className="flex flex-col md:flex-row gap-6 relative z-10">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={language === 'fr' ? 'Rechercher des ressources...' : 'البحث عن الموارد...'}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm ${textAlign}`}
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                    <div className="absolute top-4 left-4 text-gray-400">
                      <FaSearch className="text-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <motion.div 
              className="flex flex-wrap gap-3 justify-center"
              variants={staggerContainer}
            >
              {resourceTypes.map((type, index) => (
                <motion.button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`flex items-center px-6 py-3 rounded-full transition-all transform hover:scale-105 ${
                    activeType === type.id
                      ? 'bg-gradient-to-r from-primary to-[#8FD694] text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-primary/50 hover:shadow-sm'
                  }`}
                  variants={itemVariant}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {language === 'ar' ? (
                    <>
                      {type.ar}
                      {type.icon}
                    </>
                  ) : (
                    <>
                      {type.icon}
                      {type.fr}
                    </>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Resources Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {filteredResources.length > 0 ? (
              filteredResources.map((resource, index) => (
                <motion.div 
                  key={resource.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
                  variants={itemVariant}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="relative h-56">
                    {resource.thumbnail && (
                      <Image
                        src={resource.thumbnail}
                        alt={resource.title[language]}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-500 hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {resource.format}
                    </div>
                    {resource.featured && (
                      <div className="absolute top-4 left-4 bg-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                        {language === 'fr' ? 'Recommandé' : 'موصى به'}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 min-h-[3rem]">
                      {resource.title[language]}
                    </h3>
                    
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <FaRegCalendarAlt className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                      <span>{resource.date[language]}</span>
                      {resource.fileSize && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{resource.fileSize}</span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-6 min-h-[6rem]">
                      {resource.description[language].length > 200
                        ? `${resource.description[language].substring(0, 200)}...`
                        : resource.description[language]}
                    </p>
                    
                    <div className={`flex justify-between items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <a
                        href={resource.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:text-primary/80 transition-colors"
                      >
                                                 {language === 'ar' ? (
                           <>
                             {'عرض'}
                             <FaExternalLinkAlt className="ml-2" />
                           </>
                         ) : (
                           <>
                             <FaExternalLinkAlt className="mr-2" />
                             {'Consulter'}
                           </>
                         )}
                      </a>
                      
                      <a
                        href={resource.downloadUrl}
                        download
                        className="flex items-center bg-gradient-to-r from-primary to-[#8FD694] hover:bg-gradient-to-r hover:from-primary/90 hover:to-[#8FD694]/90 text-white font-bold py-2 px-4 rounded-full shadow-sm hover:shadow transition-all"
                      >
                                                 {language === 'ar' ? (
                           <>
                             {'تحميل'}
                             <FaDownload className="ml-2" />
                           </>
                         ) : (
                           <>
                             <FaDownload className="mr-2" />
                             {'Télécharger'}
                           </>
                         )}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-3 text-center py-20"
                variants={fadeIn}
              >
                <p className="text-xl text-gray-500">
                  {language === 'fr'
                    ? 'Aucune ressource ne correspond à votre recherche.'
                    : 'لا توجد موارد تطابق بحثك.'}
                </p>
              </motion.div>
            )}
          </motion.div>
          
          {/* Call to Action */}
          <motion.div 
            className="bg-gradient-to-br from-primary/10 to-[#8FD694]/10 rounded-2xl p-12 text-center relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-br-full"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange/10 rounded-tl-full"></div>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#8FD694]/10 rounded-full blur-3xl"></div>
            
            <h3 className="text-3xl font-bold text-gray-800 mb-6 relative inline-block">
              {language === 'fr'
                ? 'Vous cherchez une ressource spécifique ?'
                : 'هل تبحث عن مورد محدد؟'}
              <div className="w-full h-1 bg-gradient-to-r from-orange to-primary absolute bottom-[-6px] left-0"></div>
            </h3>
            
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto text-lg">
              {language === 'fr'
                ? 'Si vous ne trouvez pas la ressource que vous cherchez, n\'hésitez pas à nous contacter. Nous sommes là pour vous aider.'
                : 'إذا لم تجد المورد الذي تبحث عنه، فلا تتردد في الاتصال بنا. نحن هنا لمساعدتك.'}
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href="/contact"
                className="inline-block bg-gradient-to-r from-primary to-[#8FD694] hover:from-primary/90 hover:to-[#8FD694]/90 text-white font-bold py-4 px-8 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                {language === 'fr' ? 'Contactez-nous' : 'اتصل بنا'}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
} 