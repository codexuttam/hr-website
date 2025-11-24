# Move components folder from app/components to root/components
# Run this script from the project root directory

Write-Host "Moving components folder from app/components to root/components..." -ForegroundColor Green

# Check if app/components exists
if (Test-Path "app\components") {
    # Create components directory at root if it doesn't exist
    if (-not (Test-Path "components")) {
        New-Item -ItemType Directory -Path "components" | Out-Null
        Write-Host "Created components directory at root" -ForegroundColor Yellow
    }

    # Move all contents from app/components to root/components
    Write-Host "Moving files and folders..." -ForegroundColor Yellow
    Get-ChildItem -Path "app\components" | ForEach-Object {
        $destination = "components\$($_.Name)"
        if (Test-Path $destination) {
            Write-Host "Skipping $($_.Name) - already exists in destination" -ForegroundColor Red
        } else {
            Move-Item -Path $_.FullName -Destination "components\" -Force
            Write-Host "Moved: $($_.Name)" -ForegroundColor Cyan
        }
    }

    # Remove empty app/components directory
    if ((Get-ChildItem "app\components" | Measure-Object).Count -eq 0) {
        Remove-Item "app\components" -Force
        Write-Host "Removed empty app\components directory" -ForegroundColor Green
    }

    Write-Host "`nComponents moved successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Update all import paths from '@/app/components' to '@/components'" -ForegroundColor White
    Write-Host "2. Update all import paths from '../components' to '@/components'" -ForegroundColor White
    Write-Host "3. Update all import paths from './components' to '@/components'" -ForegroundColor White
} else {
    Write-Host "Error: app\components directory not found!" -ForegroundColor Red
}
