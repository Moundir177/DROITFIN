'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminSidebar from '@/components/AdminSidebar';
import { getExactPageContent, setPageContent, PageContent, updateHomePageWithAllSections } from '@/lib/database';
import PageContentEditor from '@/components/PageContentEditor';

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

export default function EditHomePage() {
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
      console.log('EditHomePage: Language changed, refreshing content');
      // This forces a re-render with the new language
      setForceRefresh(prev => prev + 1);
    }
  }, [language, isClient]);

  // Load page content
  const loadContent = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('EditHomePage: Loading home page content');
      
      // First make sure all sections are added to the home page
      await updateHomePageWithAllSections();
      
      // Then get the complete home page content
      const content = await getExactPageContent('home');
      
      if (content) {
        // Make sure we have all required sections for the home page
        const requiredSectionIds = [
          'hero', 'slogan', 'mission', 'droits_egaux', 'objectives', 
          'impact', 'actualites', 'objectifs_details', 'mission_details',
          'programmes', 'identite_visuelle', 'newsletter'
        ];
        
        // Check if any required sections are missing
        const existingSectionIds = content.sections.map(section => section.id);
        
        console.log('EditHomePage: Available sections:', existingSectionIds.join(', '));
        console.log('EditHomePage: Required sections:', requiredSectionIds.join(', '));
        
        const missingSectionIds = requiredSectionIds.filter(id => !existingSectionIds.includes(id));
        
        if (missingSectionIds.length > 0) {
          console.log('EditHomePage: Missing sections:', missingSectionIds.join(', '));
          // Add missing sections on the fly
          for (const id of missingSectionIds) {
            content.sections.push({
              id: id,
              title: {
                fr: id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' '),
                ar: id
              },
              content: {
                fr: `Contenu de la section ${id}`,
                ar: `محتوى القسم ${id}`
              }
            });
          }
        }
        
        console.log(`EditHomePage: Content loaded with ${content.sections.length} sections`);
        setPageData(content);
      } else {
        console.error('EditHomePage: No content found for home page');
      }
    } catch (error) {
      console.error('EditHomePage: Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSave = async (content: PageContent): Promise<boolean> => {
    try {
      console.log('EditHomePage: Saving home page content with sections:', 
        content.sections.map(s => `${s.id}: ${s.title?.fr}`).join(', '));
      
      // Save the content to localStorage
      const success = await setPageContent(content);
      
      if (success) {
        // Force immediate update of the component state
        setPageData(content);
        
        // Convert content to string once for efficiency
        const contentString = JSON.stringify(content);
        
        console.log('EditHomePage: Content saved successfully, dispatching update events');
        
        // Dispatch a custom event to notify all components that content has been updated
        try {
          window.dispatchEvent(new Event(CONTENT_UPDATED_EVENT));
          console.log(`EditHomePage: Dispatched ${CONTENT_UPDATED_EVENT} event`);
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
          
          console.log(`EditHomePage: Dispatched storage events for page_${content.id} and editor_${content.id}`);
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
      console.error('EditHomePage: Error saving content:', error);
      return false;
    }
  };

  // Only render on client side to avoid hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex" key={`home-editor-${forceRefresh}`} suppressHydrationWarning>
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
              {language === 'fr' ? 'Éditer la page d\'accueil' : 'تحرير الصفحة الرئيسية'}
            </h1>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-gray-600 mb-6">
            {language === 'fr' 
              ? 'Modifiez le contenu de la page d\'accueil ci-dessous. Les modifications seront visibles sur le site après l\'enregistrement.'
              : 'قم بتعديل محتوى الصفحة الرئيسية أدناه. ستظهر التغييرات على الموقع بعد الحفظ.'}
          </p>
          
          <PageContentEditor
            pageId="home"
            initialContent={pageContent}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
} 