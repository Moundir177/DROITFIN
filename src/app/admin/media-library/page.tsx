'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash, FaSearch, FaUpload, FaTags, FaEdit, FaDownload, FaFile } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminSidebar from '@/components/AdminSidebar';
import { MediaItem, getMediaLibrary, setMediaLibrary, getItem, setItem } from '@/lib/database';

export default function MediaLibraryEditor() {
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [mediaLibrary, setMediaLibraryState] = useState<MediaItem[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const initializeMedia = async () => {
      await loadMediaLibrary();
    };
    initializeMedia();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [selectedTag, mediaLibrary, searchTerm]);

  const loadMediaLibrary = async () => {
    try {
      // First try to get editor content
      let media = await getItem<MediaItem[]>('editor_media_library');
      
      // If no editor content, get the live content
      if (!media) {
        media = await getMediaLibrary();
      }
      
      if (media && media.length > 0) {
        setMediaLibraryState(media);
        
        // Extract unique tags
        const allTags: string[] = [];
        media.forEach(item => {
          if (item.tags) {
            item.tags.forEach(tag => {
              if (!allTags.includes(tag)) {
                allTags.push(tag);
              }
            });
          }
        });
        
        setTags(allTags);
      } else {
        setMediaLibraryState([]);
        setTags([]);
      }
    } catch (error) {
      console.error('Error loading media library:', error);
      setMediaLibraryState([]);
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMedia = () => {
    let filtered = [...mediaLibrary];
    
    // Filter by tag if not 'all'
    if (selectedTag !== 'all') {
      filtered = filtered.filter(item => item.tags && item.tags.includes(selectedTag));
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.alt.fr.toLowerCase().includes(term) || 
        item.alt.ar.toLowerCase().includes(term) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    setFilteredMedia(filtered);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const newItem: MediaItem = {
          id: `media_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: file.name.split('.')[0],
          path: '',
          url: reader.result as string,
          type: file.type.startsWith('image/') ? 'image' : 'other',
          alt: { fr: file.name, ar: file.name },
          tags: [],
          uploadDate: new Date().toISOString().split('T')[0]
        };
        
        setMediaLibraryState(prev => [...prev, newItem]);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const deleteMedia = (id: string) => {
    if (window.confirm(language === 'fr'
      ? 'Êtes-vous sûr de vouloir supprimer ce média ?'
      : 'هل أنت متأكد من أنك تريد حذف هذه الوسائط؟')) {
      const updatedLibrary = mediaLibrary.filter(item => item.id !== id);
      setMediaLibraryState(updatedLibrary);
    }
  };

  const openEditModal = (item: MediaItem) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setShowEditModal(false);
  };

  const handleEditChange = (field: string, value: any) => {
    if (!editingItem) return;
    
    if (field === 'alt_fr') {
      setEditingItem({
        ...editingItem,
        alt: {
          ...editingItem.alt,
          fr: value
        }
      });
    } else if (field === 'alt_ar') {
      setEditingItem({
        ...editingItem,
        alt: {
          ...editingItem.alt,
          ar: value
        }
      });
    } else if (field === 'tags') {
      setEditingItem({
        ...editingItem,
        tags: value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== '')
      });
    } else {
      setEditingItem({
        ...editingItem,
        [field]: value
      });
    }
  };

  const saveEditChanges = () => {
    if (!editingItem) return;
    
    const updatedLibrary = mediaLibrary.map(item => {
      if (item.id === editingItem.id) {
        return editingItem;
      }
      return item;
    });
    
    setMediaLibraryState(updatedLibrary);
    closeEditModal();
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save to localStorage
      const success = await setMediaLibrary(mediaLibrary);
      // Also update editor copy
      await setItem('editor_media_library', mediaLibrary);
      
      if (success) {
        setSuccessMessage(language === 'fr'
          ? 'Bibliothèque média enregistrée avec succès'
          : 'تم حفظ مكتبة الوسائط بنجاح');
          
        // Extract unique tags
        const allTags: string[] = [];
        mediaLibrary.forEach(item => {
          if (item.tags) {
            item.tags.forEach(tag => {
              if (!allTags.includes(tag)) {
                allTags.push(tag);
              }
            });
          }
        });
        
        setTags(allTags);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving media library', error);
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
            {language === 'fr' ? 'Bibliothèque de médias' : 'مكتبة الوسائط'}
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <FaTags className="mr-2 text-gray-500" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{language === 'fr' ? 'Tous les tags' : 'جميع العلامات'}</option>
                {tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            
            <div className="flex w-full md:w-auto space-x-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'fr' ? 'Rechercher...' : 'بحث...'}
                  className="border border-gray-300 rounded-md pl-10 pr-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              <label className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center cursor-pointer">
                <FaUpload className="mr-1" />
                {language === 'fr' ? 'Importer' : 'رفع'}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {language === 'fr' ? 'Aucun média trouvé' : 'لم يتم العثور على وسائط'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMedia.map(item => (
                <div key={item.id} className="border rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.alt.fr} className="object-cover w-full h-48" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 bg-gray-100">
                        <FaFile className="text-4xl text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">{item.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500 truncate mt-1">{item.alt.fr}</p>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap mt-2">
                        {item.tags.map(tag => (
                          <span key={`${item.id}-${tag}`} className="px-2 py-1 mr-1 mb-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        <FaEdit className="mr-1" />
                        {language === 'fr' ? 'Éditer' : 'تعديل'}
                      </button>
                      <button
                        onClick={() => deleteMedia(item.id)}
                        className="text-red-600 hover:text-red-800 flex items-center text-sm"
                      >
                        <FaTrash className="mr-1" />
                        {language === 'fr' ? 'Supprimer' : 'حذف'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Edit Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {language === 'fr' ? 'Modifier le média' : 'تعديل الوسائط'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'fr' ? 'Nom' : 'الاسم'}
                    </label>
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'fr' ? 'Tags (séparés par des virgules)' : 'العلامات (مفصولة بفواصل)'}
                    </label>
                    <input
                      type="text"
                      value={editingItem.tags ? editingItem.tags.join(', ') : ''}
                      onChange={(e) => handleEditChange('tags', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'fr' ? 'Texte alternatif (Français)' : 'النص البديل (الفرنسية)'}
                  </label>
                  <input
                    type="text"
                    value={editingItem.alt.fr}
                    onChange={(e) => handleEditChange('alt_fr', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'fr' ? 'Texte alternatif (Arabe)' : 'النص البديل (العربية)'}
                  </label>
                  <input
                    type="text"
                    value={editingItem.alt.ar}
                    onChange={(e) => handleEditChange('alt_ar', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    dir="rtl"
                  />
                </div>
                
                {editingItem.type === 'image' && (
                  <div className="mb-4 flex justify-center">
                    <img 
                      src={editingItem.url} 
                      alt={editingItem.alt.fr} 
                      className="max-h-48 max-w-full object-contain rounded-md"
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    {language === 'fr' ? 'Annuler' : 'إلغاء'}
                  </button>
                  <button
                    onClick={saveEditChanges}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {language === 'fr' ? 'Enregistrer' : 'حفظ'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}