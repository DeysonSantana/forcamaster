# 🪓 ForcaMaster Pro

<p align="center">
  <img src="assets/icons/icon-192x192.png" alt="ForcaMaster Pro Logo" width="110" style="border-radius: 22px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);" />
</p>

<p align="center">
  <strong>O clássico Jogo da Forca reinventado: 100% Offline-First, áudio procedural sintetizado via Web Audio API, ultra-responsivo, com suporte pleno à língua portuguesa, login com Google Firebase, salas multiplayer em grupo em tempo real e inteligência artificial generativa.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PWA-100%25_Offline--First-10b981?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/Multiplayer-Salas_com_PIN-f72585?style=for-the-badge" alt="Multiplayer" />
  <img src="https://img.shields.io/badge/Auth-Google_Firebase-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Auth" />
  <img src="https://img.shields.io/badge/Audio-Web_Audio_API_(0kb)-00f2fe?style=for-the-badge&logo=webcomponentsdotorg&logoColor=white" alt="Web Audio API" />
  <img src="https://img.shields.io/badge/A11y-WCAG_2.1_AA-10b981?style=for-the-badge" alt="A11y" />
  <img src="https://img.shields.io/badge/AI-Google_Gemini-3b82f6?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/License-MIT-gray?style=for-the-badge" alt="MIT License" />
</p>

---

## 🌟 Visão Geral

O **ForcaMaster Pro** é uma aplicação web progressiva (PWA) de alto padrão de engenharia e refinamento de UI/UX, inspirada na arquitetura descentralizada do [QuizMaster](https://deysonsantana.github.io/quizMaster/).

O projeto opera em **Dual-Mode**: funciona com excelência **100% Offline** (no avião, metrô ou salas sem internet) e se conecta em **Tempo Real** à nuvem quando conectado via **Google Firebase (Auth + Cloud Firestore)** para autenticação e partidas multijogador simultâneas.

---

## ✨ Principais Funcionalidades

### 1. 👥 Salas Multiplayer em Grupo em Tempo Real (Estilo Kahoot / Gartic)
- **Criação Instantânea de Salas:** O anfitrião (Host) clica em `👥 Jogar em Grupo` e gera um **PIN de 6 dígitos** (ex: `849201`), link direto de convite (`#room=PIN`) e QR Code nativo em Canvas.
- **Lobby ao Vivo:** Amigos entram pelo PIN ou escaneiam o QR Code e aparecem instantaneamente na lista com seus avatares.
- **Sincronização Cloud Firestore (`onSnapshot`):** Todos os participantes jogam juntos no mesmo tabuleiro. Quando qualquer amigo arrisca uma letra, os acertos, erros e pontuações são revelados ao vivo em todos os dispositivos simultaneamente.
- **Pódio Competitivo:** Ao final da rodada, a aplicação exibe a classificação final com medalhas de ouro, prata e bronze (🥇🥈🥉).

### 2. 🔐 Autenticação Google via Firebase
- **Login Social em 1 Clique:** Autenticação oficial com Google (`GoogleAuthProvider` + `signInWithPopup`).
- **Perfil & Avatar Sincronizados:** Exibição da foto e nome do usuário no cabeçalho e histórico de partidas.
- **Arquitetura Dual-Mode:** Se a conexão cair ou o usuário preferir jogar como convidado anônimo, a aplicação opera com fallback local transparente sem travar o jogo.
- **Configuração Personalizada (BYOC):** Painel que permite utilizar seu próprio projeto Firebase com suas credenciais.

### 3. 🇧🇷 Suporte Integral ao Português (Acentos & Diacríticos)
- **Acentuação Gráfica Real:** Palavras como `PÃO DE AÇÚCAR`, `CORAÇÃO`, `ÁGUA-DE-COLÔNIA` e `PARALELEPÍPEDO`.
- **Adivinhação Transparente:**
  - Digitar a letra **"A"** descobre automaticamente `A`, `Á`, `À`, `Â` e `Ã`.
  - Digitar a letra **"C"** ou **"Ç"** descobre `C` e `Ç` com sincronização visual simultânea no teclado.
- **Caracteres Especiais Automáticos:** Hífens (`-`), apóstrofos (`'`), espaços e pontuações são exibidos abertos como separadores, sem contar erros.
- **Modo 2 Jogadores Local:** Digite uma palavra secreta no mesmo aparelho para outra pessoa adivinhar imediatamente.

### 4. 📱 Responsividade Extrema (Mobile-First & Fluid Design)
- **Viewport Dinâmico (`100dvh`):** Elimina o salto de tela causado por barras de navegação dinâmicas em navegadores móveis (Safari e Chrome).
- **Safe Area Insets:** Compatibilidade total com entalhes (*notches*) de iPhone e Android.
- **Quebra Inteligente por Palavras (`.word-group`):** Letras nunca quebram ao meio em telas estreitas (320px a 390px).
- **Suporte a Modo Paisagem (*Landscape*):** Modais e tabuleiro escalonados fluidamente para telas deitadas.
- **Zero Tap Delay:** Diretiva `touch-action: manipulation` para resposta tátil instantânea no toque.

### 5. 🎵 Síntese Sonora Procedural Nativa (Web Audio API)
- **0kb de Áudio Externo:** Sem requisições de arquivos `.mp3` ou `.wav`. Efeitos sintetizados em tempo de execução via osciladores matemáticos:
  - Tique suave ao clicar ou digitar teclas.
  - Acordes ascendentes nos acertos.
  - Buzzer atenuado nos erros.
  - Fanfarra triunfante na vitória e drone dramático na derrota.

### 6. 🤖 Desafios Infinitos com IA Generativa (Google Gemini)
- Arquitetura **BYOK** (*Bring Your Own Key*) conectada à API do Google Gemini.
- Gere enigmas customizados e dicas inteligentes sobre qualquer assunto (*ex: "Física Quântica", "Filmes dos Anos 80", "Biologia Marinha"*).

### 7. 🎨 5 Temas Visuais Semânticos
Alternância instantânea de temas com persistência no `localStorage` e sincronização da cor da barra de status móvel (`theme-color`):
- 🔴 **Nintendo Arcade:** Vermelho icônico, branco e cinza escuro.
- ⚡ **Dark Neon:** Ciano vibrante com fundo escuro profundo e acento verde neon.
- 🟣 **Cyberpunk:** Magenta vibrante e roxo neon sobre preto.
- 🟢 **Emerald Matrix:** Tons de esmeralda e verde escuro.
- 🌑 **Midnight AMOLED:** Preto absoluto (`#000000`) para máxima economia de bateria em telas OLED.

### 8. 🏆 Painel de Estatísticas & Backup Físico
- Histórico completo: vitórias, derrotas, win rate, sequência atual, melhor sequência e pontuação total.
- **Portabilidade de Dados:** Exportação e importação de backups em formato `.json`.

---

## 🗺️ Arquitetura de Módulos

```
app-forca/
├── index.html                   # Interface semântica acessível (WCAG 2.1 AA)
├── style.css                    # Design System fluido, temas e layout ultra-responsivo
├── manifest.json                # Manifesto PWA completo para instalação nativa
├── service-worker.js            # Cache-First resiliente e compatível com GitHub Pages
├── js/
│   ├── app.js                   # Orquestrador SPA central e ciclo de vida
│   ├── firebaseConfig.js        # SDK Firebase v10 modular e conexão em nuvem
│   ├── authManager.js           # Gerenciador de contas e Google Sign-In
│   ├── roomManager.js           # Salas multiplayer com PIN e Firestore em tempo real
│   ├── audio.js                 # Motor de síntese procedural (Web Audio API)
│   ├── themeManager.js          # Gestão dinâmica dos 5 temas CSS
│   ├── words.js                 # Vocabulário oficial pt-BR e normalização de acentos
│   ├── gameEngine.js            # Regras de negócio, erros, slots e pontuação
│   ├── keyboard.js              # Teclado ergonômico Fitts/Jakob com feedback RGB
│   ├── statsManager.js          # Estatísticas, histórico e backup JSON
│   ├── shareManager.js          # Desafios remotos via Hash (#challenge) e QR Code Canvas
│   └── aiService.js             # Integração com a API do Google Gemini (BYOK)
└── assets/icons/                # Ícones em alta resolução para PWA
```

---

## 🚀 Como Executar Localmente

Como a aplicação utiliza **ES6 Modules**, execute-a através de um servidor local estático simples:

```bash
# Usando npx serve
npx serve .

# Ou usando Python 3
python -m http.server 8000
```

Acesse no navegador em `http://localhost:8000`.

---

## 🌐 Deploy no GitHub Pages

1. Acesse o repositório no GitHub: **Settings > Pages**.
2. Em **Branch**, selecione `main` e a pasta `/ (root)`.
3. Clique em **Save**.
4. Sua aplicação estará disponível e instalável como PWA em tempo real!

---

## 📄 Licença

Distribuído sob a licença **MIT**.

---

<p align="center">
  Desenvolvido com excelência técnica por <strong>Deyson Santana</strong>.
</p>
