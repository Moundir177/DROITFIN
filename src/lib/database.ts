// This file provides data handling for both client-side development and production
// In development, it uses localStorage directly
// In production, it communicates with the Cloudflare Worker via the API client

import { isProduction, getData, setData, deleteData, initializeDatabaseViaApi } from './api';

// Type for translated text
export interface TranslatedText {
  fr: string;
  ar: string;
}

// Types for different content models
export interface NewsItem {
  id: number;
  title: TranslatedText;
  date: TranslatedText;
  author: TranslatedText;
  category: TranslatedText;
  excerpt: TranslatedText;
  image: string;
  slug: string;
  content: string;
}

export interface Resource {
  id: number;
  title: TranslatedText;
  description: TranslatedText;
  type: string;
  format: string;
  thumbnail?: string;
  downloadUrl: string;
  date: TranslatedText;
  fileSize?: string;
  featured?: boolean;
}

export interface Publication {
  id: number;
  title: TranslatedText;
  date: TranslatedText;
  excerpt: TranslatedText;
  category: PublicationType;
  type: PublicationType;
  pages: number;
  image?: string;
  slug: string;
  pdfUrl: string;
  views?: number;
  listens?: number;
  downloads?: number;
  featured?: boolean;
  duration?: string;
}

export interface PublicationType {
  id: string;
  fr: string;
  ar: string;
}

export interface PageContent {
  id: string;
  title: TranslatedText;
  sections: PageSection[];
}

export interface PageSection {
  id: string;
  title?: TranslatedText;
  content: TranslatedText;
  image?: string;
  metadata?: {
    country?: TranslatedText;
    type?: string;
    [key: string]: any;
  };
}

// Add a new interface for website structure
export interface WebsiteStructure {
  pages: string[];
  mainMenu: MenuItem[];
  footer: FooterSection[];
}

export interface MenuItem {
  id: string;
  title: TranslatedText;
  href: string;
  children?: MenuItem[];
}

export interface FooterSection {
  id: string;
  title: TranslatedText;
  links?: {
    text: TranslatedText;
    href: string;
  }[];
  content?: TranslatedText;
}

// Interface for global content like buttons, labels, and global elements
export interface GlobalContent {
  id: string;
  category: string; // e.g., 'buttons', 'labels', 'errors', 'headers'
  key: string;
  text: TranslatedText;
  image?: string;
}

// Interface for media library items
export interface MediaItem {
  id: string;
  name: string;
  path: string;
  url: string;
  type: string; // image, video, document, etc.
  alt: TranslatedText;
  tags: string[];
  uploadDate: string;
}

// Default data for initialization
// Default news items
const defaultNewsItems: NewsItem[] = [
  {
    id: 1,
    title: {
      fr: "Formation sur les Droits Fondamentaux",
      ar: "دورة تدريبية حول الحقوق الأساسية"
    },
    date: {
      fr: "25 août 2023",
      ar: "25 أغسطس 2023"
    },
    author: {
      fr: "Équipe de Formation",
      ar: "فريق التدريب"
    },
    category: {
      fr: "Formation",
      ar: "تدريب"
    },
    excerpt: {
      fr: "Nouvelle session de formation prévue à Alger pour les défenseurs des droits, axée sur les mécanismes de protection internationale.",
      ar: "دورة تدريبية جديدة مقررة في الجزائر للمدافعين عن الحقوق، تركز على آليات الحماية الدولية."
    },
    image: "/images/training.jpg",
    slug: "formation-droits-fondamentaux",
    content: "Contenu détaillé de la formation..."
  },
  {
    id: 2,
    title: {
      fr: "Table Ronde sur les Réformes Juridiques",
      ar: "طاولة مستديرة حول الإصلاحات القانونية"
    },
    date: {
      fr: "5 août 2023",
      ar: "5 أغسطس 2023"
    },
    author: {
      fr: "Équipe des Événements",
      ar: "فريق الفعاليات"
    },
    category: {
      fr: "Événements",
      ar: "فعاليات"
    },
    excerpt: {
      fr: "Une journée d'étude consacrée aux récentes réformes juridiques et à leur impact sur les droits des citoyens.",
      ar: "يوم دراسي مخصص للإصلاحات القانونية الأخيرة وتأثيرها على حقوق المواطنين."
    },
    image: "/images/round-table.jpg",
    slug: "table-ronde-reformes-juridiques",
    content: "Contenu détaillé de la table ronde..."
  },
  {
    id: 3,
    title: {
      fr: "Journée internationale des droits des migrants",
      ar: "اليوم العالمي لحقوق المهاجرين"
    },
    date: {
      fr: "18 décembre 2023",
      ar: "18 ديسمبر 2023"
    },
    author: {
      fr: "Équipe de Sensibilisation",
      ar: "فريق التوعية"
    },
    category: {
      fr: "Rapports",
      ar: "تقارير"
    },
    excerpt: {
      fr: "À l'occasion de la Journée internationale des droits des migrants, nous mettons en lumière les défis et les avancées concernant la protection des droits des personnes migrantes.",
      ar: "بمناسبة اليوم العالمي لحقوق المهاجرين، نسلط الضوء على التحديات والتقدم المحرز في حماية حقوق المهاجرين."
    },
    image: "/images/migrants-rights.jpg",
    slug: "journee-internationale-droits-migrants",
    content: "Contenu détaillé sur les droits des migrants..."
  }
];

// Default resources
const defaultResources: Resource[] = [
  {
    id: 1,
    title: {
      fr: "Guide des droits fondamentaux",
      ar: "دليل الحقوق الأساسية"
    },
    description: {
      fr: "Un guide complet expliquant les droits fondamentaux garantis par la constitution et les conventions internationales.",
      ar: "دليل شامل يشرح الحقوق الأساسية التي يضمنها الدستور والاتفاقيات الدولية."
    },
    type: "guide",
    format: "pdf",
    thumbnail: "/images/resources/fundamental-rights-guide.jpg",
    downloadUrl: "/resources/guide-droits-fondamentaux.pdf",
    date: {
      fr: "10 janvier 2023",
      ar: "10 يناير 2023"
    },
    fileSize: "2.5 MB",
    featured: true
  },
  {
    id: 2,
    title: {
      fr: "Rapport annuel 2023",
      ar: "التقرير السنوي 2023"
    },
    description: {
      fr: "Notre rapport annuel présentant un aperçu complet de l'état des droits humains en Algérie.",
      ar: "تقريرنا السنوي الذي يقدم نظرة شاملة عن حالة حقوق الإنسان في الجزائر."
    },
    type: "report",
    format: "pdf",
    thumbnail: "/images/resources/annual-report.jpg",
    downloadUrl: "/resources/rapport-annuel-2023.pdf",
    date: {
      fr: "15 mars 2023",
      ar: "15 مارس 2023"
    },
    fileSize: "4.8 MB",
    featured: true
  }
];

// Default website structure
const defaultStructure: WebsiteStructure = {
  pages: [
    "home",
    "about",
    "programs",
    "news",
    "review",
    "resources",
    "testimonials",
    "contact"
  ],
  mainMenu: [
    {
      id: "home",
      title: { fr: "Accueil", ar: "الرئيسية" },
      href: "/"
    },
    {
      id: "about",
      title: { fr: "À Propos", ar: "من نحن" },
      href: "/about"
    },
    {
      id: "programs",
      title: { fr: "Programmes", ar: "البرامج" },
      href: "/programs"
    },
    {
      id: "news",
      title: { fr: "Actualités", ar: "الأخبار" },
      href: "/news"
    },
    {
      id: "review",
      title: { fr: "Revue", ar: "المراجعة" },
      href: "/review"
    },
    {
      id: "resources",
      title: { fr: "Ressources", ar: "الموارد" },
      href: "/resources"
    },
    {
      id: "testimonials",
      title: { fr: "Témoignages", ar: "الشهادات" },
      href: "/testimonials"
    },
    {
      id: "contact",
      title: { fr: "Contact", ar: "اتصل بنا" },
      href: "/contact"
    }
  ],
  footer: [
    {
      id: "quick-links",
      title: { fr: "Liens Rapides", ar: "روابط سريعة" },
      links: [
        {
          text: { fr: "Accueil", ar: "الرئيسية" },
          href: "/"
        },
        {
          text: { fr: "À Propos", ar: "من نحن" },
          href: "/about"
        },
        {
          text: { fr: "Programmes", ar: "البرامج" },
          href: "/programs"
        },
        {
          text: { fr: "Actualités", ar: "الأخبار" },
          href: "/news"
        },
        {
          text: { fr: "Revue", ar: "المراجعة" },
          href: "/review"
        }
      ]
    },
    {
      id: "information",
      title: { fr: "Informations", ar: "معلومات" },
      links: [
        {
          text: { fr: "Ressources", ar: "الموارد" },
          href: "/resources"
        },
        {
          text: { fr: "Témoignages", ar: "الشهادات" },
          href: "/testimonials"
        },
        {
          text: { fr: "civil-society", ar: "civil-society" },
          href: "#"
        },
        {
          text: { fr: "Contact", ar: "اتصل بنا" },
          href: "/contact"
        }
      ]
    }
  ]
};

// Default media library
const defaultMediaLibrary: MediaItem[] = [
  {
    id: "logo",
    name: "Logo principal",
    path: "/images/logo.png",
    url: "/images/logo.png",
    type: "image",
    alt: {
      fr: "Logo de la Fondation pour la Promotion des Droits",
      ar: "شعار مؤسسة ترقية الحقوق"
    },
    tags: ["logo", "identité", "marque"],
    uploadDate: "2023-01-01"
  },
  {
    id: "banner",
    name: "Bannière principale",
    path: "/images/banner.jpg",
    url: "/images/banner.jpg",
    type: "image",
    alt: {
      fr: "Bannière principale du site",
      ar: "شعار الموقع الرئيسي"
    },
    tags: ["bannière", "accueil"],
    uploadDate: "2023-01-02"
  }
];

// Default global content
const defaultGlobalContent: GlobalContent[] = [
  {
    id: 'button_1',
    category: 'buttons',
    key: 'read_more',
    text: {
      fr: 'Lire la suite',
      ar: 'إقرأ المزيد'
    }
  },
  {
    id: 'button_2',
    category: 'buttons',
    key: 'submit',
    text: {
      fr: 'Envoyer',
      ar: 'إرسال'
    }
  },
  {
    id: 'label_1',
    category: 'labels',
    key: 'name',
    text: {
      fr: 'Nom',
      ar: 'الاسم'
    }
  },
  {
    id: 'label_2',
    category: 'labels',
    key: 'email',
    text: {
      fr: 'Email',
      ar: 'البريد الإلكتروني'
    }
  }
];

// Generic function to get data from localStorage or API
export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    console.log(`DROITFIN DEBUG - Getting item: ${key}`);
    
    // In production, use the API
    if (isProduction()) {
      console.log(`DROITFIN DEBUG - Production mode, getting from API: ${key}`);
      const data = await getData<T>(key);
      console.log(`DROITFIN DEBUG - API response for ${key}:`, data);
      return data;
    }
    
    // In development, use localStorage
    console.log(`DROITFIN DEBUG - Development mode, getting from localStorage: ${key}`);
    
    if (typeof window === 'undefined') {
      console.log('DROITFIN DEBUG - Window is undefined (SSR), returning null');
      return null;
    }
    
    // Try to get from localStorage
    const value = localStorage.getItem(key);
    if (!value) {
      console.log(`DROITFIN DEBUG - No value found in localStorage for ${key}`);
      
      // Try to create default content for this key
      if (key.startsWith('page_')) {
        const pageId = key.replace('page_', '');
        console.log(`DROITFIN DEBUG - Creating default content for page: ${pageId}`);
        const defaultContent = createDefaultPageContent(pageId);
        
        if (defaultContent) {
          console.log(`DROITFIN DEBUG - Created default content for ${key}`, defaultContent);
          
          // Save to localStorage for next time
          localStorage.setItem(key, JSON.stringify(defaultContent));
          return defaultContent as unknown as T;
        }
      } else if (key === 'newsItems') {
        // Save default news items
        console.log('DROITFIN DEBUG - Returning default news items');
        localStorage.setItem('newsItems', JSON.stringify(defaultNewsItems));
        return defaultNewsItems as unknown as T;
      } else if (key === 'resources') {
        // Save default resources
        console.log('DROITFIN DEBUG - Returning default resources');
        localStorage.setItem('resources', JSON.stringify(defaultResources));
        return defaultResources as unknown as T;
      } else if (key === 'structure') {
        // Save default structure
        console.log('DROITFIN DEBUG - Returning default structure');
        localStorage.setItem('structure', JSON.stringify(defaultStructure));
        return defaultStructure as unknown as T;
      } else if (key === 'media_library') {
        // Save default media library
        console.log('DROITFIN DEBUG - Returning default media library');
        localStorage.setItem('media_library', JSON.stringify(defaultMediaLibrary));
        return defaultMediaLibrary as unknown as T;
      } else if (key === 'global_content') {
        // Save default global content
        console.log('DROITFIN DEBUG - Returning default global content');
        localStorage.setItem('global_content', JSON.stringify(defaultGlobalContent));
        return defaultGlobalContent as unknown as T;
      }
      
      return null;
    }
    
    try {
      const parsedValue = JSON.parse(value) as T;
      console.log(`DROITFIN DEBUG - Got value from localStorage for ${key}:`, parsedValue);
      return parsedValue;
    } catch (parseError) {
      console.error(`DROITFIN DEBUG - Error parsing JSON for ${key}:`, parseError);
      return null;
    }
  } catch (error) {
    console.error(`DROITFIN DEBUG - Error getting item ${key}:`, error);
    return null;
  }
};

export const setItem = async <T>(key: string, value: T): Promise<boolean> => {
  try {
    console.log(`DROITFIN DEBUG - setItem called for key: ${key}`);
    
    // Check if we're in production
  if (isProduction()) {
      console.log(`DROITFIN DEBUG - Using API for setItem: ${key}`);
      return await setData(key, value);
  }
  
  // In development, use localStorage
    console.log(`DROITFIN DEBUG - Using localStorage for setItem: ${key}`);
    const valueStr = JSON.stringify(value);
    localStorage.setItem(key, valueStr);
  
    // Dispatch storage event for real-time updates across tabs
  try {
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
        newValue: valueStr
    }));
    } catch (error) {
      console.error(`Error dispatching storage event for key ${key}:`, error);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in setItem for key ${key}:`, error);
    return false;
  }
};

export const removeItem = async (key: string): Promise<boolean> => {
  try {
    console.log(`DROITFIN DEBUG - removeItem called for key: ${key}`);
    
    // Check if we're in production
  if (isProduction()) {
      console.log(`DROITFIN DEBUG - Using API for removeItem: ${key}`);
    return await deleteData(key);
  }
  
  // In development, use localStorage
    console.log(`DROITFIN DEBUG - Using localStorage for removeItem: ${key}`);
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error('Error removing item from storage:', e);
    return false;
  }
};

// Data specific functions - modify these to work with promises
export const getNews = async (): Promise<NewsItem[]> => {
  const news = await getItem<NewsItem[]>('newsItems');
  if (news) {
    return news;
  }
  
  console.log('DROITFIN DEBUG - No news items found, returning default news items');
  
  // If we're in development mode, save the default news items to localStorage
  if (!isProduction() && typeof window !== 'undefined') {
    try {
      localStorage.setItem('newsItems', JSON.stringify(defaultNewsItems));
      
      // Dispatch storage event for real-time updates across tabs
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'newsItems',
          newValue: JSON.stringify(defaultNewsItems)
        }));
      } catch (error) {
        console.error('Error dispatching storage event for newsItems:', error);
      }
    } catch (error) {
      console.error('Error saving default news items to localStorage:', error);
    }
  }
  
  return defaultNewsItems;
};

export const setNews = async (news: NewsItem[]): Promise<boolean> => {
  return await setItem('newsItems', news);
};

export const getNewsItem = async (id: number): Promise<NewsItem | null> => {
  const news = await getNews();
  return news.find(item => item.id === id) || null;
};

export const updateNewsItem = async (item: NewsItem): Promise<boolean> => {
  const news = await getNews();
  const index = news.findIndex(i => i.id === item.id);
  
  if (index !== -1) {
    news[index] = item;
    return await setNews(news);
  }
  return false;
};

export const deleteNewsItem = async (id: number): Promise<boolean> => {
  const news = await getNews();
  const filtered = news.filter(item => item.id !== id);
  return await setNews(filtered);
};

export const getResources = async (): Promise<Resource[]> => {
  return await getItem<Resource[]>('resources') || [];
};

export const setResources = async (resources: Resource[]): Promise<boolean> => {
  return await setItem('resources', resources);
};

export const getResource = async (id: number): Promise<Resource | null> => {
  const resources = await getResources();
  return resources.find(item => item.id === id) || null;
};

export const updateResource = async (item: Resource): Promise<boolean> => {
  const resources = await getResources();
  const index = resources.findIndex(i => i.id === item.id);
  
  if (index !== -1) {
    resources[index] = item;
    return await setResources(resources);
  }
  return false;
};

export const deleteResource = async (id: number): Promise<boolean> => {
  const resources = await getResources();
  const filtered = resources.filter(item => item.id !== id);
  return await setResources(filtered);
};

export const getPageContent = async (pageId: string, isEditor: boolean = false): Promise<PageContent | null> => {
  try {
    // Define the key based on whether we're getting the editor version or the live version
    const key = isEditor ? `editor_${pageId}` : `page_${pageId}`;
    
    console.log(`Database: Getting ${isEditor ? 'editor' : 'live'} content for page ${pageId}`);
    
    let content: PageContent | null = null;
    
    // Check if we're in production mode to determine how to get the data
    if (isProduction()) {
      console.log(`Database: In production mode - fetching content for ${pageId} via API`);
      content = await getData<PageContent>(key);
    } else {
      // In development mode, use localStorage
      console.log(`Database: In development mode - getting content for ${pageId} from localStorage`);
      const contentString = localStorage.getItem(key);
      
      if (contentString) {
        try {
          content = JSON.parse(contentString);
        } catch (error) {
          console.error(`Error parsing content for ${pageId}:`, error);
          content = null;
        }
      }
    }
    
    // If no content found, get default content
    if (!content) {
      console.log(`Database: No content found for ${pageId}, using default content`);
      content = getDefaultContent(pageId);
      
      // Save the default content for future use
      if (content) {
        await setPageContent(content);
      }
    }
    
    return content;
  } catch (error) {
    console.error(`Error getting content for page ${pageId}:`, error);
    return getDefaultContent(pageId);
  }
};

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

export const setPageContent = async (content: PageContent): Promise<boolean> => {
  if (!content || !content.id) {
    console.error('Invalid page content: Missing content object or content.id');
    return false;
  }
  
  try {
    console.log(`Database: Saving content for ${content.id} with ${content?.sections?.length || 0} sections`);
    
    // Make sure title exists and has both fr and ar
    if (!content.title) {
      content.title = { 
        fr: content.id.charAt(0).toUpperCase() + content.id.slice(1), 
        ar: content.id 
      };
    } else {
      // Ensure fr and ar properties exist in title
      if (!content.title.fr) {
        content.title.fr = content.id.charAt(0).toUpperCase() + content.id.slice(1);
      }
      if (!content.title.ar) {
        content.title.ar = content.id;
      }
    }
    
    // Ensure sections is always an array
    if (!content.sections) {
      content.sections = [];
    }
    
    // Make sure all sections have their title property defined
    content.sections = content.sections.map(section => {
      // If section is missing title property, add a default one
      if (!section.title) {
        section.title = { 
          fr: section.id.charAt(0).toUpperCase() + section.id.slice(1).replace(/_/g, ' '), 
          ar: section.id 
        };
      } else {
        // Ensure fr and ar properties exist in section title
        if (!section.title.fr) {
          section.title.fr = section.id.charAt(0).toUpperCase() + section.id.slice(1).replace(/_/g, ' ');
        }
        if (!section.title.ar) {
          section.title.ar = section.id;
        }
      }
      
      // Ensure content is defined in each section
      if (!section.content) {
        section.content = { fr: '', ar: '' };
      }
      
      return section;
    });
    
    // Define the keys we need to save to
    const pageKey = `page_${content.id}`;
    const editorKey = `editor_${content.id}`;

    // Check if we're in production mode to determine how to save the data
    if (isProduction()) {
      console.log(`Database: In production mode - saving content for ${content.id} via API`);
      
      // Save the content to both the page and editor versions via API
      const pageSuccess = await setData(pageKey, content);
      const editorSuccess = await setData(editorKey, content);
      
      if (!pageSuccess || !editorSuccess) {
        console.error(`Database: Failed to save content via API for ${content.id}`);
        return false;
      }
    } else {
      // In development mode, use localStorage
      console.log(`Database: In development mode - saving content for ${content.id} to localStorage`);
      
    const contentString = JSON.stringify(content);
    
    // Remove previous items first to avoid any potential conflicts
    localStorage.removeItem(editorKey);
    localStorage.removeItem(pageKey);
    
    // Small delay to ensure removal completed
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Set new content
      localStorage.setItem(editorKey, contentString);
      localStorage.setItem(pageKey, contentString);
    }
      
      console.log(`Database: Updated content for page ${content.id} with ${content.sections.length} sections`);
      
      // Dispatch events to notify all components that content has been updated
      if (typeof window !== 'undefined') {
        // First try to dispatch our custom event
        try {
          const customEvent = new Event(CONTENT_UPDATED_EVENT);
          window.dispatchEvent(customEvent);
          console.log(`Database: Dispatched ${CONTENT_UPDATED_EVENT} event`);
        } catch (error) {
          console.error(`Error dispatching ${CONTENT_UPDATED_EVENT} event:`, error);
        }
        
        // Then dispatch storage events for both keys to ensure all components update
        try {
        const contentString = JSON.stringify(content);
        
          // Dispatch event for page content
        window.dispatchEvent(new StorageEvent('storage', {
            key: pageKey,
          newValue: contentString
        }));
          
          // Dispatch event for editor content
        window.dispatchEvent(new StorageEvent('storage', {
            key: editorKey,
          newValue: contentString
        }));
          
          console.log(`Database: Dispatched storage events for ${pageKey} and ${editorKey}`);
        } catch (error) {
          console.error('Error dispatching storage events:', error);
        }
      }
    
    return true;
  } catch (error) {
    console.error('Error saving page content:', error);
    return false;
  }
};

export const getAllPageIds = async (): Promise<string[]> => {
  if (typeof window === 'undefined') return [];
  
  try {
    const pageKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('page_')) {
        pageKeys.push(key.replace('page_', ''));
      }
    }
    return pageKeys;
  } catch (e) {
    console.error('Error getting page IDs:', e);
    return [];
  }
};

// Helper function to get all pages
export const getAllPages = async (): Promise<PageContent[]> => {
  const pageIds = await getAllPageIds();
  const pages: PageContent[] = [];
  
  for (const id of pageIds) {
    const page = await getPageContent(id);
    if (page !== null) {
      pages.push(page);
    }
  }
  
  return pages;
};

// Function to get all global content
export const getGlobalContent = async (): Promise<GlobalContent[]> => {
  return await getItem<GlobalContent[]>('global_content') || [];
};

// Function to set all global content
export const setGlobalContent = async (content: GlobalContent[]): Promise<boolean> => {
  return await setItem('global_content', content);
};

// Function to get a specific global content item by category and key
export const getGlobalContentItem = async (category: string, key: string): Promise<GlobalContent | null> => {
  const globalContent = await getGlobalContent();
  return globalContent.find(item => item.category === category && item.key === key) || null;
};

// Function to update a specific global content item
export const updateGlobalContentItem = async (item: GlobalContent): Promise<boolean> => {
  const globalContent = await getGlobalContent();
  const index = globalContent.findIndex(i => i.id === item.id);
  
  if (index !== -1) {
    globalContent[index] = item;
    return await setGlobalContent(globalContent);
  }
  
  // Item doesn't exist, add it
  globalContent.push(item);
  return await setGlobalContent(globalContent);
};

// Function to get all text strings for a specific category
export const getCategoryContent = async (category: string): Promise<GlobalContent[]> => {
  const globalContent = await getGlobalContent();
  return globalContent.filter(item => item.category === category);
};

// Function to get all media items
export const getMediaLibrary = async (): Promise<MediaItem[]> => {
  return await getItem<MediaItem[]>('media_library') || [];
};

// Function to set all media items
export const setMediaLibrary = async (media: MediaItem[]): Promise<boolean> => {
  return await setItem('media_library', media);
};

// Function to get a specific media item by id
export const getMediaItem = async (id: string): Promise<MediaItem | null> => {
  const mediaLibrary = await getMediaLibrary();
  return mediaLibrary.find(item => item.id === id) || null;
};

// Function to add or update a media item
export const updateMediaItem = async (item: MediaItem): Promise<boolean> => {
  const mediaLibrary = await getMediaLibrary();
  const index = mediaLibrary.findIndex(i => i.id === item.id);
  
  if (index !== -1) {
    mediaLibrary[index] = item;
    return await setMediaLibrary(mediaLibrary);
  }
  
  // Item doesn't exist, add it
  mediaLibrary.push(item);
  return await setMediaLibrary(mediaLibrary);
};

// Function to delete a media item by id
export const deleteMediaItem = async (id: string): Promise<boolean> => {
  const mediaLibrary = await getMediaLibrary();
  const filtered = mediaLibrary.filter(item => item.id !== id);
  return await setMediaLibrary(filtered);
};

// Function to sync all website content
export const syncContentToEditor = async (): Promise<boolean> => {
  try {
    // Read all rendered pages
    const pages = await getAllPageIds();
    
    // For each page, create a snapshot for the editor
    pages.forEach(pageId => {
      const pageContent = getPageContent(pageId);
      if (pageContent) {
        setItem(`editor_${pageId}`, pageContent);
      }
    });
    
    // Sync news content
    const news = await getNews();
    setItem('editor_news', news);
    
    // Sync resources content
    const resources = await getResources();
    setItem('editor_resources', resources);
    
    // Sync global content
    const globalContent = await getGlobalContent();
    setItem('editor_global_content', globalContent);
    
    // Sync website structure
    const websiteStructure = await getItem<WebsiteStructure>('websiteStructure');
    if (websiteStructure) {
      setItem('editor_websiteStructure', websiteStructure);
    }
    
    // Sync media library
    const mediaLibrary = await getMediaLibrary();
    setItem('editor_media_library', mediaLibrary);
    
    return true;
  } catch (error) {
    console.error('Error syncing content to editor:', error);
    return false;
  }
};

// Function to apply editor changes to the actual website content
export const applyEditorChanges = async (pageId: string): Promise<boolean> => {
  try {
    const editorContent = await getItem<PageContent>(`editor_${pageId}`);
    if (editorContent) {
      // Save directly to the main storage, not just editor version
      setItem(`page_${pageId}`, editorContent);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error applying editor changes for ${pageId}:`, error);
    return false;
  }
};

// Function to update the homepage with all necessary sections
export const updateHomePageWithAllSections = async (): Promise<boolean> => {
  try {
    // Check if the home page exists
    const existingHome = await getPageContent('home');
    
    if (existingHome) {
      // Define all required section IDs for the home page
      const requiredSectionIds = [
        'hero', 'slogan', 'mission', 'droits_egaux', 'objectives', 
        'impact', 'actualites', 'objectifs_details', 'mission_details',
        'programmes', 'identite_visuelle', 'newsletter'
      ];
      
      // Check if any required sections are missing
      const existingSectionIds = existingHome.sections.map(section => section.id);
      const missingSectionIds = requiredSectionIds.filter(id => !existingSectionIds.includes(id));
      
      // If there are no missing sections, return (no update needed)
      if (missingSectionIds.length === 0) {
        return true;
      }
      
      // Get the complete home page content from initialization template
      const completeHome = createDefaultPageContent('home');
      if (!completeHome) return false;
      
      // Add any missing sections to the existing home page
      for (const id of missingSectionIds) {
        const sectionToAdd = completeHome.sections.find(section => section.id === id);
        if (sectionToAdd) {
          existingHome.sections.push(sectionToAdd);
        }
      }
      
      // Save the updated home page
      setPageContent(existingHome);
      return true;
    }
    
    // If home page doesn't exist at all, create it with all sections
    const newHome = createDefaultPageContent('home');
    if (newHome) {
      setPageContent(newHome);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating home page sections:', error);
    return false;
  }
};

// Update the About page with all sections
export const updateAboutPageWithAllSections = async (): Promise<boolean> => {
  try {
    // Get current about page content
    let content = await getPageContent('about');
    
    // If no content exists, create a base content
    if (!content) {
      content = {
        id: 'about',
        title: { fr: 'À Propos', ar: 'من نحن' },
        sections: []
      };
    }
    
    // Define the required sections for About page
    const requiredSections = [
      {
        id: 'intro',
        title: { fr: 'Introduction', ar: 'مقدمة' },
        content: { 
          fr: 'Découvrez notre mission, nos valeurs et notre équipe dédiée à la promotion et à la défense des droits humains.', 
          ar: 'اكتشف مهمتنا وقيمنا وفريقنا المكرس لتعزيز وحماية حقوق الإنسان.' 
        }
      },
      {
        id: 'mission',
        title: { fr: 'Notre mission', ar: 'مهمتنا' },
        content: { 
          fr: 'Notre mission principale est de contribuer à la construction d\'un État de droit solide et inclusif. Pour cela, nous mettons en place des actions de plaidoyer, des campagnes de sensibilisation, des formations juridiques et des programmes d\'éducation civique. Nous exhortons les citoyennes et citoyens à s\'engager activement, à faire respecter la loi et à défendre leurs droits avec responsabilité et solidarité.',
          ar: 'مهمتنا هي تعزيز والدفاع عن الحقوق من خلال التوعية والتدريب وتوثيق الانتهاكات ودعم الفاعلين في المجتمع المدني.'
        }
      },
      {
        id: 'vision',
        title: { fr: 'Notre vision', ar: 'رؤيتنا' },
        content: { 
          fr: '"Contribuer à l\'édification d\'une société où la dignité humaine est respectée et où les droits sont garantis pour tous, sans discrimination."', 
          ar: '"المساهمة في بناء مجتمع تُحترم فيه كرامة الإنسان وتُضمن فيه الحقوق للجميع، دون تمييز."' 
        }
      },
      {
        id: 'justice',
        title: { fr: 'Justice et Droits', ar: 'العدالة والحقوق' },
        content: { 
          fr: 'Face aux défis, nous restons engagés et mobilisés pour faire avancer la justice et promouvoir le respect des droits fondamentaux.',
          ar: 'في مواجهة التحديات، نبقى ملتزمين ومجندين لدفع العدالة وتعزيز احترام الحقوق الأساسية.'
        },
        image: '/images/law/justice-law-scales.jpg'
      },
      {
        id: 'objectives',
        title: { fr: 'Nos objectifs', ar: 'أهدافنا' },
        content: { 
          fr: 'Contribuer et œuvrer à la construction d\'un État de droit en exhortant les citoyens à s\'engager à faire appliquer et respecter la loi et à promouvoir les droits.',
          ar: 'المساهمة والعمل على بناء دولة القانون من خلال حث المواطنين على الالتزام بتطبيق واحترام القانون وتعزيز الحقوق.'
        }
      },
      {
        id: 'objectives_intro',
        title: { fr: 'Introduction aux objectifs', ar: 'مقدمة الأهداف' },
        content: { 
          fr: 'La Fondation pour la promotion des droits poursuit les objectifs suivants pour concrétiser sa vision d\'une société juste et respectueuse des droits fondamentaux.',
          ar: 'تسعى المؤسسة من اجل ترقية الحقوق لتحقيق الأهداف التالية لتجسيد رؤيتها لمجتمع عادل يحترم الحقوق الأساسية.'
        }
      },
      {
        id: 'target_audience',
        title: { fr: 'Notre public cible', ar: 'جمهورنا المستهدف' },
        content: { 
          fr: 'Nos actions et programmes sont conçus pour répondre aux besoins spécifiques de différentes catégories de personnes concernées par les droits humains.',
          ar: 'تم تصميم إجراءاتنا وبرامجنا لتلبية الاحتياجات المحددة لمختلف فئات الأشخاص المعنيين بحقوق الإنسان.'
        }
      },
      {
        id: 'history',
        title: { fr: 'Notre histoire', ar: 'تاريخنا' },
        content: { 
          fr: 'Notre histoire est avant tout celle d\'un engagement collectif. Face aux défis persistants liés au respect des droits fondamentaux, nous avons choisi d\'unir nos expertises et nos convictions pour créer une structure indépendante, transparente et active. Depuis sa création, la Fondation œuvre pour renforcer la culture des droits humains, sensibiliser les citoyennes et citoyens à leurs droits et devoirs, et promouvoir une société fondée sur la loi, la justice et l\'égalité.',
          ar: 'تاريخنا هو قبل كل شيء تاريخ التزام جماعي. في مواجهة التحديات المستمرة المرتبطة باحترام الحقوق الأساسية، اخترنا توحيد خبراتنا وقناعاتنا لإنشاء هيكل مستقل وشفاف ونشط.'
        }
      },
      {
        id: 'founder',
        title: { fr: 'Mot du Gérant', ar: 'كلمة المدير' },
        content: { 
          fr: 'C\'est avec une grande fierté et une profonde conviction que je vous adresse ces quelques mots en tant que gérant de la Fondation pour la promotion des droits. Notre monde traverse une période où les droits fondamentaux sont souvent remis en question, ignorés, voire bafoués. Face à ces défis, il est impératif de ne pas rester silencieux.',
          ar: 'بكل فخر وقناعة عميقة أخاطبكم بهذه الكلمات القليلة كمدير للمؤسسة من اجل ترقية الحقوق. يمر عالمنا بفترة يتم فيها غالبًا التشكيك في الحقوق الأساسية أو تجاهلها أو حتى انتهاكها. في مواجهة هذه التحديات، من الضروري عدم البقاء صامتين.'
        },
        image: '/images/zakaria.jpg'
      }
    ];
    
    // For each required section, check if it exists
    requiredSections.forEach(requiredSection => {
      const existingSection = content.sections.find(s => s.id === requiredSection.id);
      
      if (!existingSection) {
        // If section doesn't exist, add it
        content.sections.push(requiredSection);
      }
    });
    
    // Save the updated content
    setItem(`page_about`, content);
    setItem(`editor_about`, content);
    
    return true;
  } catch (error) {
    console.error('Error updating about page sections:', error);
    return false;
  }
};

// Update the Programs page with all sections
export const updateProgramsPageWithAllSections = async (): Promise<boolean> => {
  try {
    // Get current programs page content
    let content = await getPageContent('programs');
    
    // If no content exists, create a base content
    if (!content) {
      content = {
        id: 'programs',
        title: { fr: 'Nos Programmes', ar: 'برامجنا' },
        sections: []
      };
    }
    
    // Define the required sections for Programs page
    const requiredSections = [
      {
        id: 'intro',
        title: { fr: 'Nos Programmes', ar: 'برامجنا' },
        content: { 
          fr: 'Découvrez les différents programmes à travers lesquels nous travaillons pour promouvoir et protéger les droits fondamentaux.', 
          ar: 'اكتشف البرامج المختلفة التي نعمل من خلالها على تعزيز وحماية الحقوق الأساسية.' 
        }
      },
      {
        id: 'research',
        title: { fr: 'Recherche & Documentation', ar: 'البحث والتوثيق' },
        content: { 
          fr: 'Notre programme de recherche documente systématiquement les situations des droits humains et mène des études sur les questions liées aux droits pour informer le plaidoyer et le développement des politiques.', 
          ar: 'يوثق برنامج البحث لدينا بشكل منهجي حالات حقوق الإنسان ويجري دراسات حول القضايا المتعلقة بالحقوق لإثراء المناصرة وتطوير السياسات.' 
        }
      },
      {
        id: 'training',
        title: { fr: 'Formation & Éducation', ar: 'التدريب والتعليم' },
        content: { 
          fr: 'Dans le cadre de notre engagement pour la promotion, la diffusion et la protection des droits humains en Algérie, la Fondation pour la promotion des droits a organisé une formation nationale intitulée :\n\n"Les mécanismes nationaux de défense des droits humains", destinée aux jeunes activistes et étudiants en droit issus de toutes les wilayas du pays.\n\nCette initiative s\'inscrit dans notre plan stratégique de renforcement des capacités de la jeunesse algérienne engagée, en leur offrant des outils pratiques pour défendre efficacement les droits humains, conformément à la Constitution algérienne de novembre 2020 et aux traités internationaux en vigueur.\n\nLa session a été marquée par plusieurs volets importants, notamment :\n• Une analyse approfondie de la Constitution ainsi que des textes législatifs en vigueur,\n• Un examen des accords internationaux ratifiés par l\'Algérie,\n• Des ateliers pratiques visant à maîtriser l\'utilisation de ces instruments juridiques dans les contextes professionnels et militants.\n\nNous aurons des formations tout au long de l\'année. La prochaine formation sera sur le thème de la protection digitale, programmée pour le mois de juin. Plus de détails seront fournis les jours à venir.', 
          ar: 'في إطار التزامنا بتعزيز ونشر وحماية حقوق الإنسان في الجزائر، نظمت المؤسسة من أجل ترقية الحقوق تدريبًا وطنيًا بعنوان:\n\n"الآليات الوطنية للدفاع عن حقوق الإنسان"، موجه للناشطين الشباب وطلاب القانون من جميع ولايات البلاد.\n\nتندرج هذه المبادرة ضمن خطتنا الاستراتيجية لتعزيز قدرات الشباب الجزائري الملتزم، من خلال تزويدهم بأدوات عملية للدفاع الفعال عن حقوق الإنسان، وفقًا لدستور نوفمبر 2020 والاتفاقيات الدولية السارية.\n\nتميزت الدورة بعدة محاور هامة منها:\n• تحليل معمق للدستور والنصوص التشريعية السارية،\n• دراسة الاتفاقيات الدولية التي صادقت عليها الجزائر،\n• ورشات تطبيقية لإتقان استخدام هذه الأدوات القانونية في السياقات المهنية والنضالية.\n\nستتواصل الدورات التدريبية على مدار السنة، وستكون الدورة القادمة حول موضوع الحماية الرقمية مبرمجة لشهر جوان، وسيتم تقديم تفاصيل أكثر في الأيام القادمة.' 
        }
      },
      {
        id: 'advocacy',
        title: { fr: 'Plaidoyer & Campagnes', ar: 'المناصرة والحملات' },
        content: { 
          fr: 'Nous défendons des changements systémiques en engageant les décideurs politiques, en sensibilisant le public et en mobilisant des actions collectives pour les droits fondamentaux.', 
          ar: 'ندافع عن التغييرات المنهجية من خلال إشراك صناع السياسات ورفع الوعي العام وتعبئة العمل الجماعي للحقوق الأساسية.' 
        }
      },
      {
        id: 'implementation',
        title: { fr: 'Notre Approche de Mise en Œuvre', ar: 'منهجية التنفيذ' },
        content: { 
          fr: 'Notre méthodologie assure que nos programmes sont efficaces, inclusifs et adaptés aux besoins locaux.', 
          ar: 'تضمن منهجيتنا أن تكون برامجنا فعالة وشاملة ومكيفة للاحتياجات المحلية.' 
        }
      },
      {
        id: 'implementation_subtitle',
        title: { fr: 'Sous-titre de mise en œuvre', ar: 'العنوان الفرعي للتنفيذ' },
        content: { 
          fr: 'implementation.subtitle', 
          ar: 'implementation.subtitle' 
        }
      },
      {
        id: 'participatory',
        title: { fr: 'Méthodologie Participative', ar: 'المنهجية التشاركية' },
        content: { 
          fr: 'Nous utilisons des approches participatives qui impliquent les bénéficiaires dans la conception et la mise en œuvre des programmes, assurant la pertinence, l\'appropriation et la durabilité. Nos méthodes comprennent:', 
          ar: 'نستخدم مناهج تشاركية تشرك المستفيدين في تصميم وتنفيذ البرامج، مما يضمن الملاءمة والملكية والاستدامة. تشمل طرقنا:' 
        }
      },
      {
        id: 'results_based',
        title: { fr: 'Gestion Axée sur les Résultats', ar: 'الإدارة القائمة على النتائج' },
        content: { 
          fr: 'Nous mettons en œuvre un cadre de gestion axée sur les résultats pour assurer l\'efficacité et l\'impact des programmes. Notre approche comprend:', 
          ar: 'نقوم بتنفيذ إطار الإدارة القائمة على النتائج لضمان فعالية وتأثير البرامج. يتضمن نهجنا:' 
        }
      },
      {
        id: 'implementation_cycle',
        title: { fr: 'Cycle de mise en œuvre', ar: 'دورة التنفيذ' },
        content: { 
          fr: 'Notre cycle de mise en œuvre', 
          ar: 'دورة التنفيذ لدينا' 
        }
      },
      {
        id: 'impact',
        title: { fr: 'Impact du Programme', ar: 'تأثير البرنامج' },
        content: { 
          fr: 'Les chiffres qui reflètent notre engagement et notre impact dans la promotion et la défense des droits.', 
          ar: 'الأرقام التي تعكس التزامنا وتأثيرنا في تعزيز والدفاع عن الحقوق.' 
        }
      },
      {
        id: 'impact_trained',
        title: { fr: 'Personnes Formées', ar: 'الأشخاص المدربين' },
        content: { 
          fr: '760+\nPersonnes formées par nos programmes de renforcement des capacités', 
          ar: '+760\nشخص تم تدريبهم من خلال برامجنا لبناء القدرات' 
        }
      },
      {
        id: 'impact_partners',
        title: { fr: 'Organisations Partenaires', ar: 'المنظمات الشريكة' },
        content: { 
          fr: '25+\nOrganisations partenaires collaborant à la mise en œuvre du programme', 
          ar: '+25\nمنظمة شريكة تتعاون في تنفيذ البرنامج' 
        }
      },
      {
        id: 'impact_workshops',
        title: { fr: 'Ateliers de Formation', ar: 'ورش العمل التدريبية' },
        content: { 
          fr: '38+\nAteliers de formation organisés dans différentes régions', 
          ar: '+38\nورشة عمل تدريبية منظمة في مناطق مختلفة' 
        }
      },
      {
        id: 'impact_regions',
        title: { fr: 'Impact Régional', ar: 'التأثير الإقليمي' },
        content: { 
          fr: 'Nos programmes ont atteint diverses régions d\'Algérie, permettant aux individus et aux organisations de devenir des défenseurs efficaces des droits humains et des valeurs démocratiques.', 
          ar: 'وصلت برامجنا إلى مناطق مختلفة من الجزائر، مما مكّن الأفراد والمنظمات من أن يصبحوا مدافعين فعالين عن حقوق الإنسان والقيم الديمقراطية.' 
        }
      },
      {
        id: 'partners',
        title: { fr: 'Nos Partenaires', ar: 'شركاؤنا' },
        content: { 
          fr: 'Nous collaborons avec divers partenaires pour améliorer l\'impact et la portée de nos programmes.', 
          ar: 'نتعاون مع شركاء متنوعين لتحسين تأثير ومدى برامجنا.' 
        }
      },
      {
        id: 'global_presence',
        title: { fr: 'Notre présence globale', ar: 'تواجدنا العالمي' },
        content: { 
          fr: 'Nos partenaires à travers le monde', 
          ar: 'شركاؤنا حول العالم' 
        }
      }
    ];
    
    // For each required section, check if it exists
    requiredSections.forEach(requiredSection => {
      const existingSection = content.sections.find(s => s.id === requiredSection.id);
      
      if (!existingSection) {
        // If section doesn't exist, add it
        content.sections.push(requiredSection);
      }
    });
    
    // Save the updated content
    setItem(`page_programs`, content);
    setItem(`editor_programs`, content);
    
    return true;
  } catch (error) {
    console.error('Error updating programs page sections:', error);
    return false;
  }
};

// Create default content for a page if none exists
const createDefaultPageContent = (pageId: string): PageContent | null => {
  const defaultTitles: {[key: string]: TranslatedText} = {
    'home': { fr: 'Accueil', ar: 'الرئيسية' },
    'about': { fr: 'À Propos', ar: 'من نحن' },
    'programs': { fr: 'Programmes', ar: 'البرامج' },
    'news': { fr: 'Actualités', ar: 'الأخبار' },
    'resources': { fr: 'Ressources', ar: 'الموارد' },
    'testimonials': { fr: 'Témoignages', ar: 'الشهادات' },
    'review': { fr: 'Revue & Publications', ar: 'المراجعة والمنشورات' },
    'contact': { fr: 'Contact', ar: 'اتصل بنا' }
  };

  if (!defaultTitles[pageId]) {
    return null;
  }

  // For home page, return template with all sections
  if (pageId === 'home') {
    return {
      id: 'home',
      title: { fr: 'Accueil', ar: 'الرئيسية' },
      sections: [
        {
          id: 'hero',
          title: {
            fr: 'Bannière principale',
            ar: 'البانر الرئيسي'
          },
          content: {
            fr: 'Bienvenue sur notre site',
            ar: 'مرحبا بكم في موقعنا'
          }
        },
        {
          id: 'slogan',
          title: {
            fr: 'Slogan',
            ar: 'شعار'
          },
          content: {
            fr: 'Ensemble, pour des droits connus, reconnus et défendus.',
            ar: 'معاً، من أجل حقوق معروفة ومعترف بها ومحمية.'
          }
        },
        {
          id: 'mission',
          title: {
            fr: 'Notre mission',
            ar: 'مهمتنا'
          },
          content: {
            fr: 'Nous œuvrons pour promouvoir les droits humains et la justice sociale à travers l\'information, la sensibilisation et l\'assistance juridique.',
            ar: 'نحن نعمل على تعزيز حقوق الإنسان والعدالة الاجتماعية من خلال المعلومات والتوعية والمساعدة القانونية.'
          }
        }
      ]
    };
  }

  // For about page, return template with all sections
  if (pageId === 'about') {
    return {
      id: 'about',
      title: { fr: 'À propos', ar: 'حول' },
      sections: [
        {
          id: 'history',
          title: {
            fr: 'Notre histoire',
            ar: 'تاريخنا'
          },
          content: {
            fr: 'Fondée en 2020, notre fondation travaille sans relâche pour défendre les droits humains.',
            ar: 'تأسست في عام 2020، تعمل مؤسستنا بلا كلل للدفاع عن حقوق الإنسان.'
          }
        }
      ]
    };
  }

  // For programs page, return template with all sections
  if (pageId === 'programs') {
    return {
      id: 'programs',
      title: { fr: 'Nos Programmes', ar: 'برامجنا' },
      sections: [
        {
          id: 'intro',
          title: {
            fr: 'Nos Programmes',
            ar: 'برامجنا'
          },
          content: {
            fr: 'Découvrez les différents programmes à travers lesquels nous travaillons pour promouvoir et protéger les droits fondamentaux.',
            ar: 'اكتشف البرامج المختلفة التي نعمل من خلالها على تعزيز وحماية الحقوق الأساسية.'
          }
        },
        {
          id: 'research',
          title: {
            fr: 'Recherche & Documentation',
            ar: 'البحث والتوثيق'
          },
          content: {
            fr: 'Notre programme de recherche documente systématiquement les situations des droits humains et mène des études sur les questions liées aux droits pour informer le plaidoyer et le développement des politiques.',
            ar: 'يوثق برنامج البحث لدينا بشكل منهجي حالات حقوق الإنسان ويجري دراسات حول القضايا المتعلقة بالحقوق لإثراء المناصرة وتطوير السياسات.'
          }
        },
        {
          id: 'training',
          title: {
            fr: 'Formation & Éducation',
            ar: 'التدريب والتعليم'
          },
          content: {
            fr: 'Dans le cadre de notre engagement pour la promotion, la diffusion et la protection des droits humains en Algérie, la Fondation pour la promotion des droits a organisé une formation nationale intitulée :\n\n"Les mécanismes nationaux de défense des droits humains", destinée aux jeunes activistes et étudiants en droit issus de toutes les wilayas du pays.\n\nCette initiative s\'inscrit dans notre plan stratégique de renforcement des capacités de la jeunesse algérienne engagée, en leur offrant des outils pratiques pour défendre efficacement les droits humains, conformément à la Constitution algérienne de novembre 2020 et aux traités internationaux en vigueur.\n\nLa session a été marquée par plusieurs volets importants, notamment :\n• Une analyse approfondie de la Constitution ainsi que des textes législatifs en vigueur,\n• Un examen des accords internationaux ratifiés par l\'Algérie,\n• Des ateliers pratiques visant à maîtriser l\'utilisation de ces instruments juridiques dans les contextes professionnels et militants.\n\nNous aurons des formations tout au long de l\'année. La prochaine formation sera sur le thème de la protection digitale, programmée pour le mois de juin. Plus de détails seront fournis les jours à venir.', 
            ar: 'في إطار التزامنا بتعزيز ونشر وحماية حقوق الإنسان في الجزائر، نظمت المؤسسة من أجل ترقية الحقوق تدريبًا وطنيًا بعنوان:\n\n"الآليات الوطنية للدفاع عن حقوق الإنسان"، موجه للناشطين الشباب وطلاب القانون من جميع ولايات البلاد.\n\nتندرج هذه المبادرة ضمن خطتنا الاستراتيجية لتعزيز قدرات الشباب الجزائري الملتزم، من خلال تزويدهم بأدوات عملية للدفاع الفعال عن حقوق الإنسان، وفقًا لدستور نوفمبر 2020 والاتفاقيات الدولية السارية.\n\nتميزت الدورة بعدة محاور هامة منها:\n• تحليل معمق للدستور والنصوص التشريعية السارية،\n• دراسة الاتفاقيات الدولية التي صادقت عليها الجزائر،\n• ورشات تطبيقية لإتقان استخدام هذه الأدوات القانونية في السياقات المهنية والنضالية.\n\nستتواصل الدورات التدريبية على مدار السنة، وستكون الدورة القادمة حول موضوع الحماية الرقمية مبرمجة لشهر جوان، وسيتم تقديم تفاصيل أكثر في الأيام القادمة.' 
          }
        },
        {
          id: 'advocacy',
          title: { fr: 'Plaidoyer & Campagnes', ar: 'المناصرة والحملات' },
          content: { 
            fr: 'Nous défendons des changements systémiques en engageant les décideurs politiques, en sensibilisant le public et en mobilisant des actions collectives pour les droits fondamentaux.', 
            ar: 'ندافع عن التغييرات المنهجية من خلال إشراك صناع السياسات ورفع الوعي العام وتعبئة العمل الجماعي للحقوق الأساسية.' 
          }
        },
        {
          id: 'implementation',
          title: { fr: 'Notre Approche de Mise en Œuvre', ar: 'منهجية التنفيذ' },
          content: { 
            fr: 'Notre méthodologie assure que nos programmes sont efficaces, inclusifs et adaptés aux besoins locaux.', 
            ar: 'تضمن منهجيتنا أن تكون برامجنا فعالة وشاملة ومكيفة للاحتياجات المحلية.' 
          }
        },
        {
          id: 'implementation_subtitle',
          title: { fr: 'Sous-titre de mise en œuvre', ar: 'العنوان الفرعي للتنفيذ' },
          content: { 
            fr: 'implementation.subtitle', 
            ar: 'implementation.subtitle' 
          }
        },
        {
          id: 'participatory',
          title: { fr: 'Méthodologie Participative', ar: 'المنهجية التشاركية' },
          content: { 
            fr: 'Nous utilisons des approches participatives qui impliquent les bénéficiaires dans la conception et la mise en œuvre des programmes, assurant la pertinence, l\'appropriation et la durabilité. Nos méthodes comprennent:', 
            ar: 'نستخدم مناهج تشاركية تشرك المستفيدين في تصميم وتنفيذ البرامج، مما يضمن الملاءمة والملكية والاستدامة. تشمل طرقنا:' 
          }
        },
        {
          id: 'results_based',
          title: { fr: 'Gestion Axée sur les Résultats', ar: 'الإدارة القائمة على النتائج' },
          content: { 
            fr: 'Nous mettons en œuvre un cadre de gestion axée sur les résultats pour assurer l\'efficacité et l\'impact des programmes. Notre approche comprend:', 
            ar: 'نقوم بتنفيذ إطار الإدارة القائمة على النتائج لضمان فعالية وتأثير البرامج. يتضمن نهجنا:' 
          }
        },
        {
          id: 'implementation_cycle',
          title: { fr: 'Cycle de mise en œuvre', ar: 'دورة التنفيذ' },
          content: { 
            fr: 'Notre cycle de mise en œuvre', 
            ar: 'دورة التنفيذ لدينا' 
          }
        },
        {
          id: 'impact',
          title: { fr: 'Impact du Programme', ar: 'تأثير البرنامج' },
          content: { 
            fr: 'Les chiffres qui reflètent notre engagement et notre impact dans la promotion et la défense des droits.', 
            ar: 'الأرقام التي تعكس التزامنا وتأثيرنا في تعزيز والدفاع عن الحقوق.' 
          }
        },
        {
          id: 'impact_trained',
          title: { fr: 'Personnes Formées', ar: 'الأشخاص المدربين' },
          content: { 
            fr: '760+\nPersonnes formées par nos programmes de renforcement des capacités', 
            ar: '+760\nشخص تم تدريبهم من خلال برامجنا لبناء القدرات' 
          }
        },
        {
          id: 'impact_partners',
          title: { fr: 'Organisations Partenaires', ar: 'المنظمات الشريكة' },
          content: { 
            fr: '25+\nOrganisations partenaires collaborant à la mise en œuvre du programme', 
            ar: '+25\nمنظمة شريكة تتعاون في تنفيذ البرنامج' 
          }
        },
        {
          id: 'impact_workshops',
          title: { fr: 'Ateliers de Formation', ar: 'ورش العمل التدريبية' },
          content: { 
            fr: '38+\nAteliers de formation organisés dans différentes régions', 
            ar: '+38\nورشة عمل تدريبية منظمة في مناطق مختلفة' 
          }
        },
        {
          id: 'impact_regions',
          title: { fr: 'Impact Régional', ar: 'التأثير الإقليمي' },
          content: { 
            fr: 'Nos programmes ont atteint diverses régions d\'Algérie, permettant aux individus et aux organisations de devenir des défenseurs efficaces des droits humains et des valeurs démocratiques.', 
            ar: 'وصلت برامجنا إلى مناطق مختلفة من الجزائر، مما مكّن الأفراد والمنظمات من أن يصبحوا مدافعين فعالين عن حقوق الإنسان والقيم الديمقراطية.' 
          }
        },
        {
          id: 'partners',
          title: { fr: 'Nos Partenaires', ar: 'شركاؤنا' },
          content: { 
            fr: 'Nous collaborons avec divers partenaires pour améliorer l\'impact et la portée de nos programmes.', 
            ar: 'نتعاون مع شركاء متنوعين لتحسين تأثير ومدى برامجنا.' 
          }
        },
        {
          id: 'global_presence',
          title: { fr: 'Notre présence globale', ar: 'تواجدنا العالمي' },
          content: { 
            fr: 'Nos partenaires à travers le monde', 
            ar: 'شركاؤنا حول العالم' 
          }
        }
      ]
    };
  }
  
  // For news page, return template with all sections
  if (pageId === 'news') {
    return {
      id: 'news',
      title: { fr: 'Actualités', ar: 'الأخبار' },
      sections: [
        {
          id: 'intro',
          title: {
            fr: 'Actualités',
            ar: 'الأخبار'
          },
          content: {
            fr: 'Restez informé des dernières initiatives, événements et développements concernant notre travail sur les droits humains.',
            ar: 'ابق على اطلاع بآخر المبادرات والأحداث والتطورات المتعلقة بعملنا في مجال حقوق الإنسان.'
          }
        },
        {
          id: 'categories',
          title: {
            fr: 'Catégories',
            ar: 'التصنيفات'
          },
          content: {
            fr: 'Formation\nRapports\nPartenariats\nÉvénements\nProgrammes',
            ar: 'تدريب\nتقارير\nشراكات\nفعاليات\nبرامج'
          }
        },
        {
          id: 'featured',
          title: {
            fr: 'À la une',
            ar: 'المميزة'
          },
          content: {
            fr: 'Découvrez nos actualités à la une, mettant en lumière nos principales initiatives et réalisations dans le domaine des droits.',
            ar: 'اكتشف أخبارنا المميزة، التي تسلط الضوء على مبادراتنا وإنجازاتنا الرئيسية في مجال الحقوق.'
          }
        },
        {
          id: 'recent',
          title: {
            fr: 'Actualités récentes',
            ar: 'الأخبار الحديثة'
          },
          content: {
            fr: 'Consultez nos dernières activités, projets et engagements en faveur des droits fondamentaux.',
            ar: 'اطلع على آخر أنشطتنا ومشاريعنا والتزاماتنا لصالح الحقوق الأساسية.'
          }
        }
      ]
    };
  }
  
  // For testimonials page, return template with all sections
  if (pageId === 'testimonials') {
    return {
      id: 'testimonials',
      title: { fr: 'Témoignages', ar: 'الشهادات' },
      sections: [
        {
          id: 'intro',
          title: {
            fr: 'Témoignages',
            ar: 'الشهادات'
          },
          content: {
            fr: 'Découvrez ce que disent nos partenaires et bénéficiaires sur notre travail',
            ar: 'اكتشف ما يقوله المستفيدون وشركاؤنا ومتطوعونا عن عملنا'
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
        }
      ]
    };
  }
  
  // For review page, return template with all sections
  if (pageId === 'review') {
    return {
      id: 'review',
      title: { fr: 'Revue & Publications', ar: 'المراجعة والمنشورات' },
      sections: [
        {
          id: 'intro',
          title: {
            fr: 'Revue & Publications',
            ar: 'المراجعة والمنشورات'
          },
          content: {
            fr: 'Explorez nos analyses et publications sur les droits humains et les enjeux juridiques actuels',
            ar: 'استكشف تحليلاتنا ومنشوراتنا حول حقوق الإنسان والقضايا القانونية الحالية'
          }
        },
        {
          id: 'coming_soon',
          title: {
            fr: 'Notre première revue arrive en juillet 2025 !',
            ar: 'تصدر مجلتنا الأولى في يوليو 2025!'
          },
          content: {
            fr: 'Nous avons le plaisir de vous annoncer que la première édition de notre revue sera publiée en juillet 2025. Cette revue trimestrielle abordera les questions juridiques, les droits humains et les enjeux sociaux actuels.',
            ar: 'يسرنا أن نعلن أن العدد الأول من مجلتنا سيصدر في يوليو 2025. ستتناول هذه المجلة الفصلية القضايا القانونية وحقوق الإنسان والقضايا الاجتماعية الحالية.'
          }
        },
        {
          id: 'contribution',
          title: {
            fr: 'Vous souhaitez contribuer ?',
            ar: 'هل ترغب في المساهمة؟'
          },
          content: {
            fr: 'Nous invitons les chercheurs, juristes, académiciens et experts à contribuer à notre revue. Si vous souhaitez soumettre un article ou partager votre expertise, n\'hésitez pas à nous contacter via notre formulaire de contact ou sur nos réseaux sociaux.',
            ar: 'ندعو الباحثين والمحامين والأكاديميين والخبراء للمساهمة في مجلتنا. إذا كنت ترغب في تقديم مقالة أو مشاركة خبرتك، فلا تتردد في الاتصال بنا من خلال نموذج الاتصال الخاص بنا أو على وسائل التواصل الاجتماعي.'
          }
        },
        {
          id: 'recent_publications',
          title: {
            fr: 'Publications récentes',
            ar: 'المنشورات الحديثة'
          },
          content: {
            fr: 'Découvrez l\'ensemble de nos ressources documentaires sur les droits humains et les questions juridiques.',
            ar: 'اكتشف جميع مواردنا الوثائقية حول حقوق الإنسان والقضايا القانونية.'
          }
        },
        {
          id: 'media_library',
          title: {
            fr: 'Médiathèque',
            ar: 'مكتبة الوسائط'
          },
          content: {
            fr: 'Explorez notre collection de ressources audiovisuelles sur les droits humains.',
            ar: 'استكشف مجموعتنا من الموارد السمعية البصرية حول حقوق الإنسان.'
          }
        },
        {
          id: 'featured',
          title: {
            fr: 'Publication à la une',
            ar: 'المنشور المميز'
          },
          content: {
            fr: 'Notre rapport annuel présente un aperçu complet de l\'état des droits humains en Algérie.\n\nRapport annuel 2023\nMai 2023 | 120 pages\nCe rapport présente un aperçu complet de l\'état des droits humains en Algérie en 2023. Il aborde les avancées et défis dans différents domaines, notamment les libertés civiles, les droits économiques et sociaux, et l\'accès à la justice.',
            ar: 'يقدم تقريرنا السنوي نظرة شاملة عن حالة حقوق الإنسان في الجزائر.\n\nالتقرير السنوي 2023\nمايو 2023 | 120 صفحة\nيقدم هذا التقرير نظرة شاملة عن حالة حقوق الإنسان في الجزائر في عام 2023. ويتناول التقدم والتحديات في مختلف المجالات، بما في ذلك الحريات المدنية والحقوق الاقتصادية والاجتماعية والوصول إلى العدالة.'
          }
        }
      ]
    };
  }
  
  // For resources page, return template with all sections
  if (pageId === 'resources') {
    return {
      id: 'resources',
      title: { fr: 'Ressources', ar: 'الموارد' },
      sections: [
        {
          id: 'intro',
          title: {
            fr: 'Ressources',
            ar: 'الموارد'
          },
          content: {
            fr: 'Découvrez nos ressources pour comprendre et défendre les droits fondamentaux.',
            ar: 'اكتشف مواردنا لفهم الحقوق الأساسية والدفاع عنها.'
          }
        },
        {
          id: 'guides',
          title: {
            fr: 'Guides pratiques',
            ar: 'أدلة عملية'
          },
          content: {
            fr: 'Nos guides expliquent les droits fondamentaux dans un langage accessible à tous. Téléchargez-les gratuitement et partagez-les avec votre entourage.',
            ar: 'توضح أدلتنا الحقوق الأساسية بلغة يسهل فهمها للجميع. قم بتنزيلها مجانًا ومشاركتها مع من حولك.'
          }
        },
        {
          id: 'templates',
          title: {
            fr: 'Modèles de documents',
            ar: 'نماذج المستندات'
          },
          content: {
            fr: 'Utilisez nos modèles pour rédiger des lettres officielles, des plaintes ou des demandes de documentation. Ces modèles vous aideront à structurer vos démarches administratives et juridiques.',
            ar: 'استخدم نماذجنا لكتابة الخطابات الرسمية أو الشكاوى أو طلبات الوثائق. ستساعدك هذه النماذج على هيكلة إجراءاتك الإدارية والقانونية.'
          }
        },
        {
          id: 'reports',
          title: {
            fr: 'Rapports et études',
            ar: 'التقارير والدراسات'
          },
          content: {
            fr: 'Consultez nos rapports et études sur les différentes problématiques liées aux droits fondamentaux, notamment les libertés civiles, l\'accès à la justice et les droits des personnes vulnérables.',
            ar: 'راجع تقاريرنا ودراساتنا حول مختلف القضايا المتعلقة بالحقوق الأساسية، بما في ذلك الحريات المدنية والوصول إلى العدالة وحقوق الفئات الضعيفة.'
          }
        },
        {
          id: 'training',
          title: {
            fr: 'Matériel de formation',
            ar: 'مواد التدريب'
          },
          content: {
            fr: 'Accédez à notre matériel de formation pour approfondir vos connaissances sur les droits. Ces ressources sont particulièrement utiles pour les enseignants, les formateurs et les animateurs d\'ateliers.',
            ar: 'الوصول إلى مواد التدريب الخاصة بنا لتعميق معرفتك بالحقوق. هذه الموارد مفيدة بشكل خاص للمعلمين والمدربين ومنظمي ورش العمل.'
          }
        },
        {
          id: 'multimedia',
          title: {
            fr: 'Ressources multimédias',
            ar: 'موارد الوسائط المتعددة'
          },
          content: {
            fr: 'Explorez notre collection de vidéos, podcasts et infographies sur les droits fondamentaux. Ces ressources sont conçues pour rendre l\'information accessible à tous les publics.',
            ar: 'استكشف مجموعتنا من مقاطع الفيديو والبودكاست والرسوم المعلوماتية حول الحقوق الأساسية. تم تصميم هذه الموارد لجعل المعلومات في متناول جميع الجماهير.'
          }
        }
      ]
    };
  }
  
  // For other pages, return a basic template
  return {
    id: pageId,
    title: defaultTitles[pageId],
    sections: [
      {
        id: '1',
        title: defaultTitles[pageId],
        content: { 
          fr: `Contenu de la page ${defaultTitles[pageId].fr}`, 
          ar: `محتوى صفحة ${defaultTitles[pageId].ar}` 
        }
      }
    ]
  };
};

// Function to get exact page content for editing
export const getExactPageContent = async (pageId: string): Promise<PageContent> => {
  // First try to get from the editor version, which is used for editing
  const editorContent = await getItem<PageContent>(`editor_${pageId}`);
  if (editorContent) {
    return editorContent;
  }
  
  // If no editor version exists, get the original page content
  const content = await getPageContent(pageId);
  
  // If page doesn't exist yet, create default content
  if (!content) {
    // Create default content based on page ID
    const defaultContent = createDefaultPageContent(pageId);
    if (defaultContent) {
      // Save the default content
      await setPageContent(defaultContent);
      return defaultContent;
    }
    
    // Fallback: Return a minimal valid page content object
    return {
      id: pageId,
      title: { fr: 'Nouvelle Page', ar: 'صفحة جديدة' },
      sections: [
        {
          id: 'section1',
          title: { fr: 'Section 1', ar: 'القسم 1' },
          content: { fr: 'Contenu de la section', ar: 'محتوى القسم' }
        }
      ]
    };
  }
  
  return content;
};

// Enhanced initialize database function to capture the exact website structure
export const initializeDatabase = async () => {
  console.log('Initializing database...');
  
  // In production, call the API initialize endpoint
  if (isProduction()) {
    console.log('Production mode - initializing via API');
    try {
      const success = await initializeDatabaseViaApi();
      if (success) {
        console.log('Database successfully initialized via API');
      } else {
        console.error('Failed to initialize database via API');
      }
    } catch (error) {
      console.error('Error initializing database via API:', error);
    }
    return; // Return early for production
  }

  // For development only - initialize localStorage
  console.log('Development mode - initializing localStorage');

  // Default data for pages
  const defaultPages = [
    // About page
    {
      id: 'about',
      title: {
        fr: 'À Propos',
        ar: 'من نحن'
      },
      sections: [
        {
          id: 'mission',
          title: {
            fr: 'Notre Mission',
            ar: 'مهمتنا'
          },
          content: {
            fr: 'La Fondation pour la Promotion des Droits est une organisation indépendante œuvrant pour la protection et la promotion des droits fondamentaux en Algérie. À travers des programmes de sensibilisation, de formation et de recherche, nous visons à renforcer la culture des droits dans notre société.',
            ar: 'مؤسسة ترقية الحقوق هي منظمة مستقلة تعمل من أجل حماية وتعزيز الحقوق الأساسية في الجزائر. من خلال برامج التوعية والتدريب والبحث، نهدف إلى تعزيز ثقافة الحقوق في مجتمعنا.'
          }
        },
        {
          id: 'vision',
          title: {
            fr: 'Notre Vision',
            ar: 'رؤيتنا'
          },
          content: {
            fr: 'Nous aspirons à une société où les droits fondamentaux de chaque individu sont pleinement respectés et protégés, où la liberté d\'expression, la dignité humaine et l\'égalité des chances sont des réalités vécues au quotidien.',
            ar: 'نتطلع إلى مجتمع تُحترم فيه الحقوق الأساسية لكل فرد وتُحمى بشكل كامل، حيث تكون حرية التعبير والكرامة الإنسانية وتكافؤ الفرص حقائق يومية.'
          }
        },
        {
          id: 'values',
          title: {
            fr: 'Nos Valeurs',
            ar: 'قيمنا'
          },
          content: {
            fr: 'Notre travail est guidé par les principes fondamentaux de la Déclaration universelle des droits de l\'homme. Nous croyons en l\'universalité, l\'indivisibilité et l\'interdépendance de tous les droits humains. Notre approche est fondée sur la rigueur, l\'impartialité et la solidarité.',
            ar: 'يسترشد عملنا بالمبادئ الأساسية للإعلان العالمي لحقوق الإنسان. نؤمن بعالمية وعدم قابلية تجزئة وترابط جميع حقوق الإنسان. نهجنا مبني على الدقة والحياد والتضامن.'
          }
        },
        {
          id: 'history',
          title: {
            fr: 'Notre Histoire',
            ar: 'تاريخنا'
          },
          content: {
            fr: 'Fondée en 2010 par un groupe de juristes et défenseurs des droits humains, notre fondation a traversé plus d\'une décennie d\'engagement continu. Malgré les défis, nous avons bâti un héritage solide de plaidoyer et d\'éducation aux droits humains.',
            ar: 'تأسست في عام 2010 من قبل مجموعة من المحامين والمدافعين عن حقوق الإنسان، وقد مرت مؤسستنا بأكثر من عقد من الالتزام المستمر. على الرغم من التحديات، بنينا إرثًا قويًا في مجال المناصرة والتثقيف في مجال حقوق الإنسان.'
          }
        }
      ]
    },
    // Home page
    {
      id: 'home',
      title: {
        fr: 'Accueil',
        ar: 'الرئيسية'
      },
      sections: [
        {
          id: 'hero',
          title: {
            fr: 'Fondation pour la Promotion des Droits',
            ar: 'مؤسسة ترقية الحقوق'
          },
          content: {
            fr: 'Défendre et promouvoir les droits fondamentaux pour tous',
            ar: 'الدفاع عن وتعزيز الحقوق الأساسية للجميع'
          }
        },
        {
          id: 'intro',
          title: {
            fr: 'Qui sommes-nous',
            ar: 'من نحن'
          },
          content: {
            fr: 'Organisation indépendante et non partisane, consacrée à la protection et à la promotion des droits fondamentaux par l\'éducation, la recherche et le plaidoyer.',
            ar: 'منظمة مستقلة وغير حزبية، مكرسة لحماية وتعزيز الحقوق الأساسية من خلال التعليم والبحث والدعوة.'
          }
        },
        {
          id: 'objectives',
          title: {
            fr: 'Nos Objectifs',
            ar: 'أهدافنا'
          },
          content: {
            fr: 'Promouvoir la connaissance des droits fondamentaux, documenter les violations, soutenir les victimes, et contribuer à l\'amélioration du cadre juridique de protection des droits.',
            ar: 'تعزيز المعرفة بالحقوق الأساسية، وتوثيق الانتهاكات، ودعم الضحايا، والمساهمة في تحسين الإطار القانوني لحماية الحقوق.'
          }
        },
        {
          id: 'programs',
          title: {
            fr: 'Nos Programmes',
            ar: 'برامجنا'
          },
          content: {
            fr: 'Éducation aux droits humains, assistance juridique, plaidoyer législatif, observatoire des droits.',
            ar: 'التثقيف في مجال حقوق الإنسان، والمساعدة القانونية، والمناصرة التشريعية، ومرصد الحقوق.'
          }
        },
        {
          id: 'stats',
          title: {
            fr: 'Notre Impact',
            ar: 'تأثيرنا'
          },
          content: {
            fr: 'Quelques chiffres',
            ar: 'بعض الأرقام'
          }
        },
        {
          id: 'visual-identity',
          title: {
            fr: 'Notre Identité Visuelle',
            ar: 'هويتنا البصرية'
          },
          content: {
            fr: 'Notre logo et nos couleurs représentent nos valeurs fondamentales:',
            ar: 'شعارنا وألواننا تمثل قيمنا الأساسية:'
          }
        }
      ]
    }
  ];

  // Initialize all default data
  try {
    // Save pages
    for (const page of defaultPages) {
      localStorage.setItem(`page_${page.id}`, JSON.stringify(page));
    }
    
    // Save news items
    localStorage.setItem('newsItems', JSON.stringify(defaultNewsItems));
    
    // Save resources
    localStorage.setItem('resources', JSON.stringify(defaultResources));
    
    // Save website structure
    localStorage.setItem('structure', JSON.stringify(defaultStructure));
    
    // Save media library
    localStorage.setItem('media_library', JSON.stringify(defaultMediaLibrary));
    
    console.log('Database initialization complete');
    return true;
  } catch (error) {
    console.error('Error during database initialization:', error);
    return false;
  }
};

// Function to update all pages with all sections
export const updateAllPagesWithAllSections = async (): Promise<boolean> => {
  try {
    console.log('Updating all pages with their complete sections...');
    
    // Update existing pages
    await updateHomePageWithAllSections();
    await updateAboutPageWithAllSections();
    await updateProgramsPageWithAllSections();
    
    // Update review page
    let reviewContent = await getPageContent('review');
    if (!reviewContent) {
      reviewContent = {
        id: 'review',
        title: { fr: 'Revue & Publications', ar: 'المراجعة والمنشورات' },
        sections: []
      };
    }
    
    // Define required sections for Review page
    const reviewSections = [
      {
        id: 'intro',
        title: { fr: 'Introduction', ar: 'مقدمة' },
        content: { 
          fr: 'Explorez nos analyses et publications sur les droits humains et les enjeux juridiques actuels', 
          ar: 'استكشف تحليلاتنا ومنشوراتنا حول حقوق الإنسان والقضايا القانونية الحالية' 
        }
      },
      {
        id: 'coming_soon',
        title: { fr: 'Notre première revue arrive en juillet 2025 !', ar: 'تصدر مجلتنا الأولى في يوليو 2025!' },
        content: { 
          fr: 'Notre équipe travaille actuellement sur le premier numéro de notre revue juridique spécialisée.', 
          ar: 'يعمل فريقنا حاليًا على العدد الأول من مجلتنا القانونية المتخصصة.' 
        }
      },
      {
        id: 'media_library',
        title: { fr: 'Médiathèque', ar: 'مكتبة الوسائط' },
        content: { 
          fr: 'Explorez notre collection de ressources audiovisuelles sur les droits humains.', 
          ar: 'استكشف مجموعتنا من الموارد السمعية البصرية حول حقوق الإنسان.' 
        }
      },
      {
        id: 'featured',
        title: { fr: 'Publication à la une', ar: 'المنشور المميز' },
        content: { 
          fr: 'Notre rapport annuel présente un aperçu complet de l\'état des droits humains en Algérie.', 
          ar: 'يقدم تقريرنا السنوي نظرة شاملة عن حالة حقوق الإنسان في الجزائر.' 
        }
      }
    ];
    
    // Add missing sections to review page
    reviewSections.forEach(section => {
      const existingSection = reviewContent.sections.find(s => s.id === section.id);
      if (!existingSection) {
        reviewContent.sections.push(section);
      }
    });
    
    // Save review page content
    setItem(`page_review`, reviewContent);
    setItem(`editor_review`, reviewContent);
    
    // Update resources page
    let resourcesContent = await getPageContent('resources');
    if (!resourcesContent) {
      resourcesContent = {
        id: 'resources',
        title: { fr: 'Ressources', ar: 'الموارد' },
        sections: []
      };
    }
    
    // Define required sections for Resources page
    const resourcesSections = [
      {
        id: 'intro',
        title: { fr: 'Centre de Ressources', ar: 'مركز الموارد' },
        content: { 
          fr: 'Accédez à notre bibliothèque de ressources sur les droits humains.', 
          ar: 'الوصول إلى مكتبة مواردنا حول حقوق الإنسان.' 
        }
      },
      {
        id: 'featured_resource',
        title: { fr: 'Ressource en Vedette', ar: 'المورد المميز' },
        content: { 
          fr: 'Guide pratique sur les droits constitutionnels en Algérie', 
          ar: 'دليل عملي حول الحقوق الدستورية في الجزائر' 
        }
      },
      {
        id: 'categories',
        title: { fr: 'Catégories de Ressources', ar: 'فئات الموارد' },
        content: { 
          fr: 'Parcourez nos ressources par catégorie', 
          ar: 'تصفح مواردنا حسب الفئة' 
        }
      }
    ];
    
    // Add missing sections to resources page
    resourcesSections.forEach(section => {
      const existingSection = resourcesContent.sections.find(s => s.id === section.id);
      if (!existingSection) {
        resourcesContent.sections.push(section);
      }
    });
    
    // Save resources page content
    setItem(`page_resources`, resourcesContent);
    setItem(`editor_resources`, resourcesContent);
    
    // Update contact page
    let contactContent = await getPageContent('contact');
    if (!contactContent) {
      contactContent = {
        id: 'contact',
        title: { fr: 'Contact', ar: 'اتصل بنا' },
        sections: []
      };
    }
    
    // Define required sections for Contact page
    const contactSections = [
      {
        id: 'intro',
        title: { fr: 'Contactez-nous', ar: 'اتصل بنا' },
        content: { 
          fr: 'Nous sommes à votre disposition pour répondre à vos questions.', 
          ar: 'نحن في خدمتكم للإجابة على أسئلتكم.' 
        }
      },
      {
        id: 'contact_info',
        title: { fr: 'Informations de Contact', ar: 'معلومات الاتصال' },
        content: { 
          fr: 'Email: contact@droitfin.com\nTéléphone: +123 456 789', 
          ar: 'البريد الإلكتروني: contact@droitfin.com\nالهاتف: +123 456 789' 
        }
      }
    ];
    
    // Add missing sections to contact page
    contactSections.forEach(section => {
      const existingSection = contactContent.sections.find(s => s.id === section.id);
      if (!existingSection) {
        contactContent.sections.push(section);
      }
    });
    
    // Save contact page content
    setItem(`page_contact`, contactContent);
    setItem(`editor_contact`, contactContent);
    
    // Update testimonials page
    let testimonialsContent = await getPageContent('testimonials');
    if (!testimonialsContent) {
      testimonialsContent = {
        id: 'testimonials',
        title: { fr: 'Témoignages', ar: 'الشهادات' },
        sections: []
      };
    }
    
    // Define required sections for Testimonials page
    const testimonialsSections = [
      {
        id: 'intro',
        title: { fr: 'Témoignages', ar: 'الشهادات' },
        content: { 
          fr: 'Découvrez ce que disent nos partenaires et bénéficiaires sur notre travail.', 
          ar: 'اكتشف ما يقوله شركاؤنا والمستفيدون من عملنا.' 
        }
      },
      {
        id: 'featured_testimonial',
        title: { fr: 'Témoignage Principal', ar: 'الشهادة الرئيسية' },
        content: { 
          fr: '"La formation dispensée par la Fondation a transformé ma compréhension des droits humains."', 
          ar: '"لقد غير التدريب الذي قدمته المؤسسة فهمي لحقوق الإنسان."' 
        }
      }
    ];
    
    // Add missing sections to testimonials page
    testimonialsSections.forEach(section => {
      const existingSection = testimonialsContent.sections.find(s => s.id === section.id);
      if (!existingSection) {
        testimonialsContent.sections.push(section);
      }
    });
    
    // Save testimonials page content
    setItem(`page_testimonials`, testimonialsContent);
    setItem(`editor_testimonials`, testimonialsContent);
    
    // Update news page
    let newsContent = await getPageContent('news');
    if (!newsContent) {
      newsContent = {
        id: 'news',
        title: { fr: 'Actualités', ar: 'الأخبار' },
        sections: []
      };
    }
    
    // Define required sections for News page
    const newsSections = [
      {
        id: 'intro',
        title: { fr: 'Actualités', ar: 'الأخبار' },
        content: { 
          fr: 'Restez informé des dernières initiatives et événements.', 
          ar: 'ابق على اطلاع بآخر المبادرات والأحداث.' 
        }
      }
    ];
    
    // Add missing sections to news page
    newsSections.forEach(section => {
      const existingSection = newsContent.sections.find(s => s.id === section.id);
      if (!existingSection) {
        newsContent.sections.push(section);
      }
    });
    
    // Save news page content
    setItem(`page_news`, newsContent);
    setItem(`editor_news`, newsContent);
    
    console.log('All pages updated with their complete sections');
    return true;
  } catch (error) {
    console.error('Error updating all pages with their sections:', error);
    return false;
  }
};

// Call initialize function when on client side
if (typeof window !== 'undefined') {
  // Check if we've already initialized
  if (!localStorage.getItem('dbInitialized')) {
    console.log('First initialization - this should populate all default data');
    initializeDatabase().then(() => {
      localStorage.setItem('dbInitialized', 'true');
      console.log('Database initialized successfully');
      // Force-update the pages with all sections
      updateAllPagesWithAllSections();
    });
  } else {
    // Always update all pages with all sections on page load
    updateAllPagesWithAllSections();
  }
} 

// Function to get default content for a page
const getDefaultContent = (pageId: string): PageContent | null => {
  // Check which page we're looking for and return the appropriate default content
  if (pageId === 'home') {
    return DEFAULT_HOME_PAGE;
  } else if (pageId === 'about') {
    return DEFAULT_ABOUT_PAGE;
  } else if (pageId === 'contact') {
    return DEFAULT_CONTACT_PAGE;
  } else if (pageId === 'services') {
    return DEFAULT_SERVICES_PAGE;
  }
  
  // If we don't have default content for this page, return null
  console.warn(`No default content available for page ${pageId}`);
  return null;
}; 

// Default content for the home page
export const DEFAULT_HOME_PAGE: PageContent = {
  id: 'home',
  title: {
    fr: 'Accueil',
    ar: 'الصفحة الرئيسية'
  },
  sections: [
    {
      id: 'hero',
      title: {
        fr: 'Bannière principale',
        ar: 'البانر الرئيسي'
      },
      content: {
        fr: 'Bienvenue sur notre site',
        ar: 'مرحبا بكم في موقعنا'
      }
    },
    {
      id: 'slogan',
      title: {
        fr: 'Slogan',
        ar: 'شعار'
      },
      content: {
        fr: 'Ensemble, pour des droits connus, reconnus et défendus.',
        ar: 'معاً، من أجل حقوق معروفة ومعترف بها ومحمية.'
      }
    },
    {
      id: 'mission',
      title: {
        fr: 'Notre mission',
        ar: 'مهمتنا'
      },
      content: {
        fr: 'Nous œuvrons pour promouvoir les droits humains et la justice sociale à travers l\'information, la sensibilisation et l\'assistance juridique.',
        ar: 'نحن نعمل على تعزيز حقوق الإنسان والعدالة الاجتماعية من خلال المعلومات والتوعية والمساعدة القانونية.'
      }
    }
  ]
};

// Default content for the about page
export const DEFAULT_ABOUT_PAGE: PageContent = {
  id: 'about',
  title: {
    fr: 'À propos',
    ar: 'حول'
  },
  sections: [
    {
      id: 'history',
      title: {
        fr: 'Notre histoire',
        ar: 'تاريخنا'
      },
      content: {
        fr: 'Fondée en 2020, notre fondation travaille sans relâche pour défendre les droits humains.',
        ar: 'تأسست في عام 2020، تعمل مؤسستنا بلا كلل للدفاع عن حقوق الإنسان.'
      }
    }
  ]
};

// Default content for the contact page
export const DEFAULT_CONTACT_PAGE: PageContent = {
  id: 'contact',
  title: {
    fr: 'Contact',
    ar: 'اتصل بنا'
  },
  sections: [
    {
      id: 'contact_info',
      title: {
        fr: 'Informations de contact',
        ar: 'معلومات الاتصال'
      },
      content: {
        fr: 'Email: contact@droitfin.com\nTéléphone: +123 456 789',
        ar: 'البريد الإلكتروني: contact@droitfin.com\nالهاتف: +123 456 789'
      }
    }
  ]
};

// Default content for the services page
export const DEFAULT_SERVICES_PAGE: PageContent = {
  id: 'services',
  title: {
    fr: 'Services',
    ar: 'خدمات'
  },
  sections: [
    {
      id: 'legal_assistance',
      title: {
        fr: 'Assistance juridique',
        ar: 'المساعدة القانونية'
      },
      content: {
        fr: 'Nous offrons une assistance juridique aux personnes dans le besoin.',
        ar: 'نقدم المساعدة القانونية للأشخاص المحتاجين.'
      }
    }
  ]
}; 