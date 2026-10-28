// English edition of the prepared Zelda example. It reuses the Portuguese files' checked
// sources, quotations and images, and replaces only the text written for the reader.
// Run after scripts/build-example.mjs: node scripts/build-example-en.mjs
import { readFile, writeFile } from 'node:fs/promises';

const read = async mode => JSON.parse(await readFile(new URL(`../examples/zelda-${mode}.json`, import.meta.url), 'utf8'));
const escape = value => value.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const shared = {
  scope: 'Nintendo 64 · English dialogue · the opening call and the meeting with Sheik in Death Mountain Crater · contains spoilers',
  evidenceNote: 'Example prepared for this app on October 27, 2026. The dialogue was found in a third-party transcript on GameFAQs; check the edition and localization in the game. Bible: NABRE, Catholic edition in English published by the USCCB. Catechism: English edition on the Vatican website. Council document: official Portuguese version. The location marks record the automatic attempt made during preparation; they do not certify that the analogy fits and are not ongoing verification.',
  items: [
    {
      title: 'A call in the forest',
      scene: 'Scene paraphrase: at the start of the game, the Great Deku Tree reveals that it has been cursed, asks Link to take on the task and asks Navi to go with him. Link is invited to answer the request before he knows the whole path.',
      sceneLocator: 'Ocarina of Time, N64, English · conversation with the Great Deku Tree before the first dungeon.',
      question: 'What do you notice in the way the request is made and in Link’s response? What criteria would you use to assess his action?',
      hints: ['Reread the dialogue and note what Link knows, what he does not know yet and from whom he receives help.', 'In CCC §1808, look for the expressions that point to the end of an action. Then read John 16:25–33 without lifting the last verse out of its context.'],
      limits: 'Which aspects of Link’s action find support in these sources, and which would require further distinctions?',
      practice: 'Make two columns: facts of the scene and observations about the readings. Write a hypothesis only after filling both.',
      references: [
        { label: 'Ocarina of Time — dialogue transcript', locator: 'Great Deku Tree · start of the journey', language: 'English · Nintendo 64; fan transcript', note: 'Secondary source for locating the line. Search for the sentence in the text and check it in your edition of the game.' },
        { label: 'Gospel according to Saint John', locator: 'Jn 16:25–33, especially 16:33', language: 'English · NABRE (USCCB)', note: 'Read Jesus’ words to the disciples in their context. The passage is quoted literally from the NABRE.' },
        { label: 'Catechism of the Catholic Church', locator: 'CCC §§1805–1808; note §1808', language: 'English · Vatican edition', note: 'Read the neighbouring paragraphs too. The excerpt helps locate the passage; applying it to the work requires reflection.' },
        { label: 'Francis — catechesis on fortitude', locator: 'General audience, April 10, 2024 · Vices and virtues, 14', language: 'Portuguese · catechesis at a general audience', note: 'A papal catechesis has its own genre; it is not a new dogmatic definition. Check the examples and distinctions made in the text.' }
      ]
    },
    {
      title: 'A conversation in the crater',
      scene: 'Scene paraphrase: while teaching the Bolero of Fire, Sheik speaks of friendship growing over time. The conversation happens in the adult stage of the journey, in Death Mountain Crater.',
      sceneLocator: 'Ocarina of Time, N64, English · meeting Sheik in Death Mountain Crater, learning the Bolero of Fire.',
      question: 'How does Sheik’s line describe a relationship that matures? After the readings, which aspects would you like to examine more closely?',
      hints: ['In Sheik’s line, notice the relationship between time, growth and action. What examples from the story itself can you find?', 'Read John 15:9–17 in full. Then ask what §24 of Gaudium et spes adds to your investigation.'],
      limits: 'Would a similarity of language be enough? What changes when you consider the full context of each text?',
      practice: 'Write down one possible connection and one important difference, noting the sentence or section that supports each observation.',
      references: [
        { label: 'Ocarina of Time — dialogue transcript', locator: 'Sheik · Bolero of Fire', language: 'English · Nintendo 64; fan transcript', note: 'Secondary source. The line was located in the transcript; check the context and version in the game.' },
        { label: 'Gospel according to Saint John', locator: 'Jn 15:9–17, especially 15:12–15', language: 'English · NABRE (USCCB)', note: 'Notice who is speaking, to whom, and how the passage connects with the image of the vine at the start of the chapter.' },
        { label: 'Catechism of the Catholic Church', locator: 'CCC §1804 · see also §§1805–1809', language: 'English · Vatican edition', note: 'Read the definition of human virtue and the relationship between habits, acts and moral life.' },
        { label: 'Gaudium et spes — pastoral constitution', locator: 'Second Vatican Council, December 7, 1965 · §24', language: 'Portuguese · official Vatican version', note: 'Read all of §24, on the communal nature of the human vocation. Do not treat an isolated sentence as a conclusion about the game.' }
      ]
    }
  ],
  limitations: ['This example covers two scenes; it does not offer an interpretation of the whole game.', 'The dialogue transcript is by a third party, not an official Nintendo publication. Wording may vary by edition and localization.', 'The Bible readings come from the NABRE. You can compare the reference with another Catholic translation, noting which one you use.', 'The study presents no proof of Christian or Catholic intent by the creators.'],
  images: [
    { alt: 'Link, in a green tunic and cap, sitting on a brick wall playing the ocarina, with the fairy Navi beside him.', caption: 'Link and Navi in Ocarina of Time.', credit: 'Official Nintendo artwork, via Zelda Wiki.' },
    { alt: 'A huge, ancient tree with a face, closed eyes and a moustache formed in its trunk.', caption: 'The Great Deku Tree in Ocarina of Time.', credit: 'Official Nintendo artwork, via Zelda Wiki.' },
    { alt: 'Sheik, in a tight blue outfit, face partly covered by wrappings, with an eye symbol on the chest.', caption: 'Sheik in Ocarina of Time.', credit: 'Official Nintendo artwork, via Zelda Wiki.' },
    { alt: 'Painting on a gold background: Christ, seated, speaks to a group of apostles gathered around him.', caption: 'Christ Taking Leave of the Apostles, panel of the Maestà (1308–1311).', credit: 'Duccio di Buoninsegna, Museo dell’Opera del Duomo, Siena. Public domain, via Wikimedia Commons.' },
    { alt: 'Game screenshot: a small Link before the enormous trunk of the Great Deku Tree, in a forest clearing.', caption: 'The Great Deku Tree’s meadow (Nintendo 64).', credit: 'Screenshot of Ocarina of Time (Nintendo), via Zelda Wiki.' },
    { alt: 'Game screenshot: Link and Sheik facing each other on a wooden bridge, in reddish light, inside the crater.', caption: 'Link and Sheik in Death Mountain Crater (Nintendo 64).', credit: 'Screenshot of Ocarina of Time (Nintendo), via Zelda Wiki.' }
  ]
};

function translate(study, text) {
  const result = structuredClone(study);
  result.language = 'en';
  result.scope = shared.scope;
  result.evidenceNote = shared.evidenceNote;
  result.limitations = shared.limitations;
  result.introduction = text.introduction;
  result.closingQuestions = text.closingQuestions;
  result.items = result.items.map((item, i) => {
    const { references, ...fields } = shared.items[i];
    return { ...item, ...fields, ...(text.items?.[i] || {}), references: item.references.map((ref, j) => ({ ...ref, ...references[j] })) };
  });
  result.images = result.images.map((image, i) => ({ ...image, ...shared.images[i] }));
  result.presentation = { ...result.presentation, ...text.presentation(result) };
  return result;
}

const study = translate(await read('study'), {
  introduction: 'Set aside a little time, open the sources and look at two scenes. The questions below are a starting point: note what brings the texts together and what resists the comparison.',
  closingQuestions: ['Which hypothesis did you form after reading the sources?', 'Which passage gives the strongest support? Which detail of the work limits your reading?', 'Which question would you take to a next reading or a formation conversation?'],
  presentation: () => ({
    html: '<section><h2>The first fragments.</h2><p>Read the texts as a small set of clues. There is no need to find a pair for every scene.</p><figure data-lumen-image="3" class="painting"></figure><div class="fragments"><article class="fragment"><h3><span data-lumen-icon="bible"></span>Fragment A</h3><div data-lumen-quote="1"></div></article><article class="fragment"><h3><span data-lumen-icon="scroll"></span>Fragment B</h3><div data-lumen-quote="2"></div></article><article class="fragment"><h3><span data-lumen-icon="church"></span>Fragment C</h3><div data-lumen-source="7"></div></article><article class="fragment"><h3><span data-lumen-icon="quill"></span>Fragment D</h3><div data-lumen-source="3"></div></article></div></section><section><h2>Fragments of Hyrule.</h2><div class="cast"><figure data-lumen-image="0"></figure><figure data-lumen-image="1"></figure><figure data-lumen-image="2"></figure></div><article class="clue"><figure data-lumen-image="4"></figure><div><h3>A question in the forest</h3><p>At the start of the game, the Great Deku Tree reveals that it has been cursed and asks for the help of Link, who does not know the way yet. It asks:</p><div data-lumen-dialogue="0"></div></div></article><article class="clue"><figure data-lumen-image="5"></figure><div><h3>A conversation with Sheik</h3><p>Already in the adult stage of the journey, while teaching the Bolero of Fire in the crater, Sheik tells Link about something that grows over time:</p><div data-lumen-dialogue="1"></div></div></article></section><section class="challenge"><h2>Choose your starting point.</h2><p>Which character, scene, object or event came to mind as you read one of these texts? Why?</p><div class="choices"><button data-choice="A">A — John 16</button><button data-choice="B">B — CCC 1808</button><button data-choice="C">C — Gaudium et spes 24</button><button data-choice="D">D — Francis’ catechesis</button></div><p>You can also propose a scene that did not appear here. The path has no hidden answer key.</p></section>',
    javascript: "document.querySelectorAll('[data-choice]').forEach(button=>{if(Lumen.state.choice===button.dataset.choice)button.setAttribute('aria-pressed','true');button.addEventListener('click',()=>{document.querySelectorAll('[data-choice]').forEach(b=>b.setAttribute('aria-pressed','false'));button.setAttribute('aria-pressed','true');Lumen.saveState({choice:button.dataset.choice});Lumen.draft('I chose fragment '+button.dataset.choice+'. The scene that came to mind was... My interpretation is...');});});",
    invitation: 'Tell us what you found. Then we will test your hypothesis against the context of the sources and look for its limits.'
  })
});

const direct = translate(await read('direct'), {
  introduction: 'Two scenes allow a proposed reading about fortitude directed to the good and about the maturing of friendship. The connections below are the reader’s interpretations, supported by Catholic sources; they do not show any religious intent by the creators.',
  closingQuestions: ['Courage needs a good end and just means; risk alone does not make it a virtue.', 'The maturing of friendship can be examined in light of good habits and the gift of self.', 'What small gesture would take these readings out of the notebook and into your week?'],
  items: [
    {
      title: 'Courage needs a good to serve',
      explanation: 'Proposed reading: the Great Deku Tree’s request lets us think about a courage that answers someone else’s need. Link accepts a difficult task and receives Navi’s companionship. These narrative facts support a limited connection with fortitude; danger alone does not yet make an action virtuous.\n\nCCC §1808 describes fortitude as firmness in difficulties and constancy in the pursuit of the good. §1806 adds the role of prudence in discerning the true good and choosing suitable means. The Catholic lesson we can explore from the scene is that acting with courage means asking about the end and the means, not only overcoming fear.\n\nIn John 16:33, the disciples’ courage is tied to Christ’s victory, within a discourse on tribulation, faith and peace in him. The text offers a Christian horizon for reflecting on real difficulties. The game scene does not demonstrate that faith, nor does it replace the passage’s own meaning.',
      limits: 'The fictional call is not enough to judge every action of the character morally. Christian fortitude includes a true good and morally legitimate means. Link is not identified with Christ, and the game’s curse is not treated as doctrine about sin or possession.',
      practice: 'Choose a concrete responsibility you have been putting off. Identify the good to protect, a just means and a help you could ask for.'
    },
    {
      title: 'Friendship matures in deeds',
      explanation: 'Proposed reading: Sheik presents friendship as something that grows over time. The line opens a question about relationships that gain substance through a shared history. The connection is with moral maturing, without assuming that the game presents Christian virtue in its fullness.\n\nCCC §1804 teaches that human virtues are stable dispositions and that morally good acts take part in forming them. The relationship between time, repetition and growth helps move from the feeling of friendship to the question of concrete acts. In John 15:9–17, Jesus grounds the love among the disciples in his own love and in the gift of life: a specific measure, more demanding than mere affinity.\n\nGaudium et spes §24, on the communal vocation of the human person, links finding oneself to the sincere gift of self. Read together, the texts allow us to propose this lesson: a friendship grows when it seeks the good of the other and becomes concrete service. This is a Catholic reflection made from the scene, not a message officially attributed to Sheik or to Nintendo.',
      limits: 'Sheik’s words about a power born of friendship belong to the game’s fantasy language. Christian charity is not magical energy, and the mere passing of time does not guarantee a virtuous relationship. John speaks of love in Christ, whose context cannot be reduced to any fictional friendship.',
      practice: 'Think of a real friendship. Choose a gesture of attention or service that seeks that person’s good without expecting anything in return.'
    }
  ],
  presentation: result => ({
    html: result.items.map((item, i) => `<section><h2>${escape(item.title)}</h2><div class="pair">${[[1, 0], [2, 3]][i].map(n => `<figure data-lumen-image="${n}"></figure>`).join('')}</div><div data-lumen-scene="${i}"></div><p class="explanation">${escape(item.explanation)}</p><p class="cites">Sources for this reading:${[0, 1, 2, 3].map(n => `<span data-lumen-cite="${i * 4 + n}"></span>`).join('')}</p><h3>How far the comparison goes</h3><p>${escape(item.limits)}</p><details><summary>Open the readings</summary>${item.references.map((r, j) => `<div data-lumen-source="${i * 4 + j}"></div>`).join('')}</details><p class="practice">${escape(item.practice)}</p></section>`).join(''),
    invitation: 'Which of these readings would you like to question or explore further?'
  })
});

for (const [mode, result] of [['study', study], ['direct', direct]]) await writeFile(new URL(`../examples/zelda-${mode}.en.json`, import.meta.url), JSON.stringify(result, null, 2));
console.log('English examples written.');
