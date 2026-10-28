import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { checkSources, fetchSource } from '../lib/sources.mjs';
import { collectImages } from '../lib/media.mjs';
import { fileURLToPath } from 'node:url';
const work = 'https://gamefaqs.gamespot.com/n64/197771-the-legend-of-zelda-ocarina-of-time/faqs/20240';
const virtues = 'https://www.vatican.va/archive/ENG0015/__P65.HTM';
const gs = 'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651207_gaudium-et-spes_po.html';
// Pages that show each image; the media pipeline downloads and checks the files into examples/media.
const images = [
  { kind: 'character', page: 'https://zeldawiki.wiki/wiki/File:OoT_Link_and_Navi_Artwork.png', url: '', alt: 'Link, de túnica e gorro verdes, sentado num muro de tijolos tocando ocarina, com a fada Navi ao lado.', caption: 'Link e Navi em Ocarina of Time.', credit: 'Arte oficial da Nintendo, via Zelda Wiki.' },
  { kind: 'character', page: 'https://zeldawiki.wiki/wiki/File:OoT_Great_Deku_Tree_Artwork.png', url: '', alt: 'Uma árvore enorme e antiga, com rosto de olhos fechados e bigode formado no tronco.', caption: 'A Great Deku Tree em Ocarina of Time.', credit: 'Arte oficial da Nintendo, via Zelda Wiki.' },
  { kind: 'character', page: 'https://zeldawiki.wiki/wiki/File:OoT_Sheik_Artwork.png', url: '', alt: 'Sheik, de roupa azul justa, com o rosto parcialmente coberto por faixas e o símbolo de um olho no peito.', caption: 'Sheik em Ocarina of Time.', credit: 'Arte oficial da Nintendo, via Zelda Wiki.' },
  { kind: 'artwork', page: 'https://commons.wikimedia.org/wiki/File:Christ_Taking_Leave_of_the_Apostles.jpg', url: '', alt: 'Pintura sobre fundo dourado: Cristo sentado fala a um grupo de apóstolos reunidos à sua volta.', caption: 'Cristo despede-se dos apóstolos, painel da Maestà (1308–1311).', credit: 'Duccio di Buoninsegna, Museo dell’Opera del Duomo, Siena. Domínio público, via Wikimedia Commons.' },
  {kind: "scene",page: "https://zeldawiki.wiki/wiki/File:OoT_Great_Deku_Tree%27s_Meadow.png",url: "",alt: "Captura do jogo: Link, pequeno, diante do tronco enorme da Great Deku Tree, numa clareira da floresta.",caption: "A clareira da Great Deku Tree (Nintendo 64).",credit: "Captura de tela de Ocarina of Time (Nintendo), via Zelda Wiki."},
  {kind: "scene",page: "https://zeldawiki.wiki/wiki/File:OoT_Bolero_of_Fire.png",url: "",alt: "Captura do jogo: Link e Sheik frente a frente numa ponte de madeira, sob luz avermelhada, dentro da cratera.",caption: "Link e Sheik na Cratera da Montanha da Morte (Nintendo 64).",credit: "Captura de tela de Ocarina of Time (Nintendo), via Zelda Wiki."}
];
const ref = (kind, label, locator, url, excerpt, language, note) => ({ kind, label, locator, url, excerpt, language, note });
const base = {
  title: 'Zelda: Ocarina of Time',
  scope: 'Nintendo 64 · diálogos em inglês · chamado inicial e encontro com Sheik na Cratera da Montanha da Morte · contém spoilers',
  introduction: 'Separe um pequeno tempo, abra as fontes e observe duas cenas. As perguntas abaixo são um começo: registre o que aproxima os textos e o que resiste à comparação.',
  evidenceNote: 'Exemplo preparado para este aplicativo em 27/10/2026. Os diálogos foram encontrados em uma transcrição de terceiros no GameFAQs; confira no jogo a edição e a localização. Bíblia: NABRE, edição católica em inglês publicada pela USCCB. Catecismo: edição em inglês no Vaticano. Documento conciliar: versão portuguesa oficial. As marcas de localização registram a tentativa automática feita na preparação; não certificam a pertinência da analogia nem são uma verificação contínua.',
  items: [
    {
      title: 'Um chamado na floresta',
      scene: 'Paráfrase da cena: no começo do jogo, a Great Deku Tree comunica que foi amaldiçoada, pede a Link que enfrente a tarefa e solicita que Navi o acompanhe. Link é convidado a responder ao pedido antes de conhecer todo o caminho.',
      sceneLocator: 'Ocarina of Time, N64, inglês · conversa com a Great Deku Tree antes da primeira masmorra.',
      quotation: 'Dost thou have courage enough to undertake this task?',
      quotationReference: work,
      question: 'O que você observa na forma do pedido e na resposta de Link? Que critérios usaria para avaliar a ação dele?',
      references: [
        ref('work', 'Ocarina of Time — transcrição dos diálogos', 'Great Deku Tree · início da jornada', work, '', 'Inglês · Nintendo 64; transcrição de fã', 'Fonte secundária para localizar a fala. Busque a frase no texto e confira-a na sua edição do jogo.'),
        ref('bible', 'Evangelho segundo São João', 'Jo 16,25–33, especialmente 16,33', 'https://bible.usccb.org/bible/john/16', 'In the world you will have trouble, but take courage, I have conquered the world.', 'Inglês · NABRE (USCCB)', 'Leia a fala de Jesus aos discípulos no seu contexto. O trecho em inglês é literal; nenhuma tradução portuguesa é apresentada como citação oficial.'),
        ref('catechism', 'Catecismo da Igreja Católica', 'CIC §§1805–1808; atenção ao §1808', virtues, 'Fortitude is the moral virtue that ensures firmness in difficulties and constancy in the pursuit of the good.', 'Inglês · edição do Vaticano', 'Leia também os parágrafos vizinhos. O trecho serve para localizar a passagem; sua aplicação à obra exige reflexão.'),
        ref('church', 'Francisco — catequese sobre a fortaleza', 'Audiência geral, 10 de abril de 2024 · Vícios e virtudes, 14', 'https://www.vatican.va/content/francesco/pt/audiences/2024/documents/20240410-udienza-generale.html', '', 'Português · catequese em audiência geral', 'Uma catequese papal tem gênero próprio; não é uma nova definição dogmática. Confira os exemplos e as distinções feitos no texto.')
      ],
      hints: ['Releia o diálogo e anote o que Link sabe, o que ainda não sabe e de quem recebe ajuda.', 'No CIC §1808, procure as expressões que indicam o fim de uma ação. Depois leia Jo 16,25–33 sem retirar o último versículo do contexto.'],
      explanation: '',
      limits: 'Quais aspectos da ação de Link encontram apoio nessas fontes e quais exigiriam outras distinções?',
      practice: 'Faça duas colunas: fatos da cena e observações sobre as leituras. Escreva uma hipótese só depois de preencher as duas.'
    },
    {
      title: 'Uma conversa na cratera',
      scene: 'Paráfrase da cena: ao ensinar o Bolero of Fire, Sheik fala do crescimento da amizade ao longo do tempo. A conversa aparece na etapa adulta da jornada, na Cratera da Montanha da Morte.',
      sceneLocator: 'Ocarina of Time, N64, inglês · encontro com Sheik na Death Mountain Crater, aprendizado do Bolero of Fire.',
      quotation: 'It is something that grows over time... a true friendship.',
      quotationReference: work,
      question: 'Como a fala de Sheik descreve uma relação que amadurece? Depois das leituras, que aspectos você gostaria de examinar melhor?',
      references: [
        ref('work', 'Ocarina of Time — transcrição dos diálogos', 'Sheik · Bolero of Fire', work, '', 'Inglês · Nintendo 64; transcrição de fã', 'Fonte secundária. A fala foi localizada na transcrição; confira no jogo o contexto e a versão.'),
        ref('bible', 'Evangelho segundo São João', 'Jo 15,9–17, especialmente 15,12–15', 'https://bible.usccb.org/bible/john/15', 'This is my commandment: love one another as I love you.', 'Inglês · NABRE (USCCB)', 'Observe quem fala, a quem se dirige e como o trecho se liga à imagem da videira no começo do capítulo.'),
        ref('catechism', 'Catecismo da Igreja Católica', 'CIC §1804 · leia também §§1805–1809', virtues, '', 'Inglês · edição do Vaticano', 'Leia a definição de virtude humana e a relação entre hábitos, atos e vida moral.'),
        ref('church', 'Gaudium et spes — constituição pastoral', 'Concílio Vaticano II, 7 de dezembro de 1965 · §24', gs, 'não se pode encontrar plenamente a não ser no sincero dom de si mesmo', 'Português · versão oficial do Vaticano', 'Leia todo o §24, sobre a natureza comunitária da vocação humana. Não trate uma frase isolada como conclusão sobre o jogo.')
      ],
      hints: ['Na fala de Sheik, observe a relação entre tempo, crescimento e ação. Que exemplos da própria narrativa você consegue localizar?', 'Leia Jo 15,9–17 por inteiro. Depois pergunte que informações o §24 de Gaudium et spes acrescenta à sua investigação.'],
      explanation: '',
      limits: 'Uma semelhança de linguagem já seria suficiente? O que muda quando você considera o contexto completo de cada texto?',
      practice: 'Registre uma aproximação possível e uma diferença importante, indicando a frase ou seção que apoia cada observação.'
    }
  ],
  closingQuestions: ['Qual hipótese você formulou depois de ler as fontes?', 'Qual passagem oferece o apoio mais forte? Qual detalhe da obra limita a sua leitura?', 'Que dúvida você levaria a uma próxima leitura ou conversa de formação?'],
  limitations: ['Este exemplo recorta duas cenas; não oferece uma interpretação de todo o jogo.', 'A transcrição de diálogos é de terceiros, não uma publicação oficial da Nintendo. A redação pode variar por edição e localização.', 'As leituras bíblicas estão em inglês. Você pode comparar a referência com a sua Bíblia católica em português, identificando a tradução.', 'O estudo não apresenta prova de intenção cristã ou católica dos criadores.']
};
const checked = await checkSources(base, { onProgress: console.log, fetcher: async (url, signal) => {
  // Prepared examples may use the actual research snapshot consulted at authoring time.
  // The running application never calls Firecrawl or depends on this cache.
  if (url === work) {
    try {
      const data = JSON.parse(await readFile(new URL('../.firecrawl/search-zelda.json', import.meta.url), 'utf8'));
      const source = data.data.web.find(x => x.url === work);
      if (source?.markdown) return { url, text: source.markdown, preparationSnapshot: true };
    } catch {}
  }
  if (url === 'https://bible.usccb.org/bible/john/15') {
    try { return { url, text: await readFile(new URL('../.firecrawl/john-15.md', import.meta.url), 'utf8'), preparationSnapshot: true }; } catch {}
  }
  return fetchSource(url, signal);
}});
Object.assign(checked, await collectImages({ images }, { mediaDir: fileURLToPath(new URL('../examples/media/', import.meta.url)), onProgress: console.log }));
checked.presentation = {
  html: "<section><h2>Os primeiros fragmentos.</h2><p>Leia os textos como um pequeno conjunto de pistas. Não é preciso encontrar um par para cada cena.</p><figure data-lumen-image=\"3\" class=\"painting\"></figure><div class=\"fragments\"><article class=\"fragment\"><h3><span data-lumen-icon=\"bible\"></span>Fragmento A</h3><div data-lumen-quote=\"1\"></div></article><article class=\"fragment\"><h3><span data-lumen-icon=\"scroll\"></span>Fragmento B</h3><div data-lumen-quote=\"2\"></div></article><article class=\"fragment\"><h3><span data-lumen-icon=\"church\"></span>Fragmento C</h3><div data-lumen-source=\"7\"></div></article><article class=\"fragment\"><h3><span data-lumen-icon=\"quill\"></span>Fragmento D</h3><div data-lumen-source=\"3\"></div></article></div></section><section><h2>Fragmentos de Hyrule.</h2><div class=\"cast\"><figure data-lumen-image=\"0\"></figure><figure data-lumen-image=\"1\"></figure><figure data-lumen-image=\"2\"></figure></div><article class=\"clue\"><figure data-lumen-image=\"4\"></figure><div><h3>Uma pergunta na floresta</h3><p>No começo do jogo, a Great Deku Tree conta que foi amaldiçoada e pede a ajuda de Link, que ainda não conhece o caminho. Ela pergunta:</p><div data-lumen-dialogue=\"0\" data-translation=\"Tens coragem bastante para assumir esta tarefa?\"></div></div></article><article class=\"clue\"><figure data-lumen-image=\"5\"></figure><div><h3>Uma conversa com Sheik</h3><p>Já na etapa adulta da jornada, ao ensinar o Bolero of Fire na cratera, Sheik fala a Link sobre algo que cresce com o tempo:</p><div data-lumen-dialogue=\"1\" data-translation=\"É algo que cresce com o tempo... uma verdadeira amizade.\"></div></div></article></section><section class=\"challenge\"><h2>Escolha seu ponto de partida.</h2><p>Qual personagem, cena, objeto ou acontecimento veio à sua cabeça ao ler um desses textos? Por quê?</p><div class=\"choices\"><button data-choice=\"A\">A — João 16</button><button data-choice=\"B\">B — CIC 1808</button><button data-choice=\"C\">C — Gaudium et spes 24</button><button data-choice=\"D\">D — Catequese de Francisco</button></div><p>Você também pode propor uma cena que não apareceu aqui. O caminho não tem um gabarito escondido.</p></section>",
  css: "section+section{margin-top:38px}article{margin:27px 0}h3{font-size:21px;color:var(--lumen-blue)}.challenge{border:2px solid var(--lumen-ink);background:var(--lumen-paper-light);padding:25px;border-radius:3px;box-shadow:6px 6px 0 #2b1d1418}.challenge h2{margin-top:0}.choices{display:grid;grid-template-columns:1fr 1fr;gap:10px}.choices button{text-align:left}.painting img{max-height:480px}.fragments{display:grid;gap:14px}.fragment{margin:0;padding:16px 20px;border:1.5px solid var(--lumen-ink);border-radius:3px;background:var(--lumen-paper-light)}.fragment h3{display:flex;align-items:center;gap:10px;margin:0}.fragment .lumen-quote{margin:10px 0 0}.fragment .lumen-source{margin:0;padding:6px 0 0;border-top:0}.cast{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.cast .lumen-image{margin:0}.cast .lumen-image img{height:260px}.clue{display:grid;grid-template-columns:minmax(0,250px) minmax(0,1fr);gap:22px;align-items:start;margin:32px 0}.clue .lumen-image{margin:0}.clue h3{margin:0 0 6px}.clue p{margin:0 0 10px}.clue .lumen-dialogue blockquote{font-size:22px}@media(max-width:550px){.choices,.clue{grid-template-columns:1fr}.challenge{padding:18px}.cast{grid-template-columns:1fr 1fr}}",
  javascript: "document.querySelectorAll('[data-choice]').forEach(button=>{if(Lumen.state.choice===button.dataset.choice)button.setAttribute('aria-pressed','true');button.addEventListener('click',()=>{document.querySelectorAll('[data-choice]').forEach(b=>b.setAttribute('aria-pressed','false'));button.setAttribute('aria-pressed','true');Lumen.saveState({choice:button.dataset.choice});Lumen.draft('Escolhi o fragmento '+button.dataset.choice+'. A cena que veio à minha cabeça foi... Minha interpretação é...');});});",
  invitation: 'Conte o que você encontrou. Depois vamos confrontar sua hipótese com o contexto das fontes e procurar seus limites.'
};
const direct = structuredClone(checked);
direct.introduction = 'Duas cenas permitem propor uma leitura sobre a fortaleza orientada ao bem e o amadurecimento da amizade. As aproximações abaixo são interpretações do leitor, apoiadas em fontes católicas; não demonstram intenção religiosa dos criadores.';
direct.items[0].title = 'A coragem precisa de um bem a servir';
direct.items[0].explanation = 'Leitura proposta: o pedido da Great Deku Tree permite pensar sobre uma coragem que responde à necessidade de outro. Link aceita uma tarefa difícil e recebe a companhia de Navi. Esses fatos narrativos sustentam uma aproximação limitada com a fortaleza; o perigo, por si só, ainda não torna uma ação virtuosa.\n\nO CIC §1808 descreve a fortaleza como firmeza nas dificuldades e constância na busca do bem. O §1806 acrescenta o papel da prudência em discernir o verdadeiro bem e escolher meios adequados. A lição católica que podemos investigar a partir da cena é que agir com coragem envolve perguntar pelo fim e pelos meios, além de vencer o medo.\n\nEm Jo 16,33, a coragem dos discípulos está ligada à vitória de Cristo, dentro de um discurso sobre tribulação, fé e paz nele. O texto oferece um horizonte cristão para refletir sobre dificuldades reais. A cena do jogo não demonstra essa fé nem substitui o sentido próprio da passagem.';
direct.items[0].limits = 'O convite ficcional não basta para julgar moralmente cada ação do personagem. A fortaleza cristã inclui um bem verdadeiro e meios moralmente legítimos. Link não é identificado com Cristo, e a maldição do jogo não é tratada como doutrina sobre pecado ou possessão.';
direct.items[0].practice = 'Escolha uma responsabilidade concreta que você vem adiando. Identifique o bem a proteger, um meio justo e uma ajuda que poderia pedir.';
direct.items[1].title = 'A amizade amadurece em atos';
direct.items[1].explanation = 'Leitura proposta: Sheik apresenta a amizade como algo que cresce no tempo. A fala abre uma pergunta sobre relações que ganham consistência por meio de uma história compartilhada. A aproximação é com o amadurecimento moral, sem supor que o jogo apresente a virtude cristã em sua plenitude.\n\nO CIC §1804 ensina que as virtudes humanas são disposições estáveis e que os atos moralmente bons participam de sua formação. A relação entre tempo, repetição e crescimento ajuda a passar do sentimento de amizade para a pergunta sobre atos concretos. Em Jo 15,9–17, Jesus situa o amor entre os discípulos no seu próprio amor e no dom da vida: é uma medida específica, mais exigente do que simples afinidade.\n\nGaudium et spes §24, ao tratar da vocação comunitária do ser humano, vincula o encontro de si ao dom sincero de si. Lidos juntos, os textos permitem propor esta lição: uma amizade cresce quando busca o bem do outro e se torna serviço concreto. Essa é uma reflexão católica feita a partir da cena, não uma mensagem oficialmente atribuída a Sheik ou à Nintendo.';
direct.items[1].limits = 'A fala de Sheik sobre uma força que nasce da amizade pertence à linguagem fantástica do jogo. A caridade cristã não é energia mágica, e o simples passar do tempo não garante uma relação virtuosa. João fala do amor em Cristo, cujo contexto não pode ser reduzido a qualquer amizade ficcional.';
direct.items[1].practice = 'Pense em uma amizade real. Escolha um gesto de atenção ou serviço que procure o bem dessa pessoa sem exigir retorno.';
direct.closingQuestions = ['A coragem precisa de um fim bom e de meios justos; o risco sozinho não a define como virtude.', 'O amadurecimento da amizade pode ser examinado à luz dos hábitos bons e do dom de si.', 'Que gesto pequeno faria essas leituras saírem do caderno e entrarem na sua semana?'];
const escape = value => value.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
direct.presentation = { html: direct.items.map((item, i) => `<section><h2>${escape(item.title)}</h2><div class="pair">${[[1, 0], [2, 3]][i].map(n => `<figure data-lumen-image="${n}"></figure>`).join('')}</div><div data-lumen-scene="${i}"></div><p class="explanation">${escape(item.explanation)}</p><p class="cites">Fontes desta leitura:${[0, 1, 2, 3].map(n => `<span data-lumen-cite="${i * 4 + n}"></span>`).join('')}</p><h3>Até onde vai a comparação</h3><p>${escape(item.limits)}</p><details><summary>Abrir as leituras</summary>${item.references.map((r, j) => `<div data-lumen-source="${i * 4 + j}"></div>`).join('')}</details><p class="practice">${escape(item.practice)}</p></section>`).join(''), css: 'section{margin-bottom:45px}.explanation{white-space:pre-line;line-height:1.8}summary{cursor:pointer;font-weight:700;color:var(--lumen-blue)}.practice{background:#23358f0f;border-left:3px solid var(--lumen-blue);padding:18px 20px}h3{margin-top:28px;font-size:22px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:14px}.pair .lumen-image{margin:0}.pair .lumen-image img{height:300px}@media(max-width:550px){.pair{grid-template-columns:1fr}}.cites{display:flex;flex-wrap:wrap;align-items:center;gap:6px 0;font-size:15px;font-style:italic;color:var(--lumen-muted)}', javascript: '', invitation: 'Qual dessas leituras você gostaria de questionar ou aprofundar?' };
await mkdir(new URL('../examples/', import.meta.url), { recursive: true });
for (const [mode, result] of [['study', checked], ['direct', direct]]) await writeFile(new URL(`../examples/zelda-${mode}.json`, import.meta.url), JSON.stringify(result, null, 2));
console.log('Exemplos preparados.');
