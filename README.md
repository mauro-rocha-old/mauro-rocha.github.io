# Mauro Rocha Portfolio

Portfólio pessoal com React + Vite, experiência visual com animações/3D, painel admin e suporte bilíngue (`pt-BR`/`en`).

## Stack

- React 18 + TypeScript
- Vite 6
- React Router DOM 6
- Framer Motion
- Three.js + React Three Fiber + Drei
- Firebase (Auth + Firestore)
- Gemini (`@google/genai`) para chat da página

## Funcionalidades

- Landing page com seções dinâmicas (Hero, Projetos, Sobre, Serviços, Contato)
- Internacionalização básica (`pt-BR` e `en`) via contexto global
- Seletor de idioma no header com bandeiras
- Tela de detalhe de projeto (`/work/:id`)
- Painel admin (`/admin`) com login e CRUD de:
  - projetos
  - serviços
  - conteúdo institucional
- Fallback local quando Firebase não está configurado
- Cache local de dados (`localStorage`) para carregamento inicial
- Chat com IA para responder dúvidas sobre o perfil

## Rotas

- `/` - Home
- `/work/:id` - Detalhe do projeto
- `/admin` - Painel administrativo
- `*` - Not Found

## Requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```bash
API_KEY=your_gemini_api_key

FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_MEASUREMENT_ID=...
```

Observações:
- Sem `API_KEY`, o chat IA responde com mensagem de fallback.
- Sem Firebase válido, a aplicação entra em modo local (sem listeners remotos).

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run preview  # preview local do build
```

## Dados necessários (Firestore)

A aplicação espera as seguintes coleções/documentos:

- `projects/{id}`
- `services/{id}`
- `site_content/main`
- `meta/counters` (para auto incremento de ids numéricos)

### Estrutura `projects/{id}`

```json
{
  "id": 1,
  "title": "Nome do projeto",
  "category": { "pt-BR": "Categoria", "en": "Category" },
  "year": "2026",
  "description": { "pt-BR": "Resumo", "en": "Summary" },
  "fullDescription": { "pt-BR": "Descrição completa", "en": "Full description" },
  "image": "https://...",
  "gallery": ["https://..."],
  "link": "https://...",
  "client": "Cliente",
  "stack": ["React", "TypeScript"]
}
```

### Estrutura `services/{id}`

```json
{
  "id": 1,
  "title": { "pt-BR": "Serviço", "en": "Service" },
  "description": { "pt-BR": "Descrição", "en": "Description" }
}
```

### Estrutura `site_content/main`

```json
{
  "hero": {
    "role": { "pt-BR": "...", "en": "..." },
    "title": { "pt-BR": "...", "en": "..." },
    "subtitle": { "pt-BR": "...", "en": "..." },
    "cta": { "pt-BR": "...", "en": "..." }
  },
  "about": {
    "title": { "pt-BR": "...", "en": "..." },
    "p1": { "pt-BR": "...", "en": "..." },
    "p2": { "pt-BR": "...", "en": "..." },
    "skillsTitle": { "pt-BR": "...", "en": "..." },
    "skills": ["React", "TypeScript"],
    "profileImage": "/images/profile.JPG"
  },
  "contact": {
    "title": { "pt-BR": "...", "en": "..." },
    "email": "contato@...",
    "footerText": { "pt-BR": "...", "en": "..." }
  }
}
```

### Estrutura `meta/counters`

```json
{
  "projects": 10,
  "services": 5
}
```

## Estrutura do projeto

```text
src/
  components/
  context/
  pages/
  services/
  config/
  App.tsx
  index.tsx
```

## Notas

- O estado de idioma começa em `pt-BR`.
- O admin exige autenticação Firebase para operações de escrita.
- O app carrega efeitos pesados (3D/IA) de forma preguiçosa para performance.
