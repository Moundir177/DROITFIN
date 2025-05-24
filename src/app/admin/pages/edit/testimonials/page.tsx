'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminSidebar from '@/components/AdminSidebar';
import { getExactPageContent, setPageContent, PageContent } from '@/lib/database';
import PageContentEditor from '@/components/PageContentEditor';

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

export default function EditTestimonialsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageContent, setPageData] = useState<PageContent | null>(null);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Load content on client side only
  useEffect(() => {
    setIsClient(true);
    loadContent();
  }, []);

  // When the language changes, we should refresh the content too
  useEffect(() => {
    if (isClient) {
      console.log('EditTestimonialsPage: Language changed, refreshing content');
      // This forces a re-render with the new language
      setForceRefresh(prev => prev + 1);
    }
  }, [language, isClient]);

  // Load page content
  const loadContent = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('EditTestimonialsPage: Loading testimonials page content');
      
      // Get the complete testimonials page content
      const content = await getExactPageContent('testimonials');
      
      if (content) {
        // Define the exact content structure from the screenshots
        const requiredSections = [
          {
            id: 'intro',
            title: {
              fr: 'Témoignages',
              ar: 'الشهادات'
            },
            content: {
              fr: 'Découvrez ce que disent nos partenaires et bénéficiaires sur notre travail.',
              ar: 'اكتشف ما يقوله شركاؤنا والمستفيدون عن عملنا.'
            }
          },
          {
            id: 'header',
            title: {
              fr: 'Ce qu\'ils disent de nous',
              ar: 'ما يقولونه عنا'
            },
            content: {
              fr: 'Voici les témoignages de personnes et d\'organisations qui ont bénéficié de nos programmes et collaboré avec nous.',
              ar: 'فيما يلي شهادات من الأشخاص والمنظمات التي استفادت من برامجنا وتعاونت معنا.'
            }
          },
          {
            id: 'categories',
            title: {
              fr: 'Catégories',
              ar: 'الفئات'
            },
            content: {
              fr: 'Tous\nBénéficiaires\nPartenaires\nVolontaires\nExperts',
              ar: 'الكل\nالمستفيدون\nالشركاء\nالمتطوعون\nالخبراء'
            }
          },
          {
            id: 'coming_soon',
            title: {
              fr: 'Témoignages à venir',
              ar: 'شهادات قادمة'
            },
            content: {
              fr: 'Nous sommes en train de recueillir des témoignages de nos bénéficiaires, partenaires et volontaires. Revenez bientôt pour découvrir leurs expériences avec notre fondation.',
              ar: 'نحن نجمع الشهادات من المستفيدين وشركائنا ومتطوعينا. عد قريبًا لاكتشاف تجاربهم مع مؤسستنا.'
            }
          },
          {
            id: 'share',
            title: {
              fr: 'Partagez votre expérience',
              ar: 'شارك تجربتك'
            },
            content: {
              fr: 'Avez-vous participé à l\'un de nos programmes ou collaboré avec nous ? Nous serions ravis d\'entendre votre histoire.',
              ar: 'هل شاركت في أحد برامجنا أو تعاونت معنا؟ يسعدنا سماع قصتك.'
            }
          },
          {
            id: 'form',
            title: {
              fr: 'Formulaire de témoignage',
              ar: 'نموذج الشهادة'
            },
            content: {
              fr: 'Nom complet\nEmail\nOrganisation\nRôle / Fonction\nVotre expérience avec nous\nPartagez votre expérience en détail...\nVotre évaluation\nSoumettre votre témoignage',
              ar: 'الاسم الكامل\nالبريد الإلكتروني\nالمنظمة\nالدور / الوظيفة\nتجربتك معنا\nشارك تجربتك بالتفصيل...\nتقييمك\nإرسال شهادتك'
            }
          },
          {
            id: 'newsletter',
            title: {
              fr: 'Restez informé(e)',
              ar: 'ابق على اطلاع'
            },
            content: {
              fr: 'Inscrivez-vous à notre newsletter pour recevoir les dernières actualités, publications et événements de la Fondation pour la promotion des droits.',
              ar: 'اشترك في نشرتنا الإخبارية للحصول على آخر الأخبار والمنشورات والأحداث من مؤسسة تعزيز الحقوق.'
            }
          }
        ];
        
        // Get existing section IDs
        const existingSectionIds = content.sections.map(section => section.id);
        console.log('EditTestimonialsPage: Available sections:', existingSectionIds.join(', '));
        
        // Replace content sections with the exact required content
        content.sections = requiredSections;
        
        console.log(`EditTestimonialsPage: Content loaded with ${content.sections.length} sections`);
        setPageData(content);
      } else {
        console.error('EditTestimonialsPage: No content found for testimonials page');
      }
    } catch (error) {
      console.error('EditTestimonialsPage: Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSave = async (content: PageContent): Promise<boolean> => {
    try {
      console.log('EditTestimonialsPage: Saving testimonials page content with sections:', 
        content.sections.map(s => `${s.id}: ${s.title?.fr}`).join(', '));
      
      // Save the content to localStorage
      const success = await setPageContent(content);
      
      if (success) {
        // Force immediate update of the component state
        setPageData(content);
        
        // Convert content to string once for efficiency
        const contentString = JSON.stringify(content);
        
        console.log('EditTestimonialsPage: Content saved successfully, dispatching update events');
        
        // Dispatch a custom event to notify all components that content has been updated
        try {
          window.dispatchEvent(new Event(CONTENT_UPDATED_EVENT));
          console.log(`EditTestimonialsPage: Dispatched ${CONTENT_UPDATED_EVENT} event`);
        } catch (error) {
          console.error(`Error dispatching ${CONTENT_UPDATED_EVENT} event:`, error);
        }
        
        // Force re-rendering of other components by triggering localStorage events
        try {
          // First dispatch for the main page content
          window.dispatchEvent(new StorageEvent('storage', {
            key: `page_${content.id}`,
            newValue: contentString
          }));
          
          // Then dispatch for the editor content
          window.dispatchEvent(new StorageEvent('storage', {
            key: `editor_${content.id}`,
            newValue: contentString
          }));
          
          console.log(`EditTestimonialsPage: Dispatched storage events for page_${content.id} and editor_${content.id}`);
        } catch (error) {
          console.error('Error dispatching storage events:', error);
        }
        
        // Delay redirect to give time for updates to propagate
        setTimeout(() => {
          router.push('/admin/pages');
        }, 1500);
      }
      
      return success;
    } catch (error) {
      console.error('EditTestimonialsPage: Error saving content:', error);
      return false;
    }
  };

  // Only render on client side to avoid hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex" key={`testimonials-editor-${forceRefresh}`} suppressHydrationWarning>
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Link 
              href="/admin/pages" 
              className="mr-4 p-2 bg-white rounded-md shadow hover:shadow-md"
            >
              <FaArrowLeft className="text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {language === 'fr' ? 'Éditer la page Témoignages' : 'تحرير صفحة الشهادات'}
            </h1>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-gray-600 mb-6">
            {language === 'fr' 
              ? 'Modifiez le contenu de la page Témoignages ci-dessous. Les modifications seront visibles sur le site après l\'enregistrement.'
              : 'قم بتعديل محتوى صفحة الشهادات أدناه. ستظهر التغييرات على الموقع بعد الحفظ.'}
          </p>
          
          <PageContentEditor
            pageId="testimonials"
            initialContent={pageContent}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
} 