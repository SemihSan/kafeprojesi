# QR Kodlu Kafe Sipariş Sistemi

Bu proje; müşteri tarafı QR menü ve sipariş, yönetim paneli, gerçek zamanlı sipariş takibi ve raporlama için hazırlanmış tam-stack bir örnektir.

## Teknolojiler
- Backend: Node.js, Express, Prisma (PostgreSQL), JWT, Rate limit, Helmet
- Frontend: React (Vite), TailwindCSS, Zustand, React Router, Axios
- Deployment: Supabase (PostgreSQL) + Vercel (Frontend + Backend)

## Lokal Kurulum

1) Node.js 18+ yüklü olduğundan emin olun.

2) Backend bağımlılıkları ve veritabanı:
```
cd backend
npm i
# .env dosyasını oluştur: DATABASE_URL=postgresql://..., JWT_SECRET=...
npx --yes prisma migrate dev --name init
npm run seed
npm run dev
```
Sunucu varsayılan: http://localhost:4000

3) Frontend bağımlılıkları ve çalıştırma:
```
cd frontend/app
npm i
npm run dev
```
Uygulama: http://localhost:5173

## Canlıya Alma (Supabase + Vercel)

### 1. Supabase PostgreSQL
- Supabase.com'da proje oluştur
- Connection string'i kopyala
- `backend/.env` dosyasında `DATABASE_URL=postgresql://...` ayarla

### 2. Backend'i Vercel'e Deploy
- GitHub'a push et
- Vercel'de "New Project" → Root: `backend`
- Environment Variables: `DATABASE_URL`, `JWT_SECRET`
- Deploy et

### 3. Frontend'i Vercel'e Deploy
- Vercel'de "New Project" → Root: `frontend/app`
- Environment Variables: `VITE_API_URL=https://senin-backend.vercel.app/api`
- Deploy et

## Kullanım
- Müşteri QR: `/?tableId=<masaId>` ile yönlenir ve `/menu` sayfası açılır.
- Sepeti oluşturup sipariş verir; durum güncellemelerini `/status/:orderId` sayfasından takip eder.
- Admin giriş: `owner@cafe.local` / `admin123`
- Yönetim Paneli: `/admin/login` → `/admin/dashboard`

## Önemli API'ler
- `GET /api/menu` — kategoriler ve ürünler
- `POST /api/orders` — sipariş oluşturma { tableId, items: [{productId, quantity}] }
- `GET /api/orders/:id` — tekil sipariş (durum sayfası için)
- `POST /api/admin/login` — JWT alır
- `GET /api/admin/orders|products|tables`
- `PATCH /api/admin/orders/:id/status` — durum güncelleme
- `GET /api/tables/:id/qr` — masa QR bilgisi (data URL)

## Notlar
- Ödeme kasada; bu sistem yalnız sipariş yönetimi içindir.
- Rate limit, JWT ile güvenlik kuruludur.
- Gerçek zamanlı güncellemeler Polling ile (3 saniye aralık).
- Geliştirme için configler `backend/src/config.js` ve `.env` dosyalarında.
