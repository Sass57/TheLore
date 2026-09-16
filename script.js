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

// Szűrés és dinamikus rendezés
function applyFilters() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedCategory = eraFilter ? eraFilter.value : 'all';
  const milestonesOnly = milestoneToggle ? milestoneToggle.checked : false;

  // Friss választott érték kiolvasása a sorrendválasztóból
  const currentSortFilter = document.getElementById('sort-filter');
  const sortVal = currentSortFilter ? currentSortFilter.value.toLowerCase().trim() : 'asc';
  const isDescending = sortVal === 'desc' || sortVal.includes('desc') || sortVal.includes('forditott');

  // Szűrési logika
  let filtered = eventsData.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                          event.shortDesc.toLowerCase().includes(searchTerm) ||
                          event.fullDesc.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesMilestone = !milestonesOnly || event.importance === 'major';

    return matchesSearch && matchesCategory && matchesMilestone;
  });

  // Rendezési logika (Évszám, majd hónap alapján)
  filtered.sort((a, b) => {
    if (a.year !== b.year) {
      return isDescending ? b.year - a.year : a.year - b.year;
    }
    const monthA = a.month || 0;
    const monthB = b.month || 0;
    return isDescending ? monthB - monthA : monthA - monthB;
  });

  renderTimeline(filtered);
}

// Modal felugró ablak megnyitása
window.openModal = function(id) {
  const event = eventsData.find(e => e.id === id);
  if (!event || !modalOverlay) return;

  modalTitle.textContent = event.title;
  modalCategory.className = `badge ${getCategoryClass(event.category)}`;
  modalCategory.textContent = event.category;
  modalDate.textContent = formatYear(event.year, event.month);
  modalDesc.textContent = event.fullDesc;

  // Média (kép vagy beágyazott videó)
  modalMedia.innerHTML = '';
  if (event.mediaType === 'image' && event.mediaUrl) {
    modalMedia.innerHTML = `<img src="${event.mediaUrl}" alt="${event.title}" referrerpolicy="no-referrer" loading="lazy">`;
  } else if (event.mediaType === 'video' && event.mediaUrl) {
    modalMedia.innerHTML = `<iframe src="${event.mediaUrl}" title="${event.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }
  
  // Források kirajzolása
  modalSources.innerHTML = '';
  if (event.sources && event.sources.length > 0) {
    event.sources.forEach(src => {
      const link = document.createElement('a');
      link.href = src.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'source-link';
      link.innerHTML = `🔗 ${src.name}`;
      modalSources.appendChild(link);
    });
  }

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

// Modal bezárása
function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('active');
  if (modalMedia) modalMedia.innerHTML = ''; // Leállítja a média lejátszást
  document.body.style.overflow = '';
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
    closeModal();
  }
});

// Eseménykezelők hozzárendelése
if (searchInput) searchInput.addEventListener('input', applyFilters);
if (eraFilter) eraFilter.addEventListener('change', applyFilters);

if (sortFilter) {
  sortFilter.addEventListener('change', applyFilters);
  sortFilter.addEventListener('input', applyFilters);
}

if (milestoneToggle) {
  milestoneToggle.addEventListener('change', applyFilters);
}

if (monthToggle) {
  monthToggle.addEventListener('change', applyFilters);
}
// Inicializálás
initTimeline();

