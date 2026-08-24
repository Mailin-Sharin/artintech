@echo off
cd /d C:\Users\milad\artintech
REM GITHUB_TOKEN should be set as a Windows environment variable (do NOT hardcode the token here)
if "%GITHUB_TOKEN%"=="" (
  echo ERROR: GITHUB_TOKEN environment variable is not set. Set it in System Properties or Task Scheduler.
  exit /b 1
)
python engine\blog_gen.py --count 3 --commit --no-trends
