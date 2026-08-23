"""
ArtinTech daily auto-blogger.
Generates one SEO-friendly Persian article per day in the self-improvement /
digital-skills niche, writes it as a static HTML page, and updates posts/index.json.

Run daily (e.g. Windows Task Scheduler):
    python auto_blog.py
"""
import os
import json
import datetime

BASE = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(BASE, "posts")
INDEX = os.path.join(POSTS_DIR, "index.json")

# Topic pool - self-improvement + digital skills, SEO keywords baked in.
TOPICS = [
    ("چگونه مهارت‌های دیجیتال خود را در ۳۰ روز ارتقا دهید", "یادگیری مهارت‌های دیجیتال، خودسازی، بهره‌وری", "رشد فردی با ابزارهای دیجیتال"),
    ("هوش‌مصنوعی چگونه به خودسازی کمک می‌کند", "هوش مصنوعی، خودسازی، ابزارهای یادگیری", "استفاده هوشمندانه از AI"),
    ("۵ عادت روزانه برای افزایش تمرکز و بهره‌وری", "تمرکز، بهره‌وری، عادت‌های مفید", "مدیریت زمان و انرژی"),
    ("تبدیل متن به صدای فارسی؛ راهی نوین برای تولید محتوا", "تبدیل متن به صدا، فارسی، تولید محتوا", "صوتی‌سازی محتوا"),
    ("چرا اتوماسیون اداری وقت شما را آزاد می‌کند", "اتوماسیون، صرفه‌جویی در وقت، ابزارهای کار", "کار هوشمندانه‌تر"),
    ("سئو برای مبتدیان: ۷ گام عملی برای دیده شدن", "سئو، بهینه‌سازی سایت، رتبه جستجو", "دیده شدن در اینترنت"),
    ("برنامه‌نویسی پایتون برای غیرفنی‌ها: از صفر تا اولین اسکریپت", "پایتون، برنامه‌نویسی، یادگیری کد", "شروع کدنویسی"),
    ("چگونه با تولید محتوای مستمر اعتماد مخاطب بسازید", "تولید محتوا، بازاریابی، اعتماد", "رشد برند شخصی"),
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
    <p>در دنیای امروز، مهارت‌های دیجیتال بخش جدایی‌ناپذیر خودسازی هستند. وقتی ابزارهای درست را بشناسید،
    می‌توانید زمان بیشتری برای چیزهایی که واقعاً اهمیت دارند صرف کنید.</p>
    <p>آرتین‌تک با ارائه خدمات طراحی سایت، برنامه‌نویسی پایتون، تبدیل متن به صدای فارسی، سئو و اتوماسیون،
    مسیر رشد شما را هموار می‌کند. شروع کوچک اما مستمر، کلید پیشرفت است.</p>
    <p>اگر می‌خواهید یکی از این خدمات را برای خود یا کسب‌وکارتان اجرا کنید، از بخش تماس با ما پیام بدهید.</p>
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
    # update index
    posts = []
    if os.path.exists(INDEX):
        with open(INDEX, encoding="utf-8") as f:
            posts = json.load(f)
    posts.insert(0, {
        "title": title,
        "file": fname,
        "date": datetime.date.today().isoformat(),
        "read": "۳ دقیقه مطالعه",
        "kw": kw
    })
    with open(INDEX, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print("Generated:", fname)

if __name__ == "__main__":
    main()
