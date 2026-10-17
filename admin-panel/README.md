# 🛡️ Bozok 66 - Appsmith & ToolJet Yönetim Paneli Entegrasyonu

Bu dizin, **Bozok 66 Yozgat Süper Uygulaması** için hazırlanmış **Appsmith** ve **ToolJet** low-code yönetim paneli (Admin Panel) mimarisini ve hazır şablonlarını içerir.

---

## 📂 Dizin Yapısı

```
📁 admin-panel/
│
├── 📄 start_admin.bat            # Çift tıklamayla paneli tarayıcıda anında açar
├── 📄 docker-compose.yml         # Appsmith / ToolJet yerel Docker kurulum dosyası
│
├── 📁 appsmith/
│   └── 📄 appsmith-app.json      # Appsmith "Import Application" için hazır tam şablon
│
├── 📁 tooljet/
│   └── 📄 tooljet-app.json       # ToolJet "Import App" için hazır tam şablon
│
└── 📁 web-dashboard/             # Anında çalışan Appsmith/ToolJet tasarımlı Web Panel
    ├── 📄 index.html             # Yönetim Arayüzü
    ├── 📄 styles.css             # Appsmith/ToolJet UI Tema Stilleri
    └── 📄 app.js                 # FastAPI CRUD API Bağlantı Katmanı
```

---

## 🚀 1. En Hızlı Başlangıç (Kurulum Gerektirmez)

`admin-panel/start_admin.bat` dosyasına çift tıklayın veya tarayıcınızda doğrudan:
- `admin-panel/web-dashboard/index.html` dosyasını açın.
- Veya FastAPI çalışırken: `http://localhost:8000/admin-dashboard` adresine gidin.

Bu panel; **Appsmith** ve **ToolJet** bileşen mimarisini ve tasarım dilini kullanarak doğrudan projenin FastAPI backend'ine bağlanır ve tüm CRUD işlemlerini canlı yapar.

---

## ⚡ 2. Appsmith İle Kullanım (Cloud veya Docker)

### A. Appsmith Cloud (1 Dakikada Hazır)
1. [app.appsmith.com](https://app.appsmith.com) adresine gidin ve ücretsiz giriş yapın.
2. Sağ üstten **"Create New"** butonuna tıklayın ve **"Import Application"** (Uygulama İçe Aktar) seçeneğini seçin.
3. Bilgisayarınızdaki `admin-panel/appsmith/appsmith-app.json` dosyasını yükleyin.
4. Tüm ekranlar, tablolar, metrik kartları ve API sorguları anında önünüze gelecektir!

### B. Appsmith Yerel Docker İle Çalıştırma
Bilgisayarınızda Docker kuruluysa:
```bash
cd admin-panel
docker-compose up -d appsmith
```
Ardından tarayıcınızdan `http://localhost:8080` adresine girerek Appsmith'i açın ve `appsmith-app.json` dosyasını import edin.

---

## 🚀 3. ToolJet İle Kullanım (Cloud veya Docker)

### A. ToolJet Cloud (1 Dakikada Hazır)
1. [app.tooljet.com](https://app.tooljet.com) adresine gidin ve oturum açın.
2. Dashboard'da sağ üstteki **"Import"** butonuna tıklayın.
3. `admin-panel/tooljet/tooljet-app.json` dosyasını seçin.
4. ToolJet tüm REST API veri kaynaklarını (`http://localhost:8000/api/admin`) ve bileşenleri otomatik olarak yükler.

---

## 🔌 4. Yönetim Paneli API Uç Noktaları (FastAPI)

FastAPI Gateway üzerinden Appsmith / ToolJet tarafından tüketilen hazır endpoint'ler:

| Modül | Yöntem | Endpoint | Açıklama |
|---|---|---|---|
| **Dashboard** | `GET` | `/api/admin/stats` | Toplam kullanıcı, nöbetçi sayısı, hatlar vb. |
| **Eczaneler** | `GET` | `/api/admin/pharmacies` | Tüm eczaneleri listeler |
| **Eczaneler** | `POST` | `/api/admin/pharmacies` | Yeni eczane ekler |
| **Eczaneler** | `PATCH` | `/api/admin/pharmacies/{id}/toggle-duty` | Tek tıkla Nöbetçi Aç/Kapa |
| **Eczaneler** | `DELETE`| `/api/admin/pharmacies/{id}` | Eczane siler |
| **Kullanıcılar**| `GET` | `/api/admin/users` | Kullanıcı listesi & arama |
| **Kullanıcılar**| `POST` | `/api/admin/users` | Yeni kullanıcı oluşturur |
| **Kullanıcılar**| `DELETE`| `/api/admin/users/{id}` | Kullanıcı siler |
| **Otobüsler** | `GET` | `/api/admin/buses` | Hatlar ve canlı kalkış dilimleri |
| **Otobüsler** | `POST` | `/api/admin/buses` | Yeni otobüs hattı tanımlar |
| **Otobüsler** | `DELETE`| `/api/admin/buses/{id}` | Hat siler |
| **Acil Kan** | `GET` | `/api/admin/blood-requests` | Aktif ve tamamlanan kan duyuruları |
| **Acil Kan** | `POST` | `/api/admin/blood-requests` | Yeni acil kan ilanı yayınlar |
| **Acil Kan** | `PATCH` | `/api/admin/blood-requests/{id}/toggle` | İlan durumunu aktif/kapalı yapar |
| **Keşfet** | `GET` | `/api/admin/places` | Yozgat turistik mekanlar listesi |
| **Keşfet** | `POST` | `/api/admin/places` | Yeni turistik mekan ekler |

---

## 🎯 Panel Özellikleri
- ✅ **Canlı Nöbetçi Eczane Yönetimi:** Tek tıkla nöbetçi eczaneyi değiştirme, yeni nöbetçi atama.
- ✅ **Acil Kan Bağışı Panosu:** Hastanelerden gelen kan taleplerini anında mobil uygulamaya düşürme.
- ✅ **Otobüs Hat & Canlı Sefer Takibi:** Hat saatleri ve aktiflik durumlarını yönetme.
- ✅ **Kullanıcı Yönetimi:** Kayıtlı öğrencileri / vatandaşları listeleme ve durum kontrolü.
- ✅ **Keşfet Rehberi:** Yozgat tarihi yerler, lavanta adası, kanyonlar ve mesire alanlarını yönetme.
