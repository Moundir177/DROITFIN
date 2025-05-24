'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminSidebar from '@/components/AdminSidebar';
import { getNews, setNews, NewsItem, TranslatedText } from '@/lib/database';
import ImageUploader from '@/components/ImageUploader';

export default function NewNewsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newsItem, setNewsItem] = useState<NewsItem>({
    id: 0, // Will be set during save
    title: { fr: '', ar: '' },
    date: { 
      fr: new Date().toLocaleDateString('fr-FR'), 
      ar: new Date().toLocaleDateString('ar-SA') 
    },
    author: { fr: 'Équipe éditoriale', ar: 'فريق التحرير' },
    category: { fr: 'Actualités', ar: 'أخبار' },
    excerpt: { fr: '', ar: '' },
    image: '/images/news-placeholder.jpg',
    slug: '',
    content: ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (
    field: keyof NewsItem, 
    value: string | TranslatedText, 
    lang?: 'fr' | 'ar'
  ) => {
    setFormErrors(prev => ({ ...prev, [field]: '' }));
    
    if (lang) {
      // For translated fields
      setNewsItem({
        ...newsItem,
        [field]: {
          ...newsItem[field as keyof NewsItem] as TranslatedText,
          [lang]: value
        }
      });
    } else {
      // For non-translated fields
      setNewsItem({
        ...newsItem,
        [field]: value
      });
    }
  };

  const handleImageChange = (imageData: string) => {
    setFormErrors(prev => ({ ...prev, image: '' }));
    
    setNewsItem({
      ...newsItem,
      image: imageData
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate title
    if (!newsItem.title.fr.trim()) {
      errors.title_fr = 'Le titre en français est requis';
    }
    if (!newsItem.title.ar.trim()) {
      errors.title_ar = 'Le titre en arabe est requis';
    }
    
    // Validate excerpt
    if (!newsItem.excerpt.fr.trim()) {
      errors.excerpt_fr = 'L\'extrait en français est requis';
    }
    if (!newsItem.excerpt.ar.trim()) {
      errors.excerpt_ar = 'L\'extrait en arabe est requis';
    }
    
    // Validate image
    if (!newsItem.image.trim()) {
      errors.image = 'L\'image est requise';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      // Get existing news
      const existingNews = await getNews();
      
      // Generate a new ID and slug
      const newId = existingNews.length > 0 
        ? Math.max(...existingNews.map(item => item.id)) + 1 
        : 1;
      
      const newSlug = `/news/${newsItem.title.fr
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`;
      
      const newNewsItem = {
        ...newsItem,
        id: newId,
        slug: newSlug
      };
      
      // Save the new news item
      await setNews([...existingNews, newNewsItem]);
      router.push('/admin/news');
    } catch (error) {
      console.error('Error creating news item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Only render on client side to avoid hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'fr' ? 'Ajouter une actualité' : 'إضافة خبر جديد'}
          </h1>
          <button
            onClick={() => router.push('/admin/news')}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            {language === 'fr' ? 'Retour' : 'رجوع'}
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-md shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
              {language === 'fr' ? 'Informations générales' : 'معلومات عامة'}
            </h2>
            
            {/* Title in French */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'fr' ? 'Titre (Français)' : 'العنوان (بالفرنسية)'}
              </label>
              <input
                type="text"
                value={newsItem.title.fr}
                onChange={(e) => handleChange('title', e.target.value, 'fr')}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#8FD694] ${
                  formErrors.title_fr ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.title_fr && (
                <p className="text-red-500 text-sm mt-1">{formErrors.title_fr}</p>
              )}
            </div>
            
            {/* Title in Arabic */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'fr' ? 'Titre (Arabe)' : 'العنوان (بالعربية)'}
              </label>
              <input
                type="text"
                value={newsItem.title.ar}
                onChange={(e) => handleChange('title', e.target.value, 'ar')}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#8FD694] ${
                  formErrors.title_ar ? 'border-red-500' : 'border-gray-300'
                }`}
                dir="rtl"
              />
              {formErrors.title_ar && (
                <p className="text-red-500 text-sm mt-1">{formErrors.title_ar}</p>
              )}
            </div>
            
            {/* Image URL */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'fr' ? 'Image' : 'الصورة'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={newsItem.image}
                    onChange={(e) => handleChange('image', e.target.value)}
                    placeholder={language === 'fr' ? 'URL de l\'image' : 'رابط الصورة'}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#8FD694] mb-2 ${
                      formErrors.image ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.image && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.image}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {language === 'fr' 
                      ? 'Entrez l\'URL de l\'image ou utilisez le téléchargeur à droite' 
                      : 'أدخل عنوان URL للصورة أو استخدم أداة التحميل على اليمين'}
                  </p>
                </div>
                <div>
                  <ImageUploader
                    initialImage={newsItem.image}
                    onImageChange={handleImageChange}
                    height="h-40"
                  />
                </div>
              </div>
            </div>
            
            {/* Category in French */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'fr' ? 'Catégorie (Français)' : 'الفئة (بالفرنسية)'}
              </label>
              <input
                type="text"
                value={newsItem.category.fr}
                onChange={(e) => handleChange('category', e.target.value, 'fr')}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8FD694]"
              />
            </div>
            
            {/* Category in Arabic */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'fr' ? 'Catégorie (Arabe)' : 'الفئة (بالعربية)'}
              </label>
              <input
                type="text"
                value={newsItem.category.ar}
                onChange={(e) => handleChange('category', e.target.value, 'ar')}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8FD694]"
                dir="rtl"
              />
            </div>
            
            {/* Date in French */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'fr' ? 'Date (Français)' : 'التاريخ (بالفرنسية)'}
              </label>
              <input
                type="text"
                value={newsItem.date.fr}
                onChange={(e) => handleChange('date', e.target.value, 'fr')}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8FD694]"
              />
            </div>
            
            {/* Date in Arabic */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'fr' ? 'Date (Arabe)' : 'التاريخ (بالعربية)'}
              </label>
              <input
                type="text"
                value={newsItem.date.ar}
                onChange={(e) => handleChange('date', e.target.value, 'ar')}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8FD694]"
                dir="rtl"
              />
            </div>
            
            {/* Author in French */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'fr' ? 'Auteur (Français)' : 'المؤلف (بالفرنسية)'}
              </label>
              <input
                type="text"
                value={newsItem.author.fr}
                onChange={(e) => handleChange('author', e.target.value, 'fr')}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8FD694]"
              />
            </div>
            
            {/* Author in Arabic */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'fr' ? 'Auteur (Arabe)' : 'المؤلف (بالعربية)'}
              </label>
              <input
                type="text"
                value={newsItem.author.ar}
                onChange={(e) => handleChange('author', e.target.value, 'ar')}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8FD694]"
                dir="rtl"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
              {language === 'fr' ? 'Contenu' : 'المحتوى'}
            </h2>
            
            {/* Excerpt in French */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'fr' ? 'Extrait (Français)' : 'مقتطف (بالفرنسية)'}
              </label>
              <textarea
                value={newsItem.excerpt.fr}
                onChange={(e) => handleChange('excerpt', e.target.value, 'fr')}
                rows={3}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#8FD694] ${
                  formErrors.excerpt_fr ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.excerpt_fr && (
                <p className="text-red-500 text-sm mt-1">{formErrors.excerpt_fr}</p>
              )}
            </div>
            
            {/* Excerpt in Arabic */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'fr' ? 'Extrait (Arabe)' : 'مقتطف (بالعربية)'}
              </label>
              <textarea
                value={newsItem.excerpt.ar}
                onChange={(e) => handleChange('excerpt', e.target.value, 'ar')}
                rows={3}
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#8FD694] ${
                  formErrors.excerpt_ar ? 'border-red-500' : 'border-gray-300'
                }`}
                dir="rtl"
              />
              {formErrors.excerpt_ar && (
                <p className="text-red-500 text-sm mt-1">{formErrors.excerpt_ar}</p>
              )}
            </div>
            
            {/* Full Content */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                {language === 'fr' ? 'Contenu complet' : 'المحتوى الكامل'}
              </label>
              <textarea
                value={newsItem.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8FD694]"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#8FD694] text-white px-6 py-2 rounded hover:bg-[#7ac683] transition-colors flex items-center"
            >
              {isSaving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  {language === 'fr' ? 'Enregistrement...' : 'جاري الحفظ...'}
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {language === 'fr' ? 'Enregistrer' : 'حفظ'}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
} 