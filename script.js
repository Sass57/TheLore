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
// Évszám és dátum formázása
// Évszám és hónap pontos magyar formázása
function formatYear(year, month) {
  const monthNames = [
    "január", "február", "március", "április", "május", "június",
    "július", "augusztus", "szeptember", "október", "november", "december"
  ];
 
  // Megnézzük, be van-e kapcsolva a hónapok kijelzése
  const showMonth = monthToggle ? monthToggle.checked : true;

  if (year <= -1000000000) {
    return `i. e. ${(Math.abs(year) / 1000000000).toLocaleString('hu-HU')} milliárd év`;
  }
  if (year <= -1000000) {
    return `i. e. ${(Math.abs(year) / 1000000).toLocaleString('hu-HU')} millió év`;
  }
  if (year < 0) {
    const yearStr = `i. e. ${Math.abs(year).toLocaleString('hu-HU')}`;
    if (showMonth && month && month >= 1 && month <= 12) {
      return `${yearStr}. ${monthNames[month - 1]}`;
    }
    return yearStr;
  }

  // Pozitív éveknél: ha be van kapcsolva a gomb és van hónap, kiírja, különben csak az évet
  if (showMonth && month && month >= 1 && month <= 12) {
    return `${year}. ${monthNames[month - 1]}`;
  }

  return `${year}.`;
}

// Adatok betöltése
async function initTimeline() {
  try {
    const response = await fetch('events.json');
    if (!response.ok) {
      throw new Error(`Hiba az events.json betöltésekor: HTTP ${response.status}`);
    }
    eventsData = await response.json();
    populateCategoryFilter();
    applyFilters();
  } catch (error) {
    console.error("Nem sikerült betölteni az idővonal adatait:", error);
    if (timelineContainer) {
      timelineContainer.innerHTML = `
        <div style="text-align: center; color: var(--accent-red-bright); padding: 3rem;">
          <h3>Hiba történt az adatok betöltésekor!</h3>
          <p>Győződj meg róla, hogy helyi szerveren (pl. VS Code Live Server) futtatod az oldalt.</p>
        </div>`;
    }
  }
}

// Korszak választó lista dinamikus feltöltése a meglévő adatokból
function populateCategoryFilter() {
  if (!eraFilter) return;
 
  eraFilter.innerHTML = '<option value="all">Minden korszak</option>';
 
  const categories = [...new Set(eventsData.map(e => e.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    eraFilter.appendChild(option);
  });
}
