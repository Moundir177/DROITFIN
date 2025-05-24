'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaUsers, FaBullhorn, FaBook, FaChalkboardTeacher, FaHandsHelping, FaUniversity } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/PageHeader';
import { getPageContent, PageContent } from '@/lib/database';
import Newsletter from '@/components/Newsletter';
import { motion } from 'framer-motion';

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

const programs = [
  {
    id: 'training',
    titleKey: 'programs.training',
    descriptionFr: `Dans le cadre de notre engagement pour la promotion, la diffusion et la protection des droits humains en Algérie, la Fondation pour la promotion des droits a organisé une formation nationale intitulée :\n\n"Les mécanismes nationaux de défense des droits humains", destinée aux jeunes activistes et étudiants en droit issus de toutes les wilayas du pays.\n\nCette initiative s'inscrit dans notre plan stratégique de renforcement des capacités de la jeunesse algérienne engagée, en leur offrant des outils pratiques pour défendre efficacement les droits humains, conformément à la Constitution algérienne de novembre 2020 et aux traités internationaux en vigueur.\n\nLa session a été marquée par plusieurs volets importants, notamment :\n• Une analyse approfondie de la Constitution ainsi que des textes législatifs en vigueur,\n• Un examen des accords internationaux ratifiés par l'Algérie,\n• Des ateliers pratiques visant à maîtriser l'utilisation de ces instruments juridiques dans les contextes professionnels et militants.\n\nNous aurons des formations tout au long de l'année. La prochaine formation sera sur le thème de la protection digitale, programmée pour le mois de juin. Plus de détails seront fournis les jours à venir.`,
    descriptionAr: `في إطار التزامنا بتعزيز ونشر وحماية حقوق الإنسان في الجزائر، نظمت المؤسسة من أجل ترقية الحقوق تدريبًا وطنيًا بعنوان:\n\n"الآليات الوطنية للدفاع عن حقوق الإنسان"، موجه للناشطين الشباب وطلاب القانون من جميع ولايات البلاد.\n\nتندرج هذه المبادرة ضمن خطتنا الاستراتيجية لتعزيز قدرات الشباب الجزائري الملتزم، من خلال تزويدهم بأدوات عملية للدفاع الفعال عن حقوق الإنسان، وفقًا لدستور نوفمبر 2020 والاتفاقيات الدولية السارية.\n\nتميزت الدورة بعدة محاور هامة منها:\n• تحليل معمق للدستور والنصوص التشريعية السارية،\n• دراسة الاتفاقيات الدولية التي صادقت عليها الجزائر،\n• ورشات تطبيقية لإتقان استخدام هذه الأدوات القانونية في السياقات المهنية والنضالية.\n\nستتواصل الدورات التدريبية على مدار السنة، وستكون الدورة القادمة حول موضوع الحماية الرقمية مبرمجة لشهر جوان، وسيتم تقديم تفاصيل أكثر في الأيام القادمة.`,
    icon: <FaChalkboardTeacher className="text-white" />,
    color: 'bg-[#8FD694]',
    featuresFr: [],
    featuresAr: []
  },
  {
    id: 'advocacy',
    titleKey: 'programs.advocacy',
    descriptionFr: 'Campagnes et initiatives pour promouvoir la sensibilisation aux droits humains, plaider en faveur de réformes juridiques et impliquer le public dans la défense des droits.',
    descriptionAr: 'حملات ومبادرات لتعزيز الوعي بحقوق الإنسان، والدعوة إلى إصلاحات قانونية، وإشراك الجمهور في الدفاع عن الحقوق.',
    icon: <FaBullhorn className="text-white" />,
    color: 'bg-[#171717]',
    featuresFr: [
      'Campagnes de sensibilisation du public',
      'Initiatives de réforme des politiques',
      'Stratégies d\'engagement médiatique',
      'Dialogues communautaires',
      'Publications de sensibilisation aux droits'
    ],
    featuresAr: [
      'حملات التوعية العامة',
      'مبادرات إصلاح السياسات',
      'استراتيجيات المشاركة الإعلامية',
      'حوارات مجتمعية',
      'منشورات التوعية بالحقوق'
    ]
  },
  {
    id: 'research',
    titleKey: 'programs.research',
    descriptionFr: 'Documentation systématique des situations des droits humains et recherche sur les questions liées aux droits pour informer le plaidoyer et le développement des politiques.',
    descriptionAr: 'التوثيق المنهجي لأوضاع حقوق الإنسان والبحث في القضايا المتعلقة بالحقوق لإثراء المناصرة وتطوير السياسات.',
    icon: <FaBook className="text-white" />,
    color: 'bg-[#8FD694]',
    featuresFr: [
      'Surveillance des droits humains',
      'Études de recherche thématiques',
      'Documentation des meilleures pratiques',
      'Évaluation d\'impact',
      'Analyse des politiques'
    ],
    featuresAr: [
      'رصد حقوق الإنسان',
      'دراسات بحثية موضوعية',
      'توثيق أفضل الممارسات',
      'تقييم الأثر',
      'تحليل السياسات'
    ]
  }
];

const partners = [
  {
    nameFr: 'Droits de l\'Homme des Nations Unies',
    nameAr: 'حقوق الإنسان بالأمم المتحدة',
    typeFr: 'Organisation Internationale',
    typeAr: 'منظمة دولية'
  },
  {
    nameFr: 'Commission Nationale des Droits de l\'Homme',
    nameAr: 'اللجنة الوطنية لحقوق الإنسان',
    typeFr: 'Institution Gouvernementale',
    typeAr: 'مؤسسة حكومية'
  },
  {
    nameFr: 'Réseau de la Société Civile Algérienne',
    nameAr: 'شبكة المجتمع المدني الجزائري',
    typeFr: 'Réseau Local',
    typeAr: 'شبكة محلية'
  },
  {
    nameFr: 'Groupe des Droits MENA',
    nameAr: 'مجموعة حقوق الشرق الأوسط وشمال أفريقيا',
    typeFr: 'ONG Régionale',
    typeAr: 'منظمة غير حكومية إقليمية'
  },
  {
    nameFr: 'Faculté de Droit de l\'Université d\'Alger',
    nameAr: 'كلية الحقوق بجامعة الجزائر',
    typeFr: 'Institution Académique',
    typeAr: 'مؤسسة أكاديمية'
  },
  {
    nameFr: 'Fondation des Droits Numériques',
    nameAr: 'مؤسسة الحقوق الرقمية',
    typeFr: 'ONG Internationale',
    typeAr: 'منظمة غير حكومية دولية'
  }
];

export default function Programs() {
  const { language, t } = useLanguage();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  
  const loadContent = async () => {
    try {
      const content = await getPageContent('programs');
      
      if (content) {
        console.log('Programs page - Content loaded with sections:', 
          content.sections.map(s => `${s.id}: ${s.title?.fr}`).join(', '));
        setPageContent(content);
        // Force re-render by incrementing the refresh counter
        setForceRefresh(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading programs page content:', error);
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    // Initial content load
    loadContent();
    
    // Add event listeners for content updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'page_programs') {
        console.log('Programs page - Storage change detected');
        loadContent();
      }
    };
    
    const handleContentUpdated = () => {
      console.log('Programs page - Content updated event received');
      loadContent();
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Listen for direct localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for our custom content updated event
    window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // When the language changes, we should refresh the content too
  useEffect(() => {
    console.log('Programs page - Language changed, refreshing content');
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

  // Get page title from content or use default
  const pageTitle = pageContent?.title?.[language as 'fr' | 'ar'] || 
    (language === 'fr' ? 'Nos Programmes' : 'برامجنا');
  
  // Get page subtitle or use default
  const pageSubtitle = getSectionContent('intro',
    language === 'fr' 
      ? 'À travers nos divers programmes, nous travaillons à promouvoir et à protéger les droits humains, à renforcer les capacités de la société civile et à créer une culture de sensibilisation et de défense des droits.' 
      : 'من خلال برامجنا المتنوعة، نعمل على تعزيز وحماية حقوق الإنسان، وبناء قدرات المجتمع المدني، وخلق ثقافة الوعي والدفاع عن الحقوق.');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div key={`programs-${forceRefresh}`} suppressHydrationWarning className="bg-white">
      {/* Page Header */}
      <PageHeader 
        title={pageTitle}
        subtitle={pageSubtitle}
        language={language as 'fr' | 'ar'}
      />
      
      <div className="bg-gray-50 pt-12 pb-24 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <motion.div 
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#2AA084]/40 blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-orange/30 blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-[#8FD694]/30 blur-3xl"
            animate={{
              x: [0, 60, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('our.program.areas')}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-orange mx-auto"></div>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {programs.map((program, index) => (
              <motion.div 
                key={program.id} 
                className="bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                variants={itemVariants}
              >
                <div className={`${program.color} p-6`}>
                  <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    {program.icon}
                  </div>
                  <h2 className="text-xl font-bold text-white">{t(program.titleKey)}</h2>
                  </div>
                  <div className="w-16 h-1 bg-white/20 mt-4"></div>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-6">
                    {language === 'fr' ? program.descriptionFr : program.descriptionAr}
                  </p>
                  <h3 className="font-bold text-gray-900 mb-3">{t('key.components')}</h3>
                  <ul className="space-y-2 mb-6">
                    {(language === 'fr' ? program.featuresFr : program.featuresAr).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className={`text-[#8FD694] mr-2`}>•</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href={`/programs/${program.id}`} 
                    className={`inline-block ${program.color} hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg transition duration-300 hover:shadow-lg`}
                  >
                    {t('learn.more')}
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-lg shadow-xl p-8 mb-24 relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Decorative accent */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#2AA084]/10 to-orange/5 rounded-bl-[100px]"></div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center relative">
              {t('program.impact')}
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-orange mx-auto mt-3"></div>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <motion.div 
                className="text-center relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#8FD694]/5 to-transparent rounded-xl transform -translate-y-6 scale-90 opacity-70"></div>
                <div className="w-24 h-24 rounded-full bg-[#8FD694] flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FaUsers className="text-white text-3xl" />
                </div>
                <motion.h3 
                  className="text-2xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  760+
                </motion.h3>
                <p className="text-gray-700">{t('individuals.trained')}</p>
              </motion.div>
              
              <motion.div 
                className="text-center relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#171717]/5 to-transparent rounded-xl transform -translate-y-6 scale-90 opacity-70"></div>
                <div className="w-24 h-24 rounded-full bg-[#171717] flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FaHandsHelping className="text-white text-3xl" />
                </div>
                <motion.h3 
                  className="text-2xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  25+
                </motion.h3>
                <p className="text-gray-700">{t('partner.organizations')}</p>
              </motion.div>
              
              <motion.div 
                className="text-center relative"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#8FD694]/5 to-transparent rounded-xl transform -translate-y-6 scale-90 opacity-70"></div>
                <div className="w-24 h-24 rounded-full bg-[#8FD694] flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FaUniversity className="text-white text-3xl" />
                </div>
                <motion.h3 
                  className="text-2xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  38+
                </motion.h3>
                <p className="text-gray-700">{t('training.workshops')}</p>
              </motion.div>
            </div>
            
            <p className="text-center text-gray-700 relative z-10">
              {t('programs.reached')}
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-lg shadow-xl p-8 mb-24 relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Enhanced decorative accents */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-orange/5 to-[#2AA084]/10 rounded-br-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-[#8FD694]/10 to-transparent rounded-tl-[100px]"></div>
            
            {/* Animated background elements */}
            <motion.div 
              className="absolute top-1/3 left-1/4 w-6 h-6 rounded-full bg-[#2AA084]/10"
              animate={{
                y: [0, -15, 0],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute bottom-1/3 right-1/4 w-8 h-8 rounded-full bg-orange/10"
              animate={{
                y: [0, 20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className="relative">
              <motion.h2 
                className="text-3xl font-bold text-gray-900 mb-2 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                {t('our.implementation')}
              </motion.h2>
              <motion.p 
                className="text-center text-gray-600 mb-6 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                {t('implementation.subtitle') || "Notre méthodologie assure que nos programmes sont efficaces, inclusifs et adaptés aux besoins locaux."}
              </motion.p>
              <motion.div 
                className="w-28 h-1.5 bg-gradient-to-r from-orange to-primary mx-auto mb-12"
                initial={{ width: 0 }}
                animate={{ width: "7rem" }}
                transition={{ duration: 0.7, delay: 0.4 }}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg border-t border-l border-white/50"
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                  transition: { duration: 0.3 }
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#8FD694]/10 rounded-full blur-xl"></div>
                
                <motion.div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8FD694] to-[#2AA084] flex items-center justify-center shadow-lg mb-6"
                  whileHover={{ 
                    rotate: 5, 
                    scale: 1.05,
                    transition: { duration: 0.2 } 
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('participatory.methodology')}
                </h3>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {t('participatory.description')}
                </p>
                
                <ul className="space-y-4">
                  {['needs.assessments', 'collaborative.design', 'feedback.mechanisms', 'adaptive.strategies'].map((item, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-gray-50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                      whileHover={{ 
                        x: 5, 
                        backgroundColor: "rgba(143, 214, 148, 0.05)",
                        borderColor: "rgba(143, 214, 148, 0.2)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#8FD694]/20 flex items-center justify-center mr-3">
                        <span className="w-2 h-2 rounded-full bg-[#8FD694]"></span>
                      </span>
                      <span className="text-gray-700">{t(item)}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-lg border-t border-l border-white/50"
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                  transition: { duration: 0.3 }
                }}
              >
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#171717]/5 rounded-full blur-xl"></div>
                
                <motion.div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-700 to-[#171717] flex items-center justify-center shadow-lg mb-6"
                  whileHover={{ 
                    rotate: -5, 
                    scale: 1.05,
                    transition: { duration: 0.2 } 
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('results.based')}
                </h3>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {t('results.description')}
                </p>
                
                <ul className="space-y-4">
                  {['clear.objectives', 'monitoring.evaluation', 'lessons.learned', 'improvement.processes'].map((item, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-gray-50"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
                      whileHover={{ 
                        x: -5, 
                        backgroundColor: "rgba(23, 23, 23, 0.02)",
                        borderColor: "rgba(23, 23, 23, 0.1)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#171717]/10 flex items-center justify-center mr-3">
                        <span className="w-2 h-2 rounded-full bg-[#171717]"></span>
                      </span>
                      <span className="text-gray-700">{t(item)}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
            
            {/* Added cycle diagram */}
            <motion.div 
              className="mt-16 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="relative w-full max-w-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-[#8FD694]/5 to-[#2AA084]/5 rounded-xl"></div>
                <div className="relative flex flex-wrap justify-center items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md">
                  <h4 className="w-full text-center text-lg font-bold text-gray-900 mb-4">{t('implementation.cycle') || "Notre cycle de mise en œuvre"}</h4>
                  
                  {['plan', 'implement', 'monitor', 'evaluate', 'improve'].map((step, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full ${index % 2 === 0 ? 'bg-[#8FD694]' : 'bg-[#171717]'} flex items-center justify-center text-white shadow-md`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium mt-2 text-gray-800">
                          {t(`cycle.${step}`) || step}
                        </span>
                      </div>
                      
                      {index < 4 && (
                        <motion.div 
                          className="w-4 h-0.5 bg-gray-300 mx-1"
                          initial={{ width: 0 }}
                          animate={{ width: 16 }}
                          transition={{ duration: 0.4, delay: 1 + (index * 0.2) }}
                        />
                      )}
                    </motion.div>
                  ))}
            </div>
          </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-lg shadow-xl p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Enhanced decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#2AA084]/5 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#8FD694]/5 to-transparent rounded-tr-full"></div>
            
            <motion.div 
              className="absolute top-1/4 right-1/4 w-4 h-4 rounded-full bg-[#8FD694]/20"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div 
              className="absolute bottom-1/4 left-1/4 w-6 h-6 rounded-full bg-[#2AA084]/20"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className="relative">
              <motion.h2 
                className="text-3xl font-bold text-gray-900 mb-2 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                {t('our.partners')}
              </motion.h2>
              <motion.p 
                className="text-center text-gray-600 mb-6 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
              {t('partners.collaborate')}
              </motion.p>
              <motion.div 
                className="w-28 h-1.5 bg-gradient-to-r from-primary to-[#8FD694] mx-auto mb-12"
                initial={{ width: 0 }}
                animate={{ width: "7rem" }}
                transition={{ duration: 0.7, delay: 0.4 }}
              />
            </div>
            
            {/* Partner type filters */}
            <motion.div 
              className="flex flex-wrap justify-center gap-3 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="bg-[#8FD694]/10 text-[#2AA084] font-medium px-4 py-2 rounded-full text-sm">
                {t('all.partners') || "Tous les partenaires"}
              </div>
              <div className="hover:bg-gray-100 text-gray-600 font-medium px-4 py-2 rounded-full text-sm transition-colors cursor-pointer">
                {t('international') || "Internationaux"}
              </div>
              <div className="hover:bg-gray-100 text-gray-600 font-medium px-4 py-2 rounded-full text-sm transition-colors cursor-pointer">
                {t('governmental') || "Gouvernementaux"}
              </div>
              <div className="hover:bg-gray-100 text-gray-600 font-medium px-4 py-2 rounded-full text-sm transition-colors cursor-pointer">
                {t('academic') || "Académiques"}
              </div>
              <div className="hover:bg-gray-100 text-gray-600 font-medium px-4 py-2 rounded-full text-sm transition-colors cursor-pointer">
                {t('civil.society') || "Société civile"}
              </div>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {partners.map((partner, index) => (
                <motion.div 
                  key={index} 
                  className="relative group"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2AA084]/5 via-[#8FD694]/5 to-orange/5 rounded-xl transform translate-y-2 scale-[0.97] blur-sm group-hover:translate-y-3 group-hover:scale-[0.94] transition-all duration-300"></div>
                  
                  <div className="relative bg-white border border-gray-100 hover:border-[#8FD694]/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 group-hover:border-[#8FD694]/20 transition-colors duration-300">
                      <span className="text-2xl text-gray-400 group-hover:text-[#2AA084]">{index % 3 === 0 ? '🌍' : index % 3 === 1 ? '🏛️' : '🎓'}</span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-2 text-center">{language === 'fr' ? partner.nameFr : partner.nameAr}</h3>
                    <div className="mt-1 px-3 py-1 bg-gray-50 rounded-full text-xs text-gray-600 mb-4 group-hover:bg-[#8FD694]/10 group-hover:text-[#2AA084] transition-colors duration-300">
                      {language === 'fr' ? partner.typeFr : partner.typeAr}
                    </div>
                    
                    <motion.div 
                      className="mt-auto text-sm font-medium text-[#2AA084] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ scale: 1.05 }}
                    >
                      {t('view.details') || "Voir les détails"}
                    </motion.div>
                </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Global partnership map */}
            <motion.div 
              className="mt-16 p-6 bg-gray-50 rounded-xl border border-gray-100 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                {t('global.presence') || "Notre présence globale"}
              </h3>
              
              <div className="relative h-[200px] md:h-[300px] bg-white rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-[#2AA084]/5 flex items-center justify-center">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">
                      {t('partners.across.world') || "Nos partenaires à travers le monde"}
                    </p>
                  </div>
                </div>
                
                {/* Animated map dots */}
                <motion.div 
                  className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-[#2AA084]"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="absolute top-2/3 left-1/2 w-2 h-2 rounded-full bg-[#8FD694]"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                />
                <motion.div 
                  className="absolute top-1/4 right-1/3 w-2.5 h-2.5 rounded-full bg-orange"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.7
                  }}
                />
              </div>
              
              <div className="flex justify-center mt-6">
                <div className="inline-flex items-center px-4 py-2 bg-white text-sm font-medium text-gray-700 rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  {t('see.all.locations') || "Voir toutes les localisations"}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
            </div>
          </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Program Impact Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              {language === 'fr' ? 'Impact du Programme' : 'تأثير البرنامج'}
            </h2>
            <div className="flex justify-center mt-4 mb-6">
              <div className="h-1 w-16 bg-[#8FD694] rounded-full"></div>
              <div className="h-1 w-16 bg-[#FF8A00] ml-1 rounded-full"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Stats Card 1 */}
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow"
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-5xl font-bold text-[#8FD694] mb-4">760+</h3>
              <p className="text-gray-700">
                {language === 'fr' 
                  ? 'Personnes formées par nos programmes de renforcement des capacités' 
                  : 'شخص تم تدريبهم من خلال برامجنا لبناء القدرات'}
              </p>
            </motion.div>
            
            {/* Stats Card 2 */}
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow"
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-5xl font-bold text-[#FF8A00] mb-4">25+</h3>
              <p className="text-gray-700">
                {language === 'fr' 
                  ? 'Organisations partenaires collaborant à la mise en œuvre du programme' 
                  : 'منظمة شريكة تتعاون في تنفيذ البرنامج'}
              </p>
            </motion.div>
            
            {/* Stats Card 3 */}
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow"
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-5xl font-bold text-[#2AA084] mb-4">38+</h3>
              <p className="text-gray-700">
                {language === 'fr' 
                  ? 'Ateliers de formation organisés dans différentes régions' 
                  : 'ورشة عمل تدريبية منظمة في مناطق مختلفة'}
              </p>
            </motion.div>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-gray-700 text-lg">
              {language === 'fr' 
                ? 'Nos programmes ont atteint diverses régions d\'Algérie, permettant aux individus et aux organisations de devenir des défenseurs efficaces des droits humains et des valeurs démocratiques.' 
                : 'وصلت برامجنا إلى مناطق مختلفة من الجزائر، مما مكّن الأفراد والمنظمات من أن يصبحوا مدافعين فعالين عن حقوق الإنسان والقيم الديمقراطية.'}
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
} 