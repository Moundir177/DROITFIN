'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaDownload, FaFilter, FaSearch } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminSidebar from '@/components/AdminSidebar';
import { getResources, Resource } from '@/lib/database';

export default function AdminResourcesPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsClient(true);
    
    const loadResources = async () => {
      // Load resources from database (localStorage in this demo)
      const loadedResources = await getResources();
      setResources(loadedResources);
      setFilteredResources(loadedResources);
      setIsLoading(false);
    };
    
    loadResources();
  }, []);
  
  useEffect(() => {
    // Filter resources based on search term and selected type
    let filtered = resources;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.title.fr.toLowerCase().includes(term) || 
        resource.title.ar.toLowerCase().includes(term) ||
        resource.description.fr.toLowerCase().includes(term) ||
        resource.description.ar.toLowerCase().includes(term)
      );
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }
    
    setFilteredResources(filtered);
  }, [searchTerm, selectedType, resources]);
  
  // Get unique resource types
  const resourceTypes = ['all', ...new Set(resources.map(resource => resource.type))];
  
  // Format date based on language
  const formatDate = (dateObj: { fr: string; ar: string }) => {
    return language === 'fr' ? dateObj.fr : dateObj.ar;
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
            {language === 'fr' ? 'Gestion des ressources' : 'إدارة الموارد'}
          </h1>
          <Link 
            href="/admin/resources/new"
            className="bg-[#8FD694] text-white px-4 py-2 rounded hover:bg-[#7ac683] transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            {language === 'fr' ? 'Ajouter une ressource' : 'إضافة مورد'}
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            {/* Search */}
            <div className="relative mb-4 md:mb-0 md:w-1/2">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher...' : 'بحث...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-[#8FD694]"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center">
              <FaFilter className="mr-2 text-gray-600" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8FD694]"
              >
                <option value="all">
                  {language === 'fr' ? 'Tous les types' : 'جميع الأنواع'}
                </option>
                {resourceTypes.filter(type => type !== 'all').map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {language === 'fr' 
                ? 'Aucune ressource trouvée. Ajoutez votre première ressource !' 
                : 'لم يتم العثور على موارد. أضف أول مورد لك!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'fr' ? 'Titre' : 'العنوان'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'fr' ? 'Type' : 'النوع'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'fr' ? 'Format' : 'الصيغة'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'fr' ? 'Date' : 'التاريخ'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {language === 'fr' ? 'Actions' : 'إجراءات'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {resource.thumbnail && (
                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                              <img 
                                className="h-10 w-10 object-cover rounded" 
                                src={resource.thumbnail} 
                                alt="" 
                                onError={(e) => {
                                  // Handle image load error
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/placeholder.jpg';
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {language === 'fr' ? resource.title.fr : resource.title.ar}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {language === 'fr' ? resource.description.fr : resource.description.ar}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {resource.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resource.format}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(resource.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link 
                            href={`/admin/resources/edit/${resource.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit />
                          </Link>
                          <a 
                            href={resource.downloadUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaDownload />
                          </a>
                          <button 
                            onClick={() => {
                              if (window.confirm(language === 'fr' 
                                ? 'Êtes-vous sûr de vouloir supprimer cette ressource ?' 
                                : 'هل أنت متأكد أنك تريد حذف هذا المورد؟')) {
                                // Handle delete in a real app
                                alert(language === 'fr' 
                                  ? 'Fonctionnalité de suppression à implémenter' 
                                  : 'وظيفة الحذف للتنفيذ');
                              }
                            }}
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
        </div>
      </main>
    </div>
  );
} 