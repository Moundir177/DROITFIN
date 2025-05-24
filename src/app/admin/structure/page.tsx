'use client';

import { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaPlus, FaTrash, FaBars, FaInfoCircle } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminSidebar from '@/components/AdminSidebar';
import { WebsiteStructure, MenuItem, FooterSection, getItem, setItem } from '@/lib/database';

export default function WebsiteStructureEditor() {
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [structure, setStructure] = useState<WebsiteStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('mainMenu');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setIsClient(true);
    loadStructure();
  }, []);

  const loadStructure = async () => {
    setIsLoading(true);
    
    // Get website structure from localStorage
    const websiteStructure = await getItem<WebsiteStructure>('websiteStructure');
    
    if (websiteStructure) {
      setStructure(websiteStructure);
    }
    
    setIsLoading(false);
  };

  const handleMenuItemChange = (index: number, field: string, value: string, lang?: 'fr' | 'ar') => {
    if (!structure) return;
    
    const updatedMenu = [...structure.mainMenu];
    
    if (lang) {
      // Check if field exists and is a TranslatedText before spreading
      const currentField = updatedMenu[index][field as keyof MenuItem];
      
      updatedMenu[index] = {
        ...updatedMenu[index],
        [field]: typeof currentField === 'object' ? {
          ...currentField,
          [lang]: value
        } : { fr: '', ar: '', [lang]: value }
      };
    } else {
      updatedMenu[index] = {
        ...updatedMenu[index],
        [field]: value
      };
    }
    
    setStructure({
      ...structure,
      mainMenu: updatedMenu
    });
  };

  const handleFooterChange = (index: number, field: string, value: string, lang?: 'fr' | 'ar') => {
    if (!structure) return;
    
    const updatedFooter = [...structure.footer];
    
    if (lang) {
      // Check if field exists and is a TranslatedText before spreading
      const currentField = updatedFooter[index][field as keyof FooterSection];
      
      updatedFooter[index] = {
        ...updatedFooter[index],
        [field]: typeof currentField === 'object' ? {
          ...currentField,
          [lang]: value
        } : { fr: '', ar: '', [lang]: value }
      };
    } else {
      updatedFooter[index] = {
        ...updatedFooter[index],
        [field]: value
      };
    }
    
    setStructure({
      ...structure,
      footer: updatedFooter
    });
  };

  const handleFooterLinkChange = (sectionIndex: number, linkIndex: number, field: string, value: string, lang?: 'fr' | 'ar') => {
    if (!structure || !structure.footer[sectionIndex].links) return;
    
    const updatedFooter = [...structure.footer];
    const updatedLinks = [...updatedFooter[sectionIndex].links!];
    
    if (lang) {
      // Check if field exists and is a TranslatedText before spreading
      const currentField = updatedLinks[linkIndex][field as keyof (typeof updatedLinks)[0]];
      
      updatedLinks[linkIndex] = {
        ...updatedLinks[linkIndex],
        [field]: typeof currentField === 'object' ? {
          ...currentField,
          [lang]: value
        } : { fr: '', ar: '', [lang]: value }
      };
    } else {
      updatedLinks[linkIndex] = {
        ...updatedLinks[linkIndex],
        [field]: value
      };
    }
    
    updatedFooter[sectionIndex] = {
      ...updatedFooter[sectionIndex],
      links: updatedLinks
    };
    
    setStructure({
      ...structure,
      footer: updatedFooter
    });
  };

  const addMenuItem = () => {
    if (!structure) return;
    
    const newItem: MenuItem = {
      id: `menu_${Date.now()}`,
      title: { fr: 'Nouveau menu', ar: 'قائمة جديدة' },
      href: '/'
    };
    
    setStructure({
      ...structure,
      mainMenu: [...structure.mainMenu, newItem]
    });
  };

  const removeMenuItem = (index: number) => {
    if (!structure) return;
    
    const updatedMenu = [...structure.mainMenu];
    updatedMenu.splice(index, 1);
    
    setStructure({
      ...structure,
      mainMenu: updatedMenu
    });
  };

  const addFooterSection = () => {
    if (!structure) return;
    
    const newSection: FooterSection = {
      id: `footer_${Date.now()}`,
      title: { fr: 'Nouvelle section', ar: 'قسم جديد' },
      content: { fr: '', ar: '' }
    };
    
    setStructure({
      ...structure,
      footer: [...structure.footer, newSection]
    });
  };

  const removeFooterSection = (index: number) => {
    if (!structure) return;
    
    const updatedFooter = [...structure.footer];
    updatedFooter.splice(index, 1);
    
    setStructure({
      ...structure,
      footer: updatedFooter
    });
  };

  const addFooterLink = (sectionIndex: number) => {
    if (!structure) return;
    
    const updatedFooter = [...structure.footer];
    const section = updatedFooter[sectionIndex];
    
    if (!section.links) {
      section.links = [];
    }
    
    section.links.push({
      text: { fr: 'Nouveau lien', ar: 'رابط جديد' },
      href: '/'
    });
    
    setStructure({
      ...structure,
      footer: updatedFooter
    });
  };

  const removeFooterLink = (sectionIndex: number, linkIndex: number) => {
    if (!structure || !structure.footer[sectionIndex].links) return;
    
    const updatedFooter = [...structure.footer];
    const updatedLinks = [...updatedFooter[sectionIndex].links!];
    
    updatedLinks.splice(linkIndex, 1);
    
    updatedFooter[sectionIndex] = {
      ...updatedFooter[sectionIndex],
      links: updatedLinks
    };
    
    setStructure({
      ...structure,
      footer: updatedFooter
    });
  };

  const handleSave = async () => {
    if (!structure) return;
    
    setIsSaving(true);
    
    try {
      // Save to localStorage
      const success = await setItem('websiteStructure', structure);
      
      if (success) {
        setSuccessMessage(language === 'fr'
          ? 'Structure du site enregistrée avec succès'
          : 'تم حفظ هيكل الموقع بنجاح');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving website structure', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClient || isLoading || !structure) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'fr' ? 'Structure du Site' : 'هيكل الموقع'}
          </h1>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            {isSaving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : (
              <FaSave className="mr-2" />
            )}
            {language === 'fr' ? 'Enregistrer' : 'حفظ'}
          </button>
        </div>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
            {successMessage}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'mainMenu' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('mainMenu')}
            >
              <FaBars className="mr-2 inline" />
              {language === 'fr' ? 'Menu Principal' : 'القائمة الرئيسية'}
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'footer' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('footer')}
            >
              <FaInfoCircle className="mr-2 inline" />
              {language === 'fr' ? 'Pied de Page' : 'تذييل الصفحة'}
            </button>
          </div>
          
          {activeTab === 'mainMenu' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {language === 'fr' ? 'Menu Principal' : 'القائمة الرئيسية'}
                </h2>
                <button
                  onClick={addMenuItem}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                >
                  <FaPlus className="mr-1" />
                  {language === 'fr' ? 'Ajouter un élément' : 'إضافة عنصر'}
                </button>
              </div>
              
              <div className="space-y-4">
                {structure.mainMenu.map((item, index) => (
                  <div key={item.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">{language === 'fr' ? `Élément ${index + 1}` : `العنصر ${index + 1}`}</h3>
                      <button
                        onClick={() => removeMenuItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          {language === 'fr' ? 'Titre (Français)' : 'العنوان (الفرنسية)'}
                        </label>
                        <input
                          type="text"
                          value={item.title.fr}
                          onChange={(e) => handleMenuItemChange(index, 'title', e.target.value, 'fr')}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          {language === 'fr' ? 'Titre (Arabe)' : 'العنوان (العربية)'}
                        </label>
                        <input
                          type="text"
                          value={item.title.ar}
                          onChange={(e) => handleMenuItemChange(index, 'title', e.target.value, 'ar')}
                          className="w-full p-2 border border-gray-300 rounded-md text-right"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        {language === 'fr' ? 'Lien' : 'الرابط'}
                      </label>
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => handleMenuItemChange(index, 'href', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'footer' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {language === 'fr' ? 'Sections du Pied de Page' : 'أقسام تذييل الصفحة'}
                </h2>
                <button
                  onClick={addFooterSection}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                >
                  <FaPlus className="mr-1" />
                  {language === 'fr' ? 'Ajouter une section' : 'إضافة قسم'}
                </button>
              </div>
              
              <div className="space-y-6">
                {structure.footer.map((section, sectionIndex) => (
                  <div key={section.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">{language === 'fr' ? `Section ${sectionIndex + 1}` : `القسم ${sectionIndex + 1}`}</h3>
                      <button
                        onClick={() => removeFooterSection(sectionIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          {language === 'fr' ? 'Titre (Français)' : 'العنوان (الفرنسية)'}
                        </label>
                        <input
                          type="text"
                          value={section.title.fr}
                          onChange={(e) => handleFooterChange(sectionIndex, 'title', e.target.value, 'fr')}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          {language === 'fr' ? 'Titre (Arabe)' : 'العنوان (العربية)'}
                        </label>
                        <input
                          type="text"
                          value={section.title.ar}
                          onChange={(e) => handleFooterChange(sectionIndex, 'title', e.target.value, 'ar')}
                          className="w-full p-2 border border-gray-300 rounded-md text-right"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    
                    {section.content && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">
                          {language === 'fr' ? 'Contenu' : 'المحتوى'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-700 text-sm mb-1">
                              {language === 'fr' ? 'Français' : 'الفرنسية'}
                            </label>
                            <textarea
                              value={section.content.fr}
                              onChange={(e) => handleFooterChange(sectionIndex, 'content', e.target.value, 'fr')}
                              className="w-full p-2 border border-gray-300 rounded-md h-20"
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm mb-1">
                              {language === 'fr' ? 'Arabe' : 'العربية'}
                            </label>
                            <textarea
                              value={section.content.ar}
                              onChange={(e) => handleFooterChange(sectionIndex, 'content', e.target.value, 'ar')}
                              className="w-full p-2 border border-gray-300 rounded-md text-right h-20"
                              dir="rtl"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Links section */}
                    {section.links && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm">
                            {language === 'fr' ? 'Liens' : 'الروابط'}
                          </h4>
                          <button
                            onClick={() => addFooterLink(sectionIndex)}
                            className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-xs"
                          >
                            <FaPlus className="mr-1" />
                            {language === 'fr' ? 'Ajouter un lien' : 'إضافة رابط'}
                          </button>
                        </div>
                        
                        <div className="space-y-3 mt-2">
                          {section.links.map((link, linkIndex) => (
                            <div key={linkIndex} className="border border-gray-200 rounded p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-500">
                                  {language === 'fr' ? `Lien ${linkIndex + 1}` : `الرابط ${linkIndex + 1}`}
                                </span>
                                <button
                                  onClick={() => removeFooterLink(sectionIndex, linkIndex)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                <div>
                                  <label className="block text-gray-700 text-xs mb-1">
                                    {language === 'fr' ? 'Texte (Français)' : 'النص (الفرنسية)'}
                                  </label>
                                  <input
                                    type="text"
                                    value={link.text.fr}
                                    onChange={(e) => handleFooterLinkChange(sectionIndex, linkIndex, 'text', e.target.value, 'fr')}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-gray-700 text-xs mb-1">
                                    {language === 'fr' ? 'Texte (Arabe)' : 'النص (العربية)'}
                                  </label>
                                  <input
                                    type="text"
                                    value={link.text.ar}
                                    onChange={(e) => handleFooterLinkChange(sectionIndex, linkIndex, 'text', e.target.value, 'ar')}
                                    className="w-full p-2 border border-gray-300 rounded-md text-right text-sm"
                                    dir="rtl"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-gray-700 text-xs mb-1">
                                  {language === 'fr' ? 'URL' : 'الرابط'}
                                </label>
                                <input
                                  type="text"
                                  value={link.href}
                                  onChange={(e) => handleFooterLinkChange(sectionIndex, linkIndex, 'href', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 