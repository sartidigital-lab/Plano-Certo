# Plano Certo - Phase 1 Execution Plan (Fundação & Design System)

Este plano descreve as etapas para implementar a nova fundação visual (CSS Vanilla premium) do **Plano Certo**.

## Objetivos da Fase
- Definir os novos design tokens de cores, espaçamento, sombras e desfoque.
- Adicionar suporte a fontes modernas do Google Fonts (Outfit para títulos, Inter para o corpo).
- Implementar a estética Glassmorphism para a barra superior, lateral, painéis de chat e cartões.
- Aplicar micro-animações nas interações do usuário.

## Alterações de Arquivos

### 1. [index.html](file:///c:/Users/User/OneDrive/Área de Trabalho/Plano Certo/index.html)
- Adicionar links do Google Fonts para as fontes **Inter** e **Outfit** no `<head>`.

### 2. [css_plano-certo.css](file:///c:/Users/User/OneDrive/Área de Trabalho/Plano Certo/css_plano-certo.css)
- Atualizar a seção `:root` para redefinir as variáveis de cores usando paletas HSL polidas (azul safira como acento, tons profundos de ardósia para superfícies).
- Adicionar variáveis de glassmorphism:
  ```css
  --glass-bg: rgba(255, 255, 255, 0.45);
  --glass-bg-dark: rgba(15, 23, 42, 0.55);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-dark: rgba(255, 255, 255, 0.05);
  --glass-blur: blur(16px);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
  ```
- Ajustar os seletores `.topbar`, `.sidebar`, `.card`, `.btn` e `.pipeline-card` para utilizar as novas variáveis de vidro e transição.
- Adicionar keyframes para animações de entrada suaves em novos elementos.

### 3. [src/react.css](file:///c:/Users/User/OneDrive/Área de Trabalho/Plano Certo/src/react.css)
- Ajustar os estilos específicos do React (como `.detail-panel`, `.knowledge-card`, `.handoff-card`) para estarem em conformidade com o novo design de vidro e as animações de foco.

---

## Passos de Execução

1. **Importação das Fontes**:
   - Editar [index.html](file:///c:/Users/User/OneDrive/Área de Trabalho/Plano Certo/index.html) para incluir a conexão com o Google Fonts.
2. **Atualização das Variáveis Globais**:
   - Editar `:root` em [css_plano-certo.css](file:///c:/Users/User/OneDrive/Área de Trabalho/Plano Certo/css_plano-certo.css) com os esquemas de cores HSL e a família de fontes `--font-display: 'Outfit', ...` e `--font-body: 'Inter', ...`.
3. **Aplicação do Glassmorphism**:
   - Atualizar a classe `.topbar` e `.sidebar` com `backdrop-filter: var(--glass-blur)` e cor semitransparente.
   - Refatorar a classe `.card` para herdar o visual glassmorphic elegante.
4. **Animações e Micro-interações**:
   - Adicionar regras de transição (`transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`) em botões, links de menu, cartões de oportunidade/pipeline e cards de conversa.
   - Implementar efeitos sutis de escala (`transform: translateY(-2px)`) e brilho de borda no estado `:hover` de cards clicáveis.

---

## Plano de Verificação

### Testes Manuais
- Rodar o servidor de desenvolvimento (`npm run dev`) e inspecionar visualmente:
  1. A legibilidade do painel geral e fontes.
  2. O visual dos cards e da barra lateral no desktop e mobile.
  3. A fluidez das micro-animações ao passar o mouse sobre os cards do kanban e os botões.
- Verificar se a build de produção é gerada com sucesso (`npm run build`) sem erros de compilação CSS.
