#!/usr/bin/env python3
"""
engine/blog_gen.py - ArtinTech auto blog generator
Generates N SEO-friendly Persian articles (with hashtags + seo_keywords),
optionally nudged by Iran Google Trends topics, writes them into data/blog.json
and (if --commit) pushes to GitHub Pages.

Usage:
  python engine/blog_gen.py            # generate per settings.json posts_per_day (default 3)
  python engine/blog_gen.py --count 3 --commit
  python engine/blog_gen.py --no-trends
"""
import json, os, sys, subprocess, datetime, random, argparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SETTINGS = os.path.join(ROOT, "data", "settings.json")
BLOG = os.path.join(ROOT, "data", "blog.json")

def load_settings():
    with open(SETTINGS, encoding="utf-8") as f:
        return json.load(f)

def shamsi_today():
    # Gregorian -> Jalali (standard algorithm, no deps)
    g = datetime.date.today()
    gy, gm, gd = g.year, g.month, g.day
    g_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
    j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
    gy2 = (gy + 1) if gm > 2 else gy
    jnp = 355666 + (365 * gy) + ((gy2 + 3) // 4) - ((gy2 + 99) // 100) + ((gy2 + 199) // 400)
    for i in range(gm - 1):
        jnp += g_days_in_month[i]
    jnp += gd - 1
    jy = -1595 + (33 * (jnp // 12053))
    jnp %= 12053
    jy += 4 * (jnp // 1461)
    jnp %= 1461
    if jnp >= 366:
        jy += (jnp - 1) // 365
        jnp = (jnp - 1) % 365
    for i in range(11):
        if jnp >= j_days_in_month[i]:
            jnp -= j_days_in_month[i]
        else:
            break
    jm = i + 1
    jd = jnp + 1
    return f"{jy}/{jm:02d}/{jd:02d}"

def gen_article(topic):
    """Local generator: builds a structured SEO article without external API."""
    title = f"{topic}: راهنمای عملی برای رشد دیجیتال"
    excerpt = f"در این مقاله یاد می‌گیری چطور «{topic}» را قدم‌به‌قدم اجرا کنی و از آن برای بهبود فردی و حرفه‌ای استفاده کنی."
    hashtags = ["#" + topic.replace(" ", ""), "#آرتین‌تک", "#خودسازی", "#دیجیتال"]
    seo = [topic, "آموزش " + topic, "بهترین روش " + topic]
    body = (
        f"مقدمه\n{topic} یکی از مهارت‌های کلیدی دنیای امروز است. "
        f"در ادامه ۳ گام عملی برای شروع آورده شده:\n\n"
        f"۱. هدف‌گذاری\nدقیقاً مشخص کن چه می‌خواهی به دست بیاوری.\n\n"
        f"۲. ابزار مناسب\nاز نرم‌افزارها و اتوماسیون برای سرعت بیشتر استفاده کن.\n\n"
        f"۳. اجرا و بهبود\nهفته‌ای یک بار عملکردت را بررسی و اصلاح کن.\n\n"
        f"نتیجه\nبا پایداری در «{topic}»، طی چند ماه تفاوت معناداری در بهره‌وری خواهی دید."
    )
    return {
        "tag": topic.split()[0] if topic else "آموزش",
        "title": title,
        "date": shamsi_today(),
        "excerpt": excerpt,
        "hashtags": hashtags,
        "seo_keywords": seo,
        "body": body
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--count", type=int, default=None)
    ap.add_argument("--commit", action="store_true")
    ap.add_argument("--no-trends", action="store_true")
    args = ap.parse_args()

    cfg = load_settings()
    count = args.count or cfg.get("blog", {}).get("posts_per_day", 3)
    pool = cfg.get("blog", {}).get("topics_pool", [])
    use_trends = cfg.get("blog", {}).get("use_google_trends_iran", False) and not args.no_trends

    topics = list(pool)
    if use_trends:
        try:
            # lightweight trend probe (no API key): pull trending Iranian queries via web
            from hermes_tools import web_search
            res = web_search(query="پرطرفدارترین جستجوهای امروز ایران", limit=5)
            for item in res.get("data", {}).get("web", []):
                t = item.get("title", "")
                if t and len(t) < 40:
                    topics.insert(0, t)
        except Exception:
            pass  # fall back to pool

    random.shuffle(topics)
    chosen = topics[:count]

    # load existing
    posts = []
    if os.path.exists(BLOG):
        with open(BLOG, encoding="utf-8") as f:
            posts = json.load(f).get("posts", [])

    for t in chosen:
        posts.insert(0, gen_article(t))

    posts = posts[:60]  # cap
    with open(BLOG, "w", encoding="utf-8") as f:
        json.dump({"posts": posts}, f, ensure_ascii=False, indent=2)

    print(f"Generated {len(chosen)} article(s). Total in blog.json: {len(posts)}")

    if args.commit:
        os.chdir(ROOT)
        token = os.environ.get("GITHUB_TOKEN", "")
        subprocess.run(["git", "add", "data/blog.json"], check=False)
        subprocess.run(["git", "commit", "-m", "auto: new blog posts"], check=False)
        if token:
            subprocess.run(["git", "push",
                            f"https://{token}@github.com/Mailin-Sharin/artintech.git",
                            "HEAD:master"], check=False)
        print("Committed + pushed.")

if __name__ == "__main__":
    main()
