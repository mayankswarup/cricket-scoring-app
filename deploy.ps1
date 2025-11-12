# Cricket App Deployment Script
# Automatically commits all changes, builds and deploys to GitHub Pages

Write-Host "🏏 Starting Cricket App Deployment..." -ForegroundColor Green

# Step 0: Commit all current changes first
Write-Host "📝 Staging all changes..." -ForegroundColor Yellow
git add .

Write-Host "💾 Committing changes (if any)..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Update: Auto-commit before deployment at $timestamp" 2>&1 | Out-Null
$commitSuccess = $?

if ($commitSuccess) {
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
    Write-Host "🚀 Pushing changes to GitHub..." -ForegroundColor Yellow
    git push origin simple-cricket-app 2>&1 | Out-Null
    if (-not $?) {
        Write-Host "⚠️  Push failed, will retry after build" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  No changes to commit or commit failed" -ForegroundColor Yellow
}

# Step 1: Build the app
Write-Host "📦 Building app for web..." -ForegroundColor Yellow
npx expo export --platform web --output-dir docs

if (-not $?) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Add SPA fallback
Write-Host "🔄 Adding SPA fallback..." -ForegroundColor Yellow
Copy-Item "docs/index.html" "docs/404.html" -Force

# Step 3: Add .nojekyll file (critical for GitHub Pages)
Write-Host "📄 Adding .nojekyll file..." -ForegroundColor Yellow
New-Item -Path "docs/.nojekyll" -ItemType File -Force | Out-Null

# Step 4: Add all changes to git
Write-Host "📝 Adding changes to git..." -ForegroundColor Yellow
git add docs/

# Step 5: Commit with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Deploy: Auto-deployment at $timestamp" 2>&1 | Out-Null

if (-not $?) {
    Write-Host "❌ Git commit failed!" -ForegroundColor Red
    exit 1
}

# Step 6: Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push origin simple-cricket-app 2>&1 | Out-Null

if (-not $?) {
    Write-Host "❌ Git push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌐 Your app is live at: https://mayankswarup.github.io/cricket-scoring-app/" -ForegroundColor Cyan
Write-Host "⏰ Wait 1-2 minutes for GitHub Pages to update" -ForegroundColor Yellow
