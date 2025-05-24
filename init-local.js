// Script to reset localStorage and properly initialize the local database

// Clear the local storage
function resetLocalStorage() {
  console.log('Resetting localStorage...');
  // Save admin auth if it exists
  const adminAuth = localStorage.getItem('adminAuth');
  const lang = localStorage.getItem('language');
  
  // Clear everything
  localStorage.clear();
  
  // Restore admin auth and language
  if (adminAuth) localStorage.setItem('adminAuth', adminAuth);
  if (lang) localStorage.setItem('language', lang);
  
  // Remove initialization flag to force re-initialization
  localStorage.removeItem('dbInitialized');
  
  console.log('localStorage reset complete!');
  console.log('Please refresh the page to reinitialize the database with default content.');
}

// Create a button
const button = document.createElement('button');
button.textContent = 'Reset Local Database';
button.style.position = 'fixed';
button.style.top = '10px';
button.style.right = '10px';
button.style.zIndex = '9999';
button.style.padding = '10px 15px';
button.style.background = 'red';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '5px';
button.style.cursor = 'pointer';

// Add click event
button.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset the local database? This will clear all content and restore defaults.')) {
    resetLocalStorage();
  }
});

// Add to body when loaded
window.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(button);
});

// Execute immediately if document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  document.body.appendChild(button);
}

console.log('Database reset tool injected into page.');
