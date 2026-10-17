/**
 * Bozok 66 - Appsmith & ToolJet Engine Admin Dashboard Client Script
 * FastAPI /api/admin CRUD API'leriyle tam uyumlu canlı etkileşim katmanı.
 */

const API_BASE = "http://localhost:8000/api/admin";

// Global durum
let currentTab = "dashboard";
let statsData = {};
let pharmaciesData = [];
let usersData = [];
let busesData = [];
let bloodData = [];
let placesData = [];

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initSearchFilters();
  loadAllData();

  document.getElementById("btnRefresh").addEventListener("click", () => {
    loadAllData();
  });

  document.getElementById("btnActionAdd").addEventListener("click", () => {
    if (currentTab === "pharmacies") openPharmacyModal();
    else if (currentTab === "users") openUserModal();
    else if (currentTab === "blood") openBloodModal();
    else if (currentTab === "buses") alert("Otobüs sefer ekleme modülü aktiftir.");
    else openPharmacyModal();
  });
});

// ----------------- SEKME NAVİGASYONU -----------------
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const tab = item.getAttribute("data-tab");
      switchTab(tab);
    });
  });
}

function switchTab(tabId) {
  currentTab = tabId;

  // Sidebar linklerini güncelle
  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.toggle("active", el.getAttribute("data-tab") === tabId);
  });

  // Sekme içeriklerini güncelle
  document.querySelectorAll(".tab-pane").forEach(el => {
    el.classList.toggle("active", el.id === `pane-${tabId}`);
  });

  // Başlıkları güncelle
  const titleMap = {
    dashboard: ["Genel Bakış (Dashboard)", "Süper uygulama dinamiklerinin merkezi yönetim kontrol paneli", "Hızlı Ekle"],
    pharmacies: ["Nöbetçi Eczane Yönetimi", "Yozgat Merkez ve İlçelerdeki eczaneler ve anlık 7/24 nöbet atamaları", "Yeni Eczane Ekle"],
    users: ["Kullanıcı Yönetimi", "Bozok 66 mobil uygulamasına kayıtlı kullanıcılar ve aktiflik durumları", "Yeni Kullanıcı Ekle"],
    buses: ["Otobüs Hat & Canlı Seferler", "Yozgat belediye ve halk otobüsleri hat ve canlı kalkış yönetimi", "Yeni Hat Ekle"],
    blood: ["Acil Kan Çağrıları", "Hastanelerden gelen anlık kan bağışı duyuruları ve panosu", "Yeni Kan Çağrısı Aç"],
    places: ["Keşfet & Gezilecek Yerler", "Yozgat turizm rotaları, müzeler, tarihi yerler ve fotoğrafları", "Yeni Mekan Ekle"],
    integration: ["Appsmith & ToolJet Entegrasyonu", "Uygulama şablonlarını Appsmith ve ToolJet platformlarına içe aktarma", "İndir"]
  };

  const info = titleMap[tabId] || ["Yönetim Paneli", "Kontrol Konsolu", "Ekle"];
  document.getElementById("pageTitle").textContent = info[0];
  document.getElementById("pageSubtitle").textContent = info[1];
  document.getElementById("btnAddText").textContent = info[2];
}

// ----------------- VERİ YÜKLEME -----------------
async function loadAllData() {
  await Promise.all([
    fetchStats(),
    fetchPharmacies(),
    fetchUsers(),
    fetchBuses(),
    fetchBloodRequests(),
    fetchPlaces()
  ]);
}

async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    setOnlineStatus(true);
    return await res.json();
  } catch (err) {
    console.warn(`API Hatası (${endpoint}):`, err);
    setOnlineStatus(false);
    return null;
  }
}

function setOnlineStatus(online) {
  const badge = document.getElementById("apiStatusBadge");
  const text = document.getElementById("apiStatusText");
  if (online) {
    badge.className = "api-status online";
    text.textContent = "API Gateway: Online";
  } else {
    badge.className = "api-status offline";
    badge.style.color = "#E11D48";
    text.textContent = "API Gateway: Offline (Simüle)";
  }
}

// 1. İSTATİSTİKLER
async function fetchStats() {
  const res = await apiFetch("/stats");
  const data = res?.data || {
    total_users: 124,
    active_users: 118,
    on_duty_pharmacies: 2,
    total_bus_routes: 4,
    urgent_blood_requests: 2
  };

  statsData = data;
  document.getElementById("statUsers").textContent = data.total_users;
  document.getElementById("statPharmacies").textContent = `${data.on_duty_pharmacies} Nöbetçi`;
  document.getElementById("statBuses").textContent = `${data.total_bus_routes} Hat`;
  document.getElementById("statBlood").textContent = `${data.urgent_blood_requests} Aktif`;

  document.getElementById("badgeDutyCount").textContent = data.on_duty_pharmacies;
  document.getElementById("badgeBloodCount").textContent = data.urgent_blood_requests;
}

// 2. ECZANELER
async function fetchPharmacies() {
  const res = await apiFetch("/pharmacies");
  pharmaciesData = res?.data || [
    { id: 1, name: "Bozok Eczanesi", is_on_duty: true, address: "Lise Caddesi No:12", neighborhood: "Aşağı Nohutlu", phone: "0354 212 11 22", hours: "7/24 Nöbetçi" },
    { id: 2, name: "Çamlık Eczanesi", is_on_duty: true, address: "Meydan Çarşısı No:4", neighborhood: "Medrese Mah.", phone: "0354 217 33 44", hours: "7/24 Nöbetçi" },
    { id: 3, name: "Şifa Eczanesi", is_on_duty: false, address: "Hastane Caddesi No:18", neighborhood: "Erdoğan Akdağ", phone: "0354 212 45 67", hours: "08:30 - 19:00" },
    { id: 4, name: "Üniversite Eczanesi", is_on_duty: false, address: "Kampüs Karşısı No:6", neighborhood: "Sarıhacılı", phone: "0354 214 78 90", hours: "08:30 - 19:00" }
  ];

  renderPharmacies(pharmaciesData);
}

function renderPharmacies(list) {
  // Dashboard Küçük Tablo
  const dashBody = document.querySelector("#tableDashPharmacies tbody");
  dashBody.innerHTML = list.filter(p => p.is_on_duty).map(p => `
    <tr>
      <td><b>${escapeHtml(p.name)}</b></td>
      <td>${escapeHtml(p.address)}</td>
      <td><a href="tel:${p.phone}" class="link">${p.phone}</a></td>
      <td><span class="badge badge-duty"><i class="fa-solid fa-circle-dot"></i> NÖBETÇİ</span></td>
    </tr>
  `).join("");

  // Tam Eczane Tablosu
  const fullBody = document.querySelector("#tableFullPharmacies tbody");
  fullBody.innerHTML = list.map(p => `
    <tr>
      <td>#${p.id}</td>
      <td><b>${escapeHtml(p.name)}</b></td>
      <td>
        <button class="btn btn-sm ${p.is_on_duty ? 'btn-danger' : 'btn-outline'}" onclick="toggleDuty(${p.id})">
          ${p.is_on_duty ? '<i class="fa-solid fa-check"></i> Nöbetçi (Açık)' : 'Normal (Kapalı)'}
        </button>
      </td>
      <td>${escapeHtml(p.address)}</td>
      <td>${escapeHtml(p.neighborhood || '-')}</td>
      <td>${escapeHtml(p.phone)}</td>
      <td>${escapeHtml(p.hours || '-')}</td>
      <td>
        <button class="btn-sm btn-ghost text-danger" onclick="deletePharmacy(${p.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

async function toggleDuty(id) {
  await apiFetch(`/pharmacies/${id}/toggle-duty`, { method: "PATCH" });
  await fetchPharmacies();
  await fetchStats();
}

async function deletePharmacy(id) {
  if (!confirm("Bu eczaneyi silmek istediğinize emin misiniz?")) return;
  await apiFetch(`/pharmacies/${id}`, { method: "DELETE" });
  await fetchPharmacies();
  await fetchStats();
}

// 3. KULLANICILAR
async function fetchUsers() {
  const res = await apiFetch("/users");
  usersData = res?.data || [
    { id: 1, full_name: "Ramazan Yönetici", email: "ramazan@bozok.edu.tr", is_active: true, created_at: "17.10.2026 20:00" },
    { id: 2, full_name: "Turgut Osman", email: "turgut@bozok.edu.tr", is_active: true, created_at: "17.10.2026 20:15" },
    { id: 3, full_name: "Burak Enes", email: "burak@bozok.edu.tr", is_active: true, created_at: "17.10.2026 20:30" }
  ];

  renderUsers(usersData);
}

function renderUsers(list) {
  const body = document.querySelector("#tableFullUsers tbody");
  body.innerHTML = list.map(u => `
    <tr>
      <td>#${u.id}</td>
      <td><b>${escapeHtml(u.full_name)}</b></td>
      <td>${escapeHtml(u.email)}</td>
      <td>
        <span class="badge ${u.is_active ? 'badge-success' : 'badge-warning'}">
          ${u.is_active ? 'Aktif' : 'Pasif'}
        </span>
      </td>
      <td>${escapeHtml(u.created_at || '-')}</td>
      <td>
        <button class="btn-sm btn-ghost text-danger" onclick="deleteUser(${u.id})">
          <i class="fa-solid fa-trash"></i> Sil
        </button>
      </td>
    </tr>
  `).join("");
}

async function deleteUser(id) {
  if (!confirm("Kullanıcıyı silmek istediğinize emin misiniz?")) return;
  await apiFetch(`/users/${id}`, { method: "DELETE" });
  await fetchUsers();
  await fetchStats();
}

// 4. OTOBÜS HATLARI
async function fetchBuses() {
  const res = await apiFetch("/buses");
  busesData = res?.data || [
    { id: 1, line_number: "1", route_name: "Kampüs - Cumhuriyet Meydanı - Otogar", direction: "Kampüs ➔ Otogar", first_departure: "06:30", last_departure: "23:30", interval_mins: 30, current_slot: "20:30", next_departure: "21:00", eta_text: "24 dk sonra", status: "Seferde" },
    { id: 2, line_number: "2", route_name: "Şehir Hastanesi - Çamlık - Kent Merkezi", direction: "Şehir Hastanesi ➔ Kent", first_departure: "06:45", last_departure: "23:15", interval_mins: 30, current_slot: "20:15", next_departure: "20:45", eta_text: "9 dk sonra", status: "Durağa Yaklaşıyor" }
  ];

  renderBuses(busesData);
}

function renderBuses(list) {
  const body = document.querySelector("#tableFullBuses tbody");
  body.innerHTML = list.map(b => `
    <tr>
      <td><span class="badge badge-duty" style="background:#0F172A; color:#FFF;">HAT ${escapeHtml(b.line_number)}</span></td>
      <td><b>${escapeHtml(b.route_name)}</b></td>
      <td>${escapeHtml(b.direction)}</td>
      <td>${escapeHtml(b.first_departure)} - ${escapeHtml(b.last_departure)}</td>
      <td>${b.interval_mins} dk</td>
      <td><span class="badge badge-duty">${escapeHtml(b.current_slot || '-')}</span></td>
      <td><b>${escapeHtml(b.next_departure || '-')}</b></td>
      <td><span class="badge badge-success">${escapeHtml(b.status || 'Seferde')}</span></td>
      <td>
        <button class="btn-sm btn-ghost text-danger" onclick="deleteBus(${b.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

async function deleteBus(id) {
  if (!confirm("Otobüs hattını silmek istiyor musunuz?")) return;
  await apiFetch(`/buses/${id}`, { method: "DELETE" });
  await fetchBuses();
}

// 5. ACİL KAN ÇAĞRILARI
async function fetchBloodRequests() {
  const res = await apiFetch("/blood-requests");
  bloodData = res?.data || [
    { id: 1, hospital: "Yozgat Şehir Hastanesi", blood_group: "A Rh(+)", patient_note: "Genel Cerrahi hastası için 2 ünite acil kan", contact_phone: "0354 219 00 10", created_at: "17.10.2026 19:30", is_active: true },
    { id: 2, hospital: "Bozok Üni. Tıp Fakültesi", blood_group: "0 Rh(-)", patient_note: "Yoğun bakım hastası için acil kan", contact_phone: "0354 212 70 50", created_at: "17.10.2026 18:45", is_active: true }
  ];

  renderBlood(bloodData);
}

function renderBlood(list) {
  const dashBody = document.querySelector("#tableDashBlood tbody");
  dashBody.innerHTML = list.filter(b => b.is_active).map(b => `
    <tr>
      <td><b>${escapeHtml(b.hospital)}</b></td>
      <td><span class="badge badge-duty">${escapeHtml(b.blood_group)}</span></td>
      <td>${escapeHtml(b.patient_note)}</td>
      <td><a href="tel:${b.contact_phone}" class="link">${b.contact_phone}</a></td>
    </tr>
  `).join("");

  const fullBody = document.querySelector("#tableFullBlood tbody");
  fullBody.innerHTML = list.map(b => `
    <tr>
      <td>#${b.id}</td>
      <td><b>${escapeHtml(b.hospital)}</b></td>
      <td><span class="badge badge-duty">${escapeHtml(b.blood_group)}</span></td>
      <td>${escapeHtml(b.patient_note)}</td>
      <td>${escapeHtml(b.contact_phone)}</td>
      <td>${escapeHtml(b.created_at || '-')}</td>
      <td>
        <button class="btn btn-sm ${b.is_active ? 'btn-danger' : 'btn-outline'}" onclick="toggleBlood(${b.id})">
          ${b.is_active ? 'Aktif Çağrı' : 'Tamamlandı'}
        </button>
      </td>
      <td>
        <button class="btn-sm btn-ghost text-danger" onclick="deleteBlood(${b.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

async function toggleBlood(id) {
  await apiFetch(`/blood-requests/${id}/toggle`, { method: "PATCH" });
  await fetchBloodRequests();
  await fetchStats();
}

async function deleteBlood(id) {
  if (!confirm("Acil kan talebini silmek istediğinize emin misiniz?")) return;
  await apiFetch(`/blood-requests/${id}`, { method: "DELETE" });
  await fetchBloodRequests();
  await fetchStats();
}

// 6. GEZİLECEK YERLER
async function fetchPlaces() {
  const res = await apiFetch("/places");
  placesData = res?.data || [];
  renderPlaces(placesData);
}

function renderPlaces(list) {
  const container = document.getElementById("placesGrid");
  container.innerHTML = list.map(p => `
    <div class="place-card">
      <img src="http://localhost:8000${p.image_url}" onerror="this.src='https://images.unsplash.com/photo-1448375240586-882707db888b?w=600'" alt="${escapeHtml(p.title)}">
      <div class="place-body">
        <span class="badge badge-normal" style="margin-bottom:6px;">${escapeHtml(p.category)}</span>
        <h4>${escapeHtml(p.title)}</h4>
        <p>${escapeHtml(p.description)}</p>
        <div style="font-size:11.5px; color:#64748B; margin-bottom:10px;">
          <i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.address)}
        </div>
        <button class="btn-sm btn-ghost text-danger" onclick="deletePlace(${p.id})">
          <i class="fa-solid fa-trash"></i> Sil
        </button>
      </div>
    </div>
  `).join("");
}

async function deletePlace(id) {
  if (!confirm("Bu gezi noktasını silmek istediğinize emin misiniz?")) return;
  await apiFetch(`/places/${id}`, { method: "DELETE" });
  await fetchPlaces();
}

// ----------------- MODAL İŞLEMLERİ -----------------
function closeModals() {
  document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"));
}

function openPharmacyModal() {
  document.getElementById("formPharmacy").reset();
  document.getElementById("modalPharmacy").classList.add("open");
}

async function savePharmacy(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById("pharmacyName").value,
    is_on_duty: document.getElementById("pharmacyIsDuty").value === "true",
    phone: document.getElementById("pharmacyPhone").value,
    address: document.getElementById("pharmacyAddress").value,
    neighborhood: document.getElementById("pharmacyNeighborhood").value || "Merkez",
    hours: document.getElementById("pharmacyHours").value || "08:30 - 19:00"
  };

  await apiFetch("/pharmacies", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  closeModals();
  await fetchPharmacies();
  await fetchStats();
  switchTab("pharmacies");
}

function openBloodModal() {
  document.getElementById("formBlood").reset();
  document.getElementById("modalBlood").classList.add("open");
}

async function saveBlood(e) {
  e.preventDefault();
  const payload = {
    hospital: document.getElementById("bloodHospital").value,
    blood_group: document.getElementById("bloodGroup").value,
    contact_phone: document.getElementById("bloodPhone").value,
    patient_note: document.getElementById("bloodNote").value,
    is_active: true
  };

  await apiFetch("/blood-requests", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  closeModals();
  await fetchBloodRequests();
  await fetchStats();
  switchTab("blood");
}

function openUserModal() {
  document.getElementById("formUser").reset();
  document.getElementById("modalUser").classList.add("open");
}

async function saveUser(e) {
  e.preventDefault();
  const payload = {
    full_name: document.getElementById("userName").value,
    email: document.getElementById("userEmail").value,
    password: document.getElementById("userPass").value,
    is_active: true
  };

  await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  closeModals();
  await fetchUsers();
  await fetchStats();
  switchTab("users");
}

// ----------------- FİLTRELEME & ARAMA -----------------
function initSearchFilters() {
  document.getElementById("searchPharmacies")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = pharmaciesData.filter(p => 
      p.name.toLowerCase().includes(q) || (p.address && p.address.toLowerCase().includes(q)) || p.phone.includes(q)
    );
    renderPharmacies(filtered);
  });

  document.getElementById("searchUsers")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = usersData.filter(u => 
      u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
    renderUsers(filtered);
  });

  document.getElementById("searchBuses")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = busesData.filter(b => 
      b.line_number.includes(q) || b.route_name.toLowerCase().includes(q)
    );
    renderBuses(filtered);
  });

  document.getElementById("searchBlood")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = bloodData.filter(b => 
      b.hospital.toLowerCase().includes(q) || b.blood_group.toLowerCase().includes(q)
    );
    renderBlood(filtered);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
