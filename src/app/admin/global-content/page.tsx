'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash, FaFilter, FaImage, FaUpload } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminSidebar from '@/components/AdminSidebar';
import { GlobalContent, getGlobalContent, setGlobalContent, getItem, setItem } from '@/lib/database';

export default function GlobalContentEditor() {
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [globalContent, setGlobalContentState] = useState<GlobalContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<GlobalContent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setIsClient(true);
    const initializeContent = async () => {
      await loadGlobalContent();
    };
    initializeContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [selectedCategory, globalContent, searchTerm]);

  const loadGlobalContent = async () => {
    try {
      // First try to get editor content
      let content = await getItem<GlobalContent[]>('editor_global_content');
      
      // If no editor content, get the live content
      if (!content) {
        content = await getGlobalContent();
      }
      
      if (content && content.length > 0) {
        setGlobalContentState(content);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(content.map(item => item.category)));
        setCategories(uniqueCategories);
      } else {
        setGlobalContentState([]);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading global content:', error);
      setGlobalContentState([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = [...globalContent];
    
    // Filter by category if not 'all'
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.key.toLowerCase().includes(term) || 
        item.text.fr.toLowerCase().includes(term) || 
        item.text.ar.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }
    
    setFilteredContent(filtered);
  };

  const handleTextChange = (id: string, lang: 'fr' | 'ar', value: string) => {
    const updatedContent = globalContent.map(item => {
      if (item.id === id) {
        return {
          ...item,
          text: {
            ...item.text,
            [lang]: value
          }
        };
      }
      return item;
    });
    
    setGlobalContentState(updatedContent);
  };

  const handleImageChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const updatedContent = globalContent.map(item => {
        if (item.id === id) {
          return {
            ...item,
            image: reader.result as string
          };
        }
        return item;
      });
      
      setGlobalContentState(updatedContent);
    };
    
    reader.readAsDataURL(file);
  };

  const addNewItem = () => {
    const newItem: GlobalContent = {
      id: `global_${Date.now()}`,
      category: selectedCategory === 'all' ? 'custom' : selectedCategory,
      key: 'new_item',
      text: { fr: '', ar: '' }
    };
    
    setGlobalContentState([...globalContent, newItem]);
  };

  const deleteItem = (id: string) => {
    const updatedContent = globalContent.filter(item => item.id !== id);
    setGlobalContentState(updatedContent);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save to localStorage
      const success = await setGlobalContent(globalContent);
      // Also update editor copy
      await setItem('editor_global_content', globalContent);
      
      if (success) {
        setSuccessMessage(language === 'fr'
          ? 'Contenu global enregistré avec succès'
          : 'تم حفظ المحتوى العام بنجاح');
          
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving global content', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClient || isLoading) {
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
            {language === 'fr' ? 'Contenu Global' : 'المحتوى العام'}
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center">
              <FaFilter className="mr-2 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{language === 'fr' ? 'Toutes les catégories' : 'جميع الفئات'}</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex w-full md:w-auto space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'fr' ? 'Rechercher...' : 'بحث...'}
                className="border border-gray-300 rounded-md px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addNewItem}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <FaPlus className="mr-1" />
                {language === 'fr' ? 'Ajouter' : 'إضافة'}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'fr' ? 'Catégorie' : 'الفئة'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'fr' ? 'Clé' : 'المفتاح'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'fr' ? 'Français' : 'الفرنسية'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'fr' ? 'Arabe' : 'العربية'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'fr' ? 'Image' : 'الصورة'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'fr' ? 'Actions' : 'الإجراءات'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContent.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.key}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <textarea
                        value={item.text.fr}
                        onChange={(e) => handleTextChange(item.id, 'fr', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      ></textarea>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <textarea
                        value={item.text.ar}
                        onChange={(e) => handleTextChange(item.id, 'ar', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        dir="rtl"
                        rows={2}
                      ></textarea>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.category === 'images' && (
                        <div className="flex flex-col items-center space-y-2">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.key} 
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          )}
                          <label className="cursor-pointer px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-xs flex items-center">
                            <FaUpload className="mr-1" />
                            {language === 'fr' ? 'Changer' : 'تغيير'}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageChange(item.id, e)}
                            />
                          </label>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredContent.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              {language === 'fr' ? 'Aucun élément trouvé' : 'لم يتم العثور على أي عنصر'}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 