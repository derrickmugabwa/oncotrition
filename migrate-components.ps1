# Component Migration Script
# Migrates from @supabase/auth-helpers-nextjs to @/utils/supabase/client

Write-Host "Starting component migration..." -ForegroundColor Green
Write-Host ""

# Get all TypeScript/TSX files in components directory
$files = Get-ChildItem -Path "components" -Recurse -Include *.tsx,*.ts -File

$migratedCount = 0
$skippedCount = 0
$errorCount = 0

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        
        # Check if file needs migration
        if ($content -match "createClientComponentClient") {
            Write-Host "Migrating: $($file.FullName)" -ForegroundColor Yellow
            
            # Replace import statement
            $content = $content -replace "import \{ createClientComponentClient \} from '@supabase/auth-helpers-nextjs';", "import { createClient } from '@/utils/supabase/client';"
            
            # Replace usage with Database type
            $content = $content -replace "createClientComponentClient<Database>\(\)", "createClient()"
            
            # Replace usage without Database type
            $content = $content -replace "createClientComponentClient\(\)", "createClient()"
            
            # Also handle any remaining Database type imports that might be unused now
            # (Keep Database import if it's used elsewhere in the file)
            
            # Save the file
            Set-Content $file.FullName $content -NoNewline -ErrorAction Stop
            $migratedCount++
        }
        else {
            $skippedCount++
        }
    }
    catch {
        Write-Host "ERROR processing $($file.FullName): $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "Migration Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "Files migrated: $migratedCount" -ForegroundColor Cyan
Write-Host "Files skipped: $skippedCount" -ForegroundColor Gray
Write-Host "Errors: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npm run build' to test the migration" -ForegroundColor White
Write-Host "2. Check for any TypeScript errors" -ForegroundColor White
Write-Host "3. Test the application functionality" -ForegroundColor White
