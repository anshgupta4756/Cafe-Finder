const map = L.map('map').setView([20.5937, 78.9629], 5); // India center

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const cafesList = document.getElementById('cafes');
const savedList = document.getElementById('saved');

function loadSavedCafes() {
  const saved = JSON.parse(localStorage.getItem('savedCafes') || '[]');
  savedList.innerHTML = '';
  saved.forEach(cafe => {
    const li = document.createElement('li');
    li.textContent = cafe.name;
    savedList.appendChild(li);
  });
}

function saveCafe(cafe) {
  const saved = JSON.parse(localStorage.getItem('savedCafes') || '[]');
  if (!saved.find(c => c.id === cafe.id)) {
    saved.push(cafe);
    localStorage.setItem('savedCafes', JSON.stringify(saved));
    loadSavedCafes();
  }
}

function addCafeMarker(cafe) {
  const marker = L.marker([cafe.lat, cafe.lon]).addTo(map);
  marker.bindPopup(`<b>${cafe.tags.name || 'Unnamed Cafe'}</b>`);
}

function displayCafes(cafes) {
  cafesList.innerHTML = '';
  cafes.forEach((cafe, idx) => {
    const li = document.createElement('li');
    const name = cafe.tags.name || `Cafe ${idx + 1}`;
    li.innerHTML = `<span>${name}</span>`;
    const btn = document.createElement('button');
    btn.textContent = 'Save';
    btn.onclick = () => saveCafe({ id: cafe.id, name });
    li.appendChild(btn);
    cafesList.appendChild(li);
    addCafeMarker(cafe);
  });
}

function fetchCafes(lat, lon) {
  const overpassURL = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="cafe"](around:1500,${lat},${lon});out;`;
  
  fetch(overpassURL)
    .then(res => res.json())
    .then(data => {
      if (data.elements.length === 0) {
        alert('No cafes found nearby.');
      } else {
        displayCafes(data.elements);
      }
    })
    .catch(() => alert('Error fetching cafes.'));
}

navigator.geolocation.getCurrentPosition(
  pos => {
    const { latitude, longitude } = pos.coords;
    map.setView([latitude, longitude], 15);
    fetchCafes(latitude, longitude);
  },
  () => alert('Location access denied.'),
  { enableHighAccuracy: true }
);

loadSavedCafes();
