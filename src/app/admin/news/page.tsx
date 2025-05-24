'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminSidebar from '@/components/AdminSidebar';
import { getNews, deleteNewsItem, NewsItem } from '@/lib/database';

export default function AdminNewsPage() {
  const { language } = useLanguage();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    setIsClient(true);
    const initializeNews = async () => {
      await loadNews();
    };
    initializeNews();
  }, []);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would be an API call
      const news = await getNews();
      setNewsItems(news);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(language === 'fr' 
      ? 'Êtes-vous sûr de vouloir supprimer cette actualité ?' 
      : 'هل أنت متأكد أنك تريد حذف هذا الخبر؟')) {
      await deleteNewsItem(id);
      await loadNews();
    }
  };

  // Filter news items based on search term
  const filteredNews = newsItems.filter(item => 
    item.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.excerpt[language].toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + itemsPerPage);

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
            {language === 'fr' ? 'Gestion des Actualités' : 'إدارة الأخبار'}
          </h1>
          <Link 
            href="/admin/news/new" 
            className="bg-[#8FD694] text-white px-4 py-2 rounded-md hover:bg-[#7ac683] transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            {language === 'fr' ? 'Ajouter' : 'إضافة'}
          </Link>
        </div>
        
        {/* Search Bar */}
        <div className="bg-white rounded-md shadow-md p-4 mb-6">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8FD694]"
                placeholder={language === 'fr' ? 'Rechercher des actualités...' : 'البحث عن الأخبار...'}
              />
            </div>
          </div>
        </div>
        
        {/* News List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-[#8FD694] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">
              {language === 'fr' ? 'Chargement...' : 'جار التحميل...'}
            </p>
          </div>
        ) : (
          <>
            {paginatedNews.length === 0 ? (
              <div className="bg-white rounded-md shadow-md p-8 text-center">
                <p className="text-gray-600">
                  {language === 'fr' 
                    ? 'Aucune actualité trouvée. Ajoutez-en une nouvelle !' 
                    : 'لم يتم العثور على أي أخبار. أضف خبرًا جديدًا!'}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-md shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'fr' ? 'Titre' : 'العنوان'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'fr' ? 'Date' : 'التاريخ'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'fr' ? 'Catégorie' : 'الفئة'}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === 'fr' ? 'Actions' : 'إجراءات'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedNews.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.title[language]}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{item.excerpt[language]}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.date[language]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {item.category[language]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <Link 
                              href={`/admin/news/edit/${item.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:text-[#8FD694]'
                  }`}
                >
                  <FaArrowLeft className="mr-2" />
                  {language === 'fr' ? 'Précédent' : 'السابق'}
                </button>
                
                <div className="text-sm text-gray-700">
                  {language === 'fr'
                    ? `Page ${currentPage} sur ${totalPages}`
                    : `الصفحة ${currentPage} من ${totalPages}`}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:text-[#8FD694]'
                  }`}
                >
                  {language === 'fr' ? 'Suivant' : 'التالي'}
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
} 