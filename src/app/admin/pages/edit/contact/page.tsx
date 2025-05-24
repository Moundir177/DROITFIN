'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminSidebar from '@/components/AdminSidebar';
import { getExactPageContent, setPageContent, PageContent, applyEditorChanges } from '@/lib/database';
import PageContentEditor from '@/components/PageContentEditor';

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

export default function EditContactPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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
      console.log('EditContactPage: Language changed, refreshing content');
      // This forces a re-render with the new language
      setForceRefresh(prev => prev + 1);
    }
  }, [language, isClient]);

  // Load page content
  const loadContent = useCallback(async () => {
    setIsLoading(true);
    setSaveError(null);
    try {
      console.log('EditContactPage: Loading contact page content');
      
      // Get the complete contact page content
      const content = await getExactPageContent('contact');
      
      if (content) {
        // Define the exact content structure for contact page based on the screenshots
        const exactSections = [
          {
            id: 'main_header',
            title: {
              fr: 'Contact',
              ar: 'اتصل بنا'
            },
            content: {
              fr: 'Email: contact@droitfpra.org Téléphone: +213 00 00 00 00 Adresse: Alger, Algérie',
              ar: 'البريد الإلكتروني: contact@droitfpra.org الهاتف: +213 00 00 00 00 العنوان: الجزائر، الجزائر'
            }
          },
          {
            id: 'coordonnees_header',
            title: {
              fr: 'Nos Coordonnées',
              ar: 'بيانات الاتصال'
            },
            content: {
              fr: 'Différentes façons de nous contacter et de nous trouver.',
              ar: 'طرق مختلفة للاتصال بنا والعثور علينا.'
            }
          },
          {
            id: 'bureau_card',
            title: {
              fr: 'Notre Bureau',
              ar: 'مكتبنا'
            },
            content: {
              fr: 'No address available',
              ar: 'لا يوجد عنوان متاح'
            }
          },
          {
            id: 'telephone_card',
            title: {
              fr: 'Téléphone & Fax',
              ar: 'الهاتف والفاكس'
            },
            content: {
              fr: 'No phone available',
              ar: 'لا يوجد هاتف متاح'
            }
          },
          {
            id: 'email_card',
            title: {
              fr: 'Email & Réseaux',
              ar: 'البريد الإلكتروني والشبكات'
            },
            content: {
              fr: 'No email available',
              ar: 'لا يوجد بريد إلكتروني متاح'
            }
          },
          {
            id: 'message_header',
            title: {
              fr: 'Envoyez-nous un Message',
              ar: 'أرسل لنا رسالة'
            },
            content: {
              fr: 'Nous sommes impatients de recevoir votre message et d\'y répondre dans les plus brefs délais.',
              ar: 'نحن متحمسون لتلقي رسالتك والرد عليها في أقرب وقت ممكن.'
            }
          },
          {
            id: 'form_title',
            title: {
              fr: 'Envoyer Message',
              ar: 'إرسال رسالة'
            },
            content: {
              fr: 'Formulaire de contact',
              ar: 'نموذج الاتصال'
            }
          },
          {
            id: 'form_nom',
            title: {
              fr: 'Votre Nom *',
              ar: 'اسمك *'
            },
            content: {
              fr: 'Champ nom du formulaire',
              ar: 'حقل الاسم في النموذج'
            }
          },
          {
            id: 'form_email',
            title: {
              fr: 'Votre Email *',
              ar: 'بريدك الإلكتروني *'
            },
            content: {
              fr: 'Champ email du formulaire',
              ar: 'حقل البريد الإلكتروني في النموذج'
            }
          },
          {
            id: 'form_sujet',
            title: {
              fr: 'Sujet *',
              ar: 'الموضوع *'
            },
            content: {
              fr: 'Champ sujet du formulaire',
              ar: 'حقل الموضوع في النموذج'
            }
          },
          {
            id: 'form_message',
            title: {
              fr: 'Votre Message *',
              ar: 'رسالتك *'
            },
            content: {
              fr: 'Champ message du formulaire',
              ar: 'حقل الرسالة في النموذج'
            }
          },
          {
            id: 'form_button',
            title: {
              fr: 'Envoyer Message',
              ar: 'إرسال الرسالة'
            },
            content: {
              fr: 'Texte du bouton d\'envoi',
              ar: 'نص زر الإرسال'
            }
          },
          {
            id: 'heures_ouverture',
            title: {
              fr: 'Heures d\'Ouverture',
              ar: 'ساعات العمل'
            },
            content: {
              fr: 'contact.weekdays\n8:30 AM - 4:30 PM\n\ncontact.weekend\ncontact.closed',
              ar: 'أيام الأسبوع\n8:30 صباحًا - 4:30 مساءً\n\nنهاية الأسبوع\nمغلق'
            }
          },
          {
            id: 'map',
            title: {
              fr: 'Carte',
              ar: 'الخريطة'
            },
            content: {
              fr: 'Algiers\nAlgeria\nView larger map',
              ar: 'الجزائر\nالجزائر\nعرض خريطة أكبر'
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
          },
          {
            id: 'newsletter_email',
            title: {
              fr: 'Votre adresse e-mail',
              ar: 'عنوان بريدك الإلكتروني'
            },
            content: {
              fr: 'Champ email newsletter',
              ar: 'حقل البريد الإلكتروني للنشرة'
            }
          },
          {
            id: 'newsletter_options',
            title: {
              fr: 'Je souhaite recevoir :',
              ar: 'أرغب في تلقي:'
            },
            content: {
              fr: 'Actualités\nÉvénements\nPublications',
              ar: 'الأخبار\nالفعاليات\nالمنشورات'
            }
          },
          {
            id: 'newsletter_button',
            title: {
              fr: 'S\'inscrire à la newsletter',
              ar: 'الاشتراك في النشرة الإخبارية'
            },
            content: {
              fr: 'Texte du bouton d\'inscription à la newsletter',
              ar: 'نص زر الاشتراك في النشرة الإخبارية'
            }
          },
          {
            id: 'privacy_notice',
            title: {
              fr: 'Mention de confidentialité',
              ar: 'إشعار الخصوصية'
            },
            content: {
              fr: 'En vous inscrivant, vous acceptez notre politique de confidentialité.',
              ar: 'بالتسجيل، فإنك توافق على سياسة الخصوصية الخاصة بنا.'
            }
          },
          {
            id: 'unsubscribe_notice',
            title: {
              fr: 'Désabonnement',
              ar: 'إلغاء الاشتراك'
            },
            content: {
              fr: 'Nous respectons votre vie privée. Désabonnez-vous à tout moment.',
              ar: 'نحن نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.'
            }
          },
          {
            id: 'footer_address',
            title: {
              fr: 'Adresse au pied de page',
              ar: 'العنوان في التذييل'
            },
            content: {
              fr: 'Alger, Algérie',
              ar: 'الجزائر، الجزائر'
            }
          },
          {
            id: 'footer_email',
            title: {
              fr: 'Email au pied de page',
              ar: 'البريد الإلكتروني في التذييل'
            },
            content: {
              fr: 'info@fpra-droits.org',
              ar: 'info@fpra-droits.org'
            }
          },
          {
            id: 'footer_phone',
            title: {
              fr: 'Téléphone au pied de page',
              ar: 'الهاتف في التذييل'
            },
            content: {
              fr: '+213 21 00 00 00',
              ar: '+213 21 00 00 00'
            }
          }
        ];
        
        // Instead of completely replacing, only add missing sections
        // Get existing section IDs
        const existingSectionIds = content.sections.map(section => section.id);
        console.log('EditContactPage: Available sections:', existingSectionIds.join(', '));
        
        // Check if we already have sections
        if (content.sections.length === 0) {
          // If completely empty, use our predefined structure
          content.sections = exactSections;
        } else {
          // Otherwise, add any missing sections from our template
          const missingSections = exactSections.filter(
            section => !existingSectionIds.includes(section.id)
          );
          
          if (missingSections.length > 0) {
            console.log(`EditContactPage: Adding ${missingSections.length} missing sections`);
            content.sections = [...content.sections, ...missingSections];
          }
        }
        
        console.log(`EditContactPage: Content loaded with ${content.sections.length} sections`);
        setPageData(content);
        
        // Pre-save the loaded content to ensure it's available
        await setPageContent(content);
        // Apply changes immediately to make content visible on the site
        await applyEditorChanges('contact');
      } else {
        console.error('EditContactPage: No content found for contact page');
        setSaveError('No content found. Please try refreshing the page.');
      }
    } catch (error) {
      console.error('EditContactPage: Error loading content:', error);
      setSaveError('Error loading content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSave = async (content: PageContent): Promise<boolean> => {
    setSaveSuccess(false);
    setSaveError(null);
    setIsSaving(true);
    
    try {
      console.log('EditContactPage: Saving contact page content with sections:', 
        content.sections.map(s => `${s.id}: ${s.title?.fr}`).join(', '));
      
      // Ensure content ID is set correctly
      content.id = 'contact';
      
      // Save the content to localStorage
      const success = await setPageContent(content);
      
      if (success) {
        // Force immediate update of the component state
        setPageData(content);
        
        // Convert content to string once for efficiency
        const contentString = JSON.stringify(content);
        
        console.log('EditContactPage: Content saved successfully, dispatching update events');
        
        // Dispatch a custom event to notify all components that content has been updated
        try {
          window.dispatchEvent(new Event(CONTENT_UPDATED_EVENT));
          console.log(`EditContactPage: Dispatched ${CONTENT_UPDATED_EVENT} event`);
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
          
          console.log(`EditContactPage: Dispatched storage events for page_${content.id} and editor_${content.id}`);
        } catch (error) {
          console.error('Error dispatching storage events:', error);
        }
        
        // Apply changes immediately
        const applied = await applyEditorChanges('contact');
        if (applied) {
          console.log('EditContactPage: Successfully applied changes to live site');
        } else {
          console.warn('EditContactPage: Failed to apply changes to live site');
        }
        
        // Set success state
        setSaveSuccess(true);
        
        // Delay redirect to give time for updates to propagate
        setTimeout(() => {
          router.push('/admin/pages');
        }, 2000);
      } else {
        setSaveError('Failed to save changes. Please try again.');
      }
      
      return success;
    } catch (error) {
      console.error('EditContactPage: Error saving content:', error);
      setSaveError('Error saving content. Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Manual save function for save button
  const handleManualSave = async () => {
    if (!pageContent) return;
    await handleSave(pageContent);
  };

  // Only render on client side to avoid hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex" key={`contact-editor-${forceRefresh}`} suppressHydrationWarning>
      <AdminSidebar />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">
            {language === 'fr' ? 'Éditer la page Contact' : 'تحرير صفحة الاتصال'}
          </h2>
          
          {saveSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {language === 'fr' 
                ? 'Les modifications ont été enregistrées avec succès !' 
                : 'تم حفظ التغييرات بنجاح!'}
            </div>
          )}
          
          {saveError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {saveError}
            </div>
          )}
          
          <PageContentEditor
            pageId="contact"
            initialContent={pageContent}
            onSave={handleSave}
            isLoading={isLoading}
          />
          
        </div>
      </main>
    </div>
  );
} 