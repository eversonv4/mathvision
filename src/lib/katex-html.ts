const KATEX_VERSAO = '0.16.11';
const KATEX_CSS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSAO}/dist/katex.min.css`;
const KATEX_JS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSAO}/dist/katex.min.js`;

/**
 * Monta um documento HTML autocontido que renderiza uma fórmula com KaTeX
 * dentro de uma WebView (usado nas plataformas nativas, onde não há DOM
 * disponível para o pacote `katex` renderizar direto em React).
 *
 * O KaTeX é carregado via CDN porque o app já depende de rede para falar
 * com a API; isso evita ter que empacotar as fontes do KaTeX no bundle.
 */
export function montarHtmlKatex(latex: string, opcoes: { corTexto: string; tamanhoFonte?: number }): string {
  const latexSeguro = JSON.stringify(latex ?? '');
  const tamanho = opcoes.tamanhoFonte ?? 20;

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="${KATEX_CSS}">
  <script src="${KATEX_JS}"></script>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: transparent;
      display: flex;
      justify-content: center;
    }
    #raiz {
      color: ${opcoes.corTexto};
      font-size: ${tamanho}px;
      padding: 2px 4px;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
    }
    .katex-error { color: #e5484d; }
  </style>
</head>
<body>
  <div id="raiz"></div>
  <script>
    function renderizar() {
      try {
        katex.render(${latexSeguro}, document.getElementById('raiz'), {
          throwOnError: false,
          displayMode: true,
        });
      } catch (e) {
        document.getElementById('raiz').innerText = ${latexSeguro};
      }
      var altura = document.body.scrollHeight;
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(String(altura));
    }
    if (window.katex) {
      renderizar();
    } else {
      document.querySelector('script[src*="katex.min.js"]').addEventListener('load', renderizar);
    }
  </script>
</body>
</html>`;
}
