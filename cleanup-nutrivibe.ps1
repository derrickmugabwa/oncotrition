# Cleanup Old NutriVibe Files
# This script removes the old standalone NutriVibe pages and API routes
# that have been replaced by the integrated events registration system

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  NutriVibe Cleanup Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$projectRoot = "c:\Users\Derrick Mugabwa\Desktop\dev center\oncotrition"
Set-Location $projectRoot

Write-Host "Removing old NutriVibe files...`n" -ForegroundColor Yellow

# Delete old frontend pages
$frontendPath = "app\(site)\nutrivibe"
if (Test-Path $frontendPath) {
    Remove-Item -Recurse -Force $frontendPath
    Write-Host "✓ Deleted: $frontendPath" -ForegroundColor Green
} else {
    Write-Host "⊘ Not found: $frontendPath (already deleted)" -ForegroundColor Gray
}

# Delete old API routes
$apiPath = "app\api\nutrivibe"
if (Test-Path $apiPath) {
    Remove-Item -Recurse -Force $apiPath
    Write-Host "✓ Deleted: $apiPath" -ForegroundColor Green
} else {
    Write-Host "⊘ Not found: $apiPath (already deleted)" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Cleanup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Old NutriVibe files have been removed." -ForegroundColor White
Write-Host "`nThe following are now used instead:" -ForegroundColor White
Write-Host "  • /events/[id]/register (registration page)" -ForegroundColor Cyan
Write-Host "  • /events/payment/verify (payment verification)" -ForegroundColor Cyan
Write-Host "  • /api/events/[id]/register (registration API)" -ForegroundColor Cyan
Write-Host "  • /api/events/verify-payment (verification API)" -ForegroundColor Cyan

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npm run dev" -ForegroundColor White
Write-Host "  2. Test registration flow" -ForegroundColor White
Write-Host "  3. Verify everything works`n" -ForegroundColor White
