# Study Tracker - Checklist de Programação

Uma aplicação web progressiva (PWA) para acompanhar seu progresso nos cursos de programação. Funciona 100% offline com salvamento automático de dados.

## Características

- **Offline First**: Funciona completamente offline com Service Worker
- **Sincronização Automática**: Salva progresso automaticamente em cache
- **3 Caminhos de Aprendizado**:
  - Cloud Computing (5-7 meses)
  - Ciência de Dados (6-8 meses)
  - Full-Stack Cloud (9-12 meses)
- **Links Diretos**: Acesso rápido ao YouTube e sites dos cursos
- **Progresso Visual**: Acompanhe seu progresso em tempo real
- **Exportar Dados**: Exporte seu progresso em JSON
- **Design Responsivo**: Funciona em qualquer dispositivo
- **Tema Escuro**: Suporte automático para modo escuro
- **Atalhos de Teclado**:
  - `Ctrl+S` / `Cmd+S`: Exportar progresso
  - `Ctrl+Shift+C` / `Cmd+Shift+C`: Próxima aba

## Como Usar

### 1. Opção Local (Recomendado para Desenvolvimento)

```bash
# Clone ou extraia os arquivos
cd study-tracker

# Inicie um servidor local (Python 3)
python -m http.server 8000

# Ou com Python 2
python -m SimpleHTTPServer 8000

# Acesse em seu navegador
http://localhost:8000
```

### 2. Opção com Live Server (VS Code)

1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

### 3. Deploy em Produção

#### Opção A: GitHub Pages

1. Crie um repositório no GitHub
2. Coloque os arquivos na raiz (ou em uma pasta `docs/`)
3. Vá para Settings → Pages
4. Selecione a branch principal
5. Acesse `https://seu-usuario.github.io/seu-repositorio`

#### Opção B: Vercel

```bash
npm i -g vercel
vercel
```

#### Opção C: Netlify

1. Conecte seu repositório no Netlify
2. Build command: (deixe vazio)
3. Publish directory: (raiz do projeto)

#### Opção D: Railway

1. Conecte o repositório no Railway
2. O Railway detecta `nixpacks.toml` e usa o `start.sh` para servir os arquivos estáticos
3. A aplicação escuta na porta definida por `$PORT` automaticamente

#### Opção E: Seu Próprio Servidor

```bash
# Copie os arquivos para seu servidor
scp -r study-tracker/* user@server:/var/www/html/

# Configure o servidor para servir como HTTPS (obrigatório para PWA)
# Nginx example:
server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    ssl_certificate /path/to/cert.crt;
    ssl_certificate_key /path/to/key.key;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Estrutura de Arquivos

```
study-tracker/
├── index.html          # Página principal com toda a estrutura HTML
├── style.css           # Estilos da aplicação
├── app.js              # Lógica da aplicação (localStorage, eventos)
├── sw.js               # Service Worker (offline, cache)
├── manifest.json       # Configuração PWA
├── start.sh            # Script de inicialização (Railway/Nixpacks)
├── nixpacks.toml       # Configuração de build/deploy do Railway
└── README.md           # Este arquivo
```

## Funcionalidades Detalhadas

### Salvamento de Dados

Os dados são salvos em 3 camadas:

1. **localStorage**: Armazenamento principal no navegador
2. **Service Worker Cache**: Sincronização automática
3. **Exportação JSON**: Backup manual

```javascript
// Dados salvos no localStorage
{
  "cloud-logic": true,
  "cloud-go": false,
  "cloud-git": true,
  // ... mais tarefas
}
```

### Service Worker

- **Cache-First** para assets estáticos (.css, .js, .html)
- **Network-First** para dados
- **Atualização automática** quando novos arquivos estão disponíveis
- **Sincronização em background** (se suportado)

### Progresso em Tempo Real

Acompanhe:
- Porcentagem de conclusão geral
- Tarefas completas vs pendentes
- Progresso por fase (Fase 1, 2, 3, etc)

## Requisitos de Segurança para PWA

Para instalar como app, seu servidor DEVE servir via **HTTPS**.

Localmente, pode usar `http://localhost:8000`.

Em produção:
- Use certificados SSL válidos
- Configure CORS se necessário
- Adicione headers de segurança

## Personalizações

### Adicionar Novos Cursos

1. Abra `index.html`
2. Encontre a fase desejada (ex: `<details class="phase-section">`)
3. Copie um `<div class="course-item">` existente
4. Modifique o `data-id`, nome do curso e links

```html
<div class="course-item">
    <label class="checkbox-wrapper">
        <input type="checkbox" class="task-checkbox" data-id="seu-novo-id" data-phase="cloud-1">
        <span class="checkbox-custom"></span>
        <span class="course-info">
            <span class="course-name">Nome do Seu Curso</span>
            <span class="course-instructor">Instrutor | Horas</span>
        </span>
    </label>
    <div class="course-links">
        <a href="link-youtube" target="_blank" class="link-btn youtube">YouTube</a>
        <a href="link-site" target="_blank" class="link-btn website">Site</a>
    </div>
</div>
```

### Mudar Cores

Edite as CSS variables no `style.css`:

```css
:root {
    --primary-color: #1e88e5;    /* Azul primário */
    --primary-dark: #1565c0;     /* Azul escuro */
    --accent-color: #2e7d32;     /* Verde */
    --danger-color: #c62828;     /* Vermelho */
    /* ... mais cores */
}
```

## Suporte Offline

A aplicação oferece suporte completo offline:

1. **Primeira visita**: Downloads todos os assets
2. **Sem internet**: Carrega da cache automaticamente
3. **Salvamento**: Progresso sempre sincronizado localmente
4. **Sincronização**: Quando voltar online, dados são atualizados

## Compatibilidade de Navegadores

| Navegador | Suporte |
|-----------|---------|
| Chrome/Edge | Completo |
| Firefox | Completo |
| Safari | Parcial (PWA) |
| Samsung Internet | Completo |
| Opera | Completo |

## Troubleshooting

### Service Worker não está registrando

```javascript
// Abra o console (F12) e verifique
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log(registrations);
});
```

### Cache muito grande

Limpe o cache:
```javascript
caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
});
```

### Dados não estão sincronizando

1. Verifique se localStorage não está cheio
2. Limpe dados: `localStorage.clear()`
3. Recarregue a página

### App não instala

- Servidor DEVE ser HTTPS em produção
- Manifest.json deve estar válido
- Service Worker deve estar ativo

## Performance

- **Tamanho Total**: ~50KB (descomprimido)
- **Tempo de Carregamento**: <1s (com cache)
- **Tempo Offline**: ✓ (funciona indefinidamente)
- **Uso de Memória**: ~10-20MB

## Segurança

- Nenhum dado é enviado para servidores externos
- Tudo é armazenado localmente no seu navegador
- Conforme GDPR - sem rastreamento
- Código fonte aberto para auditoria

## Desenvolvido Para

Este app foi criado especialmente para o checklist de cursos de programação:
- Python (Gustavo Guanabara)
- Go (AprendaGo)
- Git e GitHub (Tiago Matos)
- Linux (Bom Som Treinamentos)
- AWS (Dev Dojo)
- Docker (Tec Educa)
- Kubernetes (Lucas Santo)
- Terraform (Gasparotto)
- E muitos mais...

## Licença

Público - Use livremente!

## Contribuições

Quer adicionar recursos? Sugira ideias ou envie pull requests!

### Ideias Futuras

- [ ] Integração com GitHub API
- [ ] Sincronização em nuvem (Firebase)
- [ ] Notificações de lembretes
- [ ] Gráficos de progresso avançados
- [ ] Sistema de metas e deadlines
- [ ] Integração com Discord
- [ ] Modo dark automático

## Suporte

Se tiver problemas:
1. Verifique o console (F12 → Console)
2. Tente limpar cache: `localStorage.clear()`
3. Recarregue a página
4. Desinstale e reinstale o app

---

**Última Atualização**: Junho 2026
**Versão**: 1.0.0
**Status**: Estável para produção

Boa sorte em seus estudos!
