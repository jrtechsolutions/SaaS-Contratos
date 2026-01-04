# 🧪 Como Testar a API

## Método 1: Usando PowerShell (Windows)

```powershell
# Testar login
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"pauloesjr2@gmail.com","password":"sua-senha-aqui"}'
```

## Método 2: Usando curl (se instalado)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"pauloesjr2@gmail.com\",\"password\":\"sua-senha-aqui\"}"
```

## Método 3: Usando Postman ou Insomnia

1. Abra Postman/Insomnia
2. Crie uma nova requisição POST
3. URL: `http://localhost:3001/api/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "email": "pauloesjr2@gmail.com",
  "password": "sua-senha-aqui"
}
```

## Método 4: Usando o navegador (apenas GET)

Para rotas GET, você pode testar diretamente no navegador:
- `http://localhost:3001/health` (deve retornar status OK)

## Método 5: Script Node.js rápido

Crie um arquivo `test-login.js`:

```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'pauloesjr2@gmail.com',
    password: 'sua-senha-aqui'
  })
});

const data = await response.json();
console.log(data);
```

