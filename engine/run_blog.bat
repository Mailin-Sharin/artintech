@echo off
cd /d C:\Users\milad\artintech
set GITHUB_TOKEN=TOKEN_REMOVED
python engine\blog_gen.py --count 3 --commit --no-trends
