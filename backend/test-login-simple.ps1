# Script simples para testar login
# Uso: .\test-login-simple.ps1

$email = "pauloesjr2@gmail.com"
$password = "Paulo1308**"  # Substitua pela senha correta

$body = @{
    email = $email
    password = $password
} | ConvertTo-Json

Write-Host "🧪 Testando login..." -ForegroundColor Cyan
Write-Host "Email: $email" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "✅ SUCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Token recebido: $($response.token.Substring(0, 50))..." -ForegroundColor Cyan
    Write-Host "Usuário: $($response.user.full_name)" -ForegroundColor Cyan
    Write-Host "Email: $($response.user.email)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ ERRO!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorJson = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Erro da API: $($errorJson.error)" -ForegroundColor Red
    }
}

