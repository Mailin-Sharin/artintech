"""
ArtinTech daily auto-blogger - Arduino / electronics education niche.
Generates one SEO-friendly Persian article per day, writes it as a static
HTML page, and updates posts/index.json. Run daily (Windows Task Scheduler).
"""
import os
import json
import datetime

BASE = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(BASE, "posts")
INDEX = os.path.join(POSTS_DIR, "index.json")

# Topic pool - Arduino / electronics education, SEO keywords baked in.
TOPICS = [
    ("آردوینو چیست و چگونه شروع کنیم", "آموزش آردوینو، برد الکترونیکی، میکروکنترلر", "شروع کار با برد"),
    ("اولین پروژه: چشمک زدن یک LED با آردوینو", "پروژه آردوینو، LED، برنامه‌نویسی برد", "عملی از صفر"),
    ("تفاوت آردوینو و میکروکنترلرهای دیگر", "مقایسه بردها، انتخاب مناسب", "راهنمای خرید"),
    ("سنسور دما چگونه به آردوینو وصل می‌شود", "سنسور دما، اتصال ماژول، خواندن داده", "کار با سنسور"),
    ("رله چیست و چگونه وسایل را با برد کنترل کنیم", "رله، کنترل وسیله، اتوماسیون", "پروژه هوشمند"),
    ("عیب‌یابی برد الکترونیکی سوخته", "تعمیر برد، عیب‌یابی، تست قطعه", "نجات برد"),
    ("ساخت سیستم آبیاری خودکار با آردوینو", "آبیاری هوشمند، پروژه عملی، سنسور رطوبت", "پروژه واقعی"),
    ("برنامه‌نویسی برد به زبان ساده", "زبان C آردوینو، متغیر، حلقه، شرط", "یادگیری کد"),
]

def pick_topic():
    day = datetime.date.today().toordinal()
    return TOPICS[day % len(TOPICS)]

def article_html(title, kw, lede):
    today = datetime.date.today().strftime("%Y-%m-%d")
    body = f"""
<section class="section">
  <h2>{title}</h2>
  <p class="section-sub">منتشر شده در {today} · موضوع: {kw}</p>
  <article style="max-width:720px;margin:0 auto;color:var(--muted)">
    <p>{lede}</p>
    <p>یادگیری بردهای الکترونیکی و آردوینو، یکی از ارزشمندترین مهارت‌های دنیای دیجیتال امروز است.
    با درک ساده‌ی مدار و برنامه، می‌توانید ایده‌های خود را به دستگاه‌های واقعی تبدیل کنید.</p>
    <p>آرتین‌تک قدم‌به‌قدم، از اولین آشنایی با برد تا پروژه‌های هوشمند، همراه شماست. شروع کوچک اما
    مستمر، کلید پیشرفت در الکترونیک است.</p>
    <p>اگر سؤال یا درخواست پروژه دارید، از بخش تماس با ما پیام بدهید.</p>
  </article>
</section>
"""
    return f"""<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>{title} | آرتین‌تک</title>
<meta name="description" content="{lede}"/>
<meta name="keywords" content="{kw}"/>
<link rel="stylesheet" href="../styles.css"/>
</head>
<body>
<header class="hero"><nav><div class="logo">آرتین‌تک <span>ArtinTech</span></div>
<ul class="nav-links"><li><a href="../index.html">خانه</a></li><li><a href="../blog.html">وبلاگ</a></li></ul></nav></header>
<main>{body}</main>
<footer><p>© ۱۴۰۴ آرتین‌تک</p></footer>
</body></html>"""

def main():
    os.makedirs(POSTS_DIR, exist_ok=True)
    title, kw, lede = pick_topic()
    slug = "".join(c for c in title if c.isalnum() or c == " ")[:30].strip().replace(" ", "-")
    fname = f"{datetime.date.today().isoformat()}-{slug}.html"
    fpath = os.path.join(POSTS_DIR, fname)
    if os.path.exists(fpath):
        print("Already generated today:", fname)
        return
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(article_html(title, kw, lede))
    posts = []
    if os.path.exists(INDEX):
        with open(INDEX, encoding="utf-8") as f:
            posts = json.load(f)
    posts.insert(0, {
        "title": title, "file": fname,
        "date": datetime.date.today().isoformat(),
        "read": "۳ دقیقه مطالعه", "kw": kw
    })
    with open(INDEX, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print("Generated:", fname)

if __name__ == "__main__":
    main()
