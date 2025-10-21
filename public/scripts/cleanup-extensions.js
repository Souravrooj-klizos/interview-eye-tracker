// Script to clean up browser extension attributes
if (typeof window !== 'undefined') {
  const cleanupExtensions = () => {
    const body = document.body;
    if (body) {
      // Remove common browser extension attributes
      const extensionAttributes = [
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'data-gramm_editor',
        'data-gramm',
        'data-grammarly-shadow-root',
        'data-grammarly-grm',
        'data-grammarly-grm-shadow-root'
      ];
      
      extensionAttributes.forEach(attr => {
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr);
        }
      });
    }
  };

  // Clean up immediately
  cleanupExtensions();
  
  // Clean up on DOM changes
  const observer = new MutationObserver(cleanupExtensions);
  observer.observe(document.body, { 
    attributes: true, 
    attributeFilter: [
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'data-gramm_editor',
      'data-gramm'
    ]
  });
  
  // Clean up on page load
  window.addEventListener('load', cleanupExtensions);
  window.addEventListener('DOMContentLoaded', cleanupExtensions);
}
