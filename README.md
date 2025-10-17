# QR Kodlu Kafe Sipariş Sistemi

Bu proje; müşteri tarafı QR menü ve sipariş, yönetim paneli, gerçek zamanlı sipariş takibi ve raporlama için hazırlanmış tam-stack bir örnektir.

## Teknolojiler
- Backend: Node.js, Express, Prisma (PostgreSQL), JWT, Rate limit, Helmet
- Frontend: React (Vite), TailwindCSS, Zustand, React Router, Axios
- Deployment: Supabase (PostgreSQL) + Vercel (Frontend + Backend)

## Lokal Kurulum

1) Node.js 18+ yüklü olduğundan emin olun.

2) Backend bağımlılıkları ve veritabanı:
```bash
cd backend
npm i
# .env dosyasını oluştur (aşağıdaki değişkenlerle):
# DATABASE_URL="file:./dev.db"
# DATABASE_PROVIDER="sqlite"
# JWT_SECRET="dev_secret_change_in_production"
npx --yes prisma migrate dev --name init
npm run seed
npm run dev
```
Sunucu varsayılan: http://localhost:4000

**Environment Variables (.env dosyası için):**
```
DATABASE_URL="file:./dev.db"              # Development için SQLite
JWT_SECRET="dev_secret_change_me"         # Production'da değiştir!
CORS_ORIGINS="http://localhost:5173,http://localhost:4173"
PORT=4000
```

**Production için DATABASE_URL:**
PostgreSQL (Supabase): `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3) Frontend bağımlılıkları ve çalıştırma:
```
cd frontend/app
npm i
npm run dev
```
Uygulama: http://localhost:5173

## Canlıya Alma (Supabase + Vercel)

### 1. Supabase PostgreSQL Kurulumu
1. [Supabase.com](https://supabase.com)'da hesap oluştur ve yeni proje başlat
2. Proje ayarlarından Database → Connection string'i kopyala
3. Settings → API → Project URL ve anon public key'i not al

### 2. Backend Vercel Deployment
1. Projeyi GitHub'a push et
2. [Vercel.com](https://vercel.com)'da hesap oluştur
3. "New Project" → Import Git Repository
4. **Root Directory**: `backend`
5. **Environment Variables** ekle:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   JWT_SECRET=your_super_secret_jwt_key_generate_random_string
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
6. Deploy et ve backend URL'ini not al (örn: `https://your-backend.vercel.app`)

### 3. Frontend Vercel Deployment
1. Vercel'de yeni proje oluştur
2. **Root Directory**: `frontend/app`
3. **Environment Variables** ekle:
   ```
   VITE_API_URL=https://your-backend.vercel.app/api
   ```
4. Deploy et

### 4. Veritabanı Migrasyonu
Backend deploy olduktan sonra:
1. Vercel dashboard'dan backend projesine git
2. Functions → Logs sekmesine bak
3. Eğer migration hatası varsa, terminalden şu komutu çalıştır:
   ```bash
   npx prisma db push --schema=backend/prisma/schema.prisma
   ```

### 5. İlk Veri Eklemek
Backend deploy olduktan sonra seed komutunu çalıştır:
```bash
npx prisma db seed --schema=backend/prisma/schema.prisma
```

### Environment Variables Açıklaması
- `DATABASE_URL`: Development için `file:./dev.db`, Production için Supabase PostgreSQL connection string
- `JWT_SECRET`: Rastgele güçlü şifre (32+ karakter, production'da değiştir!)
- `CORS_ORIGINS`: Frontend URL'in (wildcard ile `*` da kullanabilirsin)
- `VITE_API_URL`: Backend API URL'i (frontend için)

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
