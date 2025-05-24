'use client';

import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock, FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/PageHeader';
import { getPageContent, PageContent } from '@/lib/database';
import Newsletter from '@/components/Newsletter';
import { motion } from 'framer-motion';

// Custom event name for content updates
const CONTENT_UPDATED_EVENT = 'content_updated';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function ContactPage() {
  const { t, language } = useLanguage();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const loadContent = async () => {
    try {
      const content = await getPageContent('contact');
      
      if (content) {
        console.log('Contact page - Content loaded with sections:', 
          content.sections.map(s => `${s.id}: ${s.title?.fr}`).join(', '));
        setPageContent(content);
        // Force re-render by incrementing the refresh counter
        setForceRefresh(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading contact page content:', error);
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    // Initial content load
    loadContent();
    
    // Add event listeners for content updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'page_contact') {
        console.log('Contact page - Storage change detected');
        loadContent();
      }
    };
    
    const handleContentUpdated = () => {
      console.log('Contact page - Content updated event received');
      loadContent();
    };
    
    // Listen for direct localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for our custom content updated event
    window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated);
    };
  }, []);

  // When the language changes, we should refresh the content too
  useEffect(() => {
    console.log('Contact page - Language changed, refreshing content');
    // This forces a re-render with the new language
    setForceRefresh(prev => prev + 1);
  }, [language]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Get section content by id
  const getSectionContent = (sectionId: string, defaultText: string) => {
    if (!pageContent || !pageContent.sections) return defaultText;
    
    const section = pageContent.sections.find(s => s.id === sectionId);
    if (!section) return defaultText;
    
    return section.content?.[language as 'fr' | 'ar'] || defaultText;
  };

  // Get section title by id
  const getSectionTitle = (sectionId: string, defaultText: string) => {
    if (!pageContent || !pageContent.sections) return defaultText;
    
    const section = pageContent.sections.find(s => s.id === sectionId);
    if (!section || !section.title) return defaultText;
    
    return section.title[language as 'fr' | 'ar'] || defaultText;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = language === 'fr' ? 'Le nom est requis' : 'الاسم مطلوب';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = language === 'fr' ? 'L\'email est requis' : 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = language === 'fr' ? 'Veuillez entrer une adresse email valide' : 'يرجى إدخال بريد إلكتروني صحيح';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = language === 'fr' ? 'Le sujet est requis' : 'الموضوع مطلوب';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = language === 'fr' ? 'Le message est requis' : 'الرسالة مطلوبة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real application, you would send this data to your backend
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
    }
  };

  // Classes for RTL/LTR layout
  const textDirection = language === 'ar' ? 'text-right' : 'text-left';
  const flexDirection = language === 'ar' ? 'flex-row-reverse' : 'flex-row';

  return (
    <div key={forceRefresh}>
      {/* Page Header */}
      <PageHeader 
        title={pageContent?.title?.[language as 'fr' | 'ar'] || 
          (language === 'fr' ? 'Contactez-nous' : 'اتصل بنا')}
        subtitle={getSectionContent('contact_info', 
          language === 'fr' 
          ? 'Nous sommes là pour vous aider. N\'hésitez pas à nous contacter pour toute question ou demande.' 
          : 'نحن هنا لمساعدتك. لا تتردد في الاتصال بنا لأي أسئلة أو استفسارات.')}
        language={language as 'fr' | 'ar'}
      />

      <div className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'fr' ? 'Nos Coordonnées' : 'معلومات الاتصال'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-[#8FD694] mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'fr' 
                ? 'Différentes façons de nous contacter et de nous trouver.' 
                : 'طرق مختلفة للاتصال بنا والعثور علينا.'}
            </p>
          </motion.div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Address Card */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:-translate-y-1 transition-transform duration-300 border-t-4 border-primary overflow-hidden relative group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-20 h-20 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaMapMarkerAlt className="text-primary text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{getSectionTitle('address', t('contact.office'))}</h2>
              <p className="text-gray-700" dangerouslySetInnerHTML={{ 
                __html: getSectionContent('address', 'No address available').replace(/\n/g, '<br />') 
              }} />
            </motion.div>
            
            {/* Phone Card */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:-translate-y-1 transition-transform duration-300 border-t-4 border-[#8FD694] overflow-hidden relative group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#8FD694]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-20 h-20 bg-gradient-to-r from-[#8FD694]/20 to-[#8FD694]/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaPhone className="text-[#8FD694] text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{getSectionTitle('phone', t('contact.phone'))}</h2>
              <p className="text-gray-700" dangerouslySetInnerHTML={{ 
                __html: getSectionContent('phone', 'No phone available').replace(/\n/g, '<br />') 
              }} />
            </motion.div>
            
            {/* Email Card */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:-translate-y-1 transition-transform duration-300 border-t-4 border-orange overflow-hidden relative group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-20 h-20 bg-gradient-to-r from-orange/20 to-orange/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="text-orange text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{getSectionTitle('email', t('contact.email'))}</h2>
              <p className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ 
                __html: getSectionContent('email', 'No email available').replace(/\n/g, '<br />') 
              }} />
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#4267B2] transition-colors duration-300 transform hover:scale-110">
                  <FaFacebook size={22} />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#1DA1F2] transition-colors duration-300 transform hover:scale-110">
                  <FaTwitter size={22} />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#E1306C] transition-colors duration-300 transform hover:scale-110">
                  <FaInstagram size={22} />
                </a>
                <a href="#" className="text-gray-400 hover:text-[#FF0000] transition-colors duration-300 transform hover:scale-110">
                  <FaYoutube size={22} />
                </a>
              </div>
            </motion.div>
          </div>
          
          {/* Section Title for Form */}
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'fr' ? 'Envoyez-nous un Message' : 'أرسل لنا رسالة'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#8FD694] to-orange mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'fr' 
                ? 'Nous sommes impatients de recevoir votre message et d\'y répondre dans les plus brefs délais.' 
                : 'نتطلع إلى تلقي رسالتك والرد عليها في أقرب وقت ممكن.'}
            </p>
          </motion.div>
          
          {/* Contact Form and Hours/Map */}
          <div className={`grid md:grid-cols-2 gap-16 mb-20 ${language === 'ar' ? 'md:flex-row-reverse' : ''}`}>
            {/* Contact Form */}
            <motion.div 
              className={`bg-white rounded-xl shadow-lg p-8 order-2 md:order-1 ${textDirection} relative overflow-hidden`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-[#8FD694] to-orange"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('send.message')}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">{t('contact.form.name')}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD694] focus:border-transparent ${textDirection}`}
                      required
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">{t('contact.form.email')}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD694] focus:border-transparent ${textDirection}`}
                      required
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">{t('contact.form.subject')}</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD694] focus:border-transparent ${textDirection}`}
                    required
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">{t('contact.form.message')}</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8FD694] focus:border-transparent ${textDirection}`}
                    required
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  ></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-[#8FD694] hover:from-[#8FD694] hover:to-primary text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md"
                >
                  {t('contact.form.submit')}
                </button>
                  
                {isSubmitted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-100 shadow-sm"
                  >
                    {t('contact.form.success')}
                  </motion.div>
                )}
              </form>
            </motion.div>
            
            {/* Hours and Map */}
            <motion.div 
              className="order-1 md:order-2 space-y-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#8FD694] hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.hours')}</h2>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-[#8FD694]/10 rounded-full flex items-center justify-center mr-4">
                    <FaClock className="text-[#8FD694] text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t('contact.weekdays')}</h3>
                    <p className="text-gray-600">8:30 AM - 4:30 PM</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#8FD694]/10 rounded-full flex items-center justify-center mr-4">
                    <FaClock className="text-[#8FD694] text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t('contact.weekend')}</h3>
                    <p className="text-gray-600">{t('contact.closed')}</p>
                  </div>
                </div>
              </div>
              
              <div className="h-80 md:h-[400px] rounded-xl overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-[1.01]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102239.58355550555!2d3.0412750871789133!3d36.7735233582687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb26977ea659f%3A0x128fb3d32d4d3c43!2sAlgiers%2C%20Algeria!5e0!3m2!1sen!2sus!4v1619524992238!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  title="Location Map"
                ></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
} 