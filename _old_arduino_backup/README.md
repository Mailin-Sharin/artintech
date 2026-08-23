# آرتین‌تک | ArtinTech

سایت خدمات کامپیوتری و هوش‌مصنوعی برای رشد فردی و کسب‌وکار.

## ساختار
- `index.html` — صفحه اصلی (خدمات + فرم تماس + نمایش وبلاگ)
- `blog.html` — آرشیو وبلاگ
- `styles.css` — طراحی مدرن ریسپانسیو
- `main.js` — فرم تماس (ذخیره محلی) + لود مطالب
- `auto_blog.py` — تولید خودکار یک مقاله SEO در روز
- `posts/` — مقالات + `index.json`

## هاست رایگان (GitHub Pages)
1. یک ریپوزیتوری جدید در github.com بسازید (مثلاً `artintech.github.io`).
2. توکن را به agent بدهید یا خودتان اجرا کنید:
   ```
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```
3. در Settings → Pages، منبع را روی `main` / root قرار دهید.
4. سایت در `https://USERNAME.github.io/` در دسترس است.

## بلاگ خودکار روزانه
برای اجرای هر روز (ویندوز Task Scheduler):
```
python auto_blog.py
```
هر اجرا یک مقاله جدید با کلمات کلیدی خودسازی/مهارت دیجیتال می‌سازد و `posts/index.json` را به‌روز می‌کند.

## تماس
- تلگرام: https://t.me/artintech_support
- واتس‌اپ: https://wa.me/980000000000
- فرم سایت (پیام در مرورگر کاربر ذخیره می‌شود)

© ۱۴۰۴ آرتین‌تک
