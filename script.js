let eventsData = [];

// DOM elemek
const timelineContainer = document.getElementById('timeline-container');
const searchInput = document.getElementById('search-input');
const eraFilter = document.getElementById('era-filter');
const sortFilter = document.getElementById('sort-filter');
const milestoneToggle = document.getElementById('milestone-toggle');
const monthToggle = document.getElementById('month-toggle');
const countDisplay = document.getElementById('count-display');

// Modal elemek
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalCategory = document.getElementById('modal-category');
const modalDate = document.getElementById('modal-date');
const modalMedia = document.getElementById('modal-media');
const modalDesc = document.getElementById('modal-desc');
const modalSources = document.getElementById('modal-sources');

// Korszak CSS osztály hozzárendelése az egyedi színekhez
function getCategoryClass(category) {
  const map = {
    'Prehisztórium': 'badge-prehisztorium',
    'Ókor': 'badge-okor',
    'Középkor': 'badge-kozepkor',
    'Újkor': 'badge-ujkor',
    'Modern Kor': 'badge-modern-kor',
    'Jelenkor': 'badge-jelenkor'
  };
  return map[category] || '';
}
