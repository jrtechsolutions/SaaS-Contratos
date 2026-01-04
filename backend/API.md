# Documentação da API

## Base URL

```
http://localhost:3001/api
```

## Autenticação

A maioria das rotas requer autenticação via JWT. Inclua o token no header:

```
Authorization: Bearer <seu-token>
```

---

## 🔐 Autenticação

### POST /auth/login

Autentica um usuário admin.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "full_name": "Administrador"
  }
}
```

### POST /auth/register

Registra um novo usuário (apenas desenvolvimento).

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "senha123",
  "full_name": "Administrador"
}
```

### GET /auth/me

Retorna dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

---

## 📋 Propostas

### GET /propostas

Lista todas as propostas.

**Query Params:**
- `status` (opcional) - Filtrar por status: `rascunho`, `enviada`, `aceita`, `cancelada`
- `search` (opcional) - Buscar por nome ou email do cliente

**Response (200):**
```json
[
  {
    "id": "uuid",
    "cliente_nome": "João Silva",
    "cliente_email": "joao@example.com",
    "valor_total": 45000.00,
    "status": "enviada",
    "created_at": "2024-12-18T10:00:00Z",
    "modelo_contrato": {
      "id": "uuid",
      "nome": "Contrato de Prestação de Serviços"
    }
  }
]
```

### GET /propostas/:id

Busca uma proposta específica.

**Response (200):**
```json
{
  "id": "uuid",
  "cliente_nome": "João Silva",
  "cliente_email": "joao@example.com",
  "cliente_telefone": "(11) 99999-9999",
  "cliente_empresa": "Tech Corp",
  "cliente_cnpj": "12.345.678/0001-90",
  "servicos": ["Desenvolvimento Web", "App Mobile"],
  "servico_personalizado": "Integração com APIs",
  "valor_total": 45000.00,
  "condicoes_pagamento": "50% na assinatura, 50% na entrega",
  "prazo_execucao": "90 dias",
  "data_inicio": "2025-01-01",
  "data_entrega": "2025-04-01",
  "observacoes": "Observações adicionais",
  "status": "enviada",
  "modelo_contrato_id": "uuid",
  "created_at": "2024-12-18T10:00:00Z"
}
```

### POST /propostas

Cria uma nova proposta.

**Request:**
```json
{
  "cliente_nome": "João Silva",
  "cliente_email": "joao@example.com",
  "cliente_telefone": "(11) 99999-9999",
  "cliente_empresa": "Tech Corp",
  "cliente_cnpj": "12.345.678/0001-90",
  "servicos": ["Desenvolvimento Web", "App Mobile"],
  "servico_personalizado": "Integração com APIs",
  "valor_total": 45000.00,
  "condicoes_pagamento": "50% na assinatura, 50% na entrega",
  "prazo_execucao": "90 dias",
  "data_inicio": "2025-01-01",
  "data_entrega": "2025-04-01",
  "observacoes": "Observações adicionais",
  "modelo_contrato_id": "uuid",
  "status": "rascunho"
}
```

**Campos obrigatórios:** `cliente_nome`, `cliente_email`, `valor_total`

### PUT /propostas/:id

Atualiza uma proposta.

**Request:** (mesmos campos do POST, todos opcionais)

**Regras:**
- Propostas com status `aceita` ou `cancelada` não podem ser editadas

### DELETE /propostas/:id

Exclui uma proposta.

**Regras:**
- Propostas com status `aceita` não podem ser excluídas

---

## 📄 Modelos de Contrato

### GET /modelos

Lista todos os modelos de contrato.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Contrato de Prestação de Serviços",
    "template_texto": "CONTRATO...",
    "variaveis": [
      {"key": "{{nome_cliente}}", "label": "Nome do Cliente"}
    ],
    "created_at": "2024-12-18T10:00:00Z"
  }
]
```

### GET /modelos/:id

Busca um modelo específico.

### POST /modelos

Cria um novo modelo.

**Request:**
```json
{
  "nome": "Contrato de Suporte Mensal",
  "template_texto": "CONTRATO...",
  "variaveis": [
    {"key": "{{nome_cliente}}", "label": "Nome do Cliente"}
  ]
}
```

### PUT /modelos/:id

Atualiza um modelo.

### DELETE /modelos/:id

Exclui um modelo.

**Regras:**
- Modelos vinculados a propostas não podem ser excluídos

---

## 📝 Contratos

### GET /contratos

Lista todos os contratos.

**Query Params:**
- `status` (opcional) - Filtrar por status: `enviado`, `visualizado`, `assinado`
- `search` (opcional) - Buscar por nome ou email do cliente

**Response (200):**
```json
[
  {
    "id": "uuid",
    "status": "assinado",
    "data_assinatura": "2024-12-18T10:00:00Z",
    "proposta": {
      "id": "uuid",
      "cliente_nome": "João Silva",
      "valor_total": 45000.00
    }
  }
]
```

### GET /contratos/:id

Busca um contrato específico com todos os dados da proposta relacionada.

### PUT /contratos/:id/status

Atualiza o status de um contrato.

**Request:**
```json
{
  "status": "visualizado"
}
```

---

## 🌐 Rotas Públicas (Não requerem autenticação)

### GET /public/proposta/:id

Retorna dados públicos de uma proposta para visualização do cliente.

**Response (200):**
```json
{
  "id": "uuid",
  "cliente_nome": "João Silva",
  "cliente_email": "joao@example.com",
  "servicos": ["Desenvolvimento Web"],
  "valor_total": 45000.00,
  "status": "enviada"
}
```

**Nota:** Propostas com status `rascunho` retornam 404.

### POST /public/proposta/:id/aceitar

Aceita uma proposta e gera o contrato automaticamente.

**Response (201):**
```json
{
  "message": "Proposta aceita e contrato gerado com sucesso",
  "contrato_id": "uuid",
  "proposta": { ... }
}
```

**Regras:**
- Apenas propostas com status `enviada` podem ser aceitas
- Deve ter um `modelo_contrato_id` associado

### GET /public/contrato/:id

Retorna dados públicos de um contrato para visualização e assinatura.

**Response (200):**
```json
{
  "id": "uuid",
  "texto_contrato": "CONTRATO DE PRESTAÇÃO...",
  "status": "enviado",
  "proposta": {
    "cliente_nome": "João Silva",
    "valor_total": 45000.00
  }
}
```

### POST /public/contrato/:id/assinar

Assina um contrato digitalmente.

**Request:**
```json
{
  "assinatura_cliente": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response (200):**
```json
{
  "message": "Contrato assinado com sucesso",
  "contrato": {
    "id": "uuid",
    "status": "assinado",
    "data_assinatura": "2024-12-18T10:00:00Z"
  }
}
```

**Regras:**
- Apenas contratos com status `enviado` ou `visualizado` podem ser assinados
- A proposta relacionada deve estar com status `aceita`

---

## 📊 Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação ou regra de negócio
- `401` - Não autenticado
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

---

## 🔄 Fluxo Completo

1. **Admin cria proposta** → `POST /propostas` (status: `rascunho`)
2. **Admin envia proposta** → `PUT /propostas/:id` (status: `enviada`)
3. **Cliente visualiza** → `GET /public/proposta/:id`
4. **Cliente aceita** → `POST /public/proposta/:id/aceitar` (gera contrato)
5. **Cliente visualiza contrato** → `GET /public/contrato/:id`
6. **Cliente assina** → `POST /public/contrato/:id/assinar`

