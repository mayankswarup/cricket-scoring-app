@echo off
echo 🏏 Starting Cricket App Deployment...

echo 📝 Staging all changes...
git add .

echo 💾 Committing changes (if any)...
git commit -m "Update: Auto-commit before deployment at %date% %time%"
if errorlevel 1 (
    echo ⚠️  No changes to commit or commit failed
) else (
    echo ✅ Changes committed successfully
    echo 🚀 Pushing changes to GitHub...
    git push origin simple-cricket-app
    if errorlevel 1 (
        echo ⚠️  Push failed, will retry after build
    )
)

echo 📦 Building app for web...
npx expo export --platform web --output-dir docs
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 🔄 Adding SPA fallback...
copy "docs\index.html" "docs\404.html" /Y

echo 📄 Adding .nojekyll file...
echo. > "docs\.nojekyll"

echo 📝 Adding changes to git...
git add docs/

echo 🚀 Committing and pushing...
git commit -m "Deploy: Auto-deployment at %date% %time%"
git push origin simple-cricket-app

if errorlevel 1 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo ✅ Deployment Complete!
echo 🌐 Your app is live at: https://mayankswarup.github.io/cricket-scoring-app/
echo ⏰ Wait 1-2 minutes for GitHub Pages to update
pause
