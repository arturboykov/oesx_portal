Write-Host "Building..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Uploading to server..." -ForegroundColor Cyan
scp -r dist/* oes@10.107.111.66:/home/oes/oesx-portal/dist/
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Fixing permissions..." -ForegroundColor Cyan
ssh oes@10.107.111.66 "chmod -R o+rX /home/oes/oesx-portal/dist"

Write-Host ""
Write-Host "Deployed!" -ForegroundColor Green
Write-Host "http://10.107.111.66:8080/oesx/" -ForegroundColor Yellow
