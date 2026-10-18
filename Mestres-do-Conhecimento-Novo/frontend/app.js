/**
 * Liga os nomes das telas às seções HTML correspondentes.
 */
const screens = {
  home: document.querySelector('#home-screen'),
  select: document.querySelector('#select-screen'),
  game: document.querySelector('#game-screen')
};

/**
 * Guarda os dados e o progresso da partida atual.
 */
const state = {
  subject: null,
  world: null,
  question: null,
  xp: 0,
  correct: 0,
  answered: 0,
  streak: 0,
  bestStreak: 0,
  monsterHits: 0,
  bossHits: 0,
  wrongAnswers: [],
  monstersDefeated: 0,
  bossQuestions: 0,
  finalBattle: false,
  heroHp: 100,
  bossHp: 100,
  seconds: 30,
  timer: null,
  locked: false,
  seen: new Set()
};

/** Letras mostradas ao lado das quatro alternativas de resposta. */
const letters = ['A', 'B', 'C', 'D'];

/**
 * Catálogo visual local: cada matéria define um herói, cenário e cinco monstros.
 */
const WORLDS = {
  'Português': {
    hero: {
      name: 'Lira, Guardiã das Palavras',
      kind: 'scribe',
      primary: '#9d62c9',
      secondary: '#4c316f',
      accent: '#f0cd74',
      mark: 'Á'
    },
    scene: {
      name: 'Biblioteca das Palavras',
      theme: 'library',
      decor: [
        '📚',
        '📜',
        '🕯️',
        '✒️'
      ]
    },
    monsters: [
      {
        name: 'Rasurador de Runas',
        kind: 'ink',
        primary: '#34234f',
        secondary: '#a84670',
        accent: '#f5a2bf',
        mark: '✎'
      },
      {
        name: 'Gárgula do Acento',
        kind: 'gargoyle',
        primary: '#63827d',
        secondary: '#384b50',
        accent: '#e3bb71',
        mark: '´'
      },
      {
        name: 'Espectro da Crase',
        kind: 'ghost',
        primary: '#a98bd0',
        secondary: '#574a91',
        accent: '#f1dcff',
        mark: 'à'
      },
      {
        name: 'Corvo da Pontuação',
        kind: 'raven',
        primary: '#3b3657',
        secondary: '#211f36',
        accent: '#f4bd66',
        mark: '!'
      },
      {
        name: 'Dragão da Gramática',
        kind: 'dragon',
        primary: '#ba5948',
        secondary: '#703541',
        accent: '#f3cc73',
        mark: 'G'
      }
    ]
  },

  'Matemática': {
    hero: {
      name: 'Gauss, Arquiteto dos Números',
      kind: 'sage',
      primary: '#4c8fd0',
      secondary: '#273f78',
      accent: '#f0c76a',
      mark: 'π'
    },
    scene: {
      name: 'Observatório das Equações',
      theme: 'observatory',
      decor: [
        '📐',
        '🪐',
        '🔷',
        '➗'
      ]
    },
    monsters: [
      {
        name: 'Golem da Subtração',
        kind: 'golem',
        primary: '#6784a3',
        secondary: '#384e6b',
        accent: '#f0c76a',
        mark: '−'
      },
      {
        name: 'Esfinge das Frações',
        kind: 'sphinx',
        primary: '#d49c54',
        secondary: '#86533d',
        accent: '#f6dc92',
        mark: '½'
      },
      {
        name: 'Serpente das Equações',
        kind: 'serpent',
        primary: '#4f9b9c',
        secondary: '#31556f',
        accent: '#d8ef83',
        mark: 'x'
      },
      {
        name: 'Autômato da Geometria',
        kind: 'automaton',
        primary: '#8098b0',
        secondary: '#445971',
        accent: '#f08b70',
        mark: '△'
      },
      {
        name: 'Hidra do Infinito',
        kind: 'hydra',
        primary: '#9466c4',
        secondary: '#523d88',
        accent: '#f2d16c',
        mark: '∞'
      }
    ]
  },

  'Ciências': {
    hero: {
      name: 'Íris, Exploradora da Vida',
      kind: 'scientist',
      primary: '#43aa84',
      secondary: '#286552',
      accent: '#e8d778',
      mark: '⚛'
    },
    scene: {
      name: 'Estufa Bioluminescente',
      theme: 'laboratory',
      decor: [
        '🧬',
        '🧪',
        '🌿',
        '🦠'
      ]
    },
    monsters: [
      {
        name: 'Bactéria Colossal',
        kind: 'germ',
        primary: '#78bd54',
        secondary: '#427643',
        accent: '#e2ee73',
        mark: '✹'
      },
      {
        name: 'Mutante Celular',
        kind: 'slime',
        primary: '#54b79d',
        secondary: '#317767',
        accent: '#a4f4cf',
        mark: '●'
      },
      {
        name: 'Espectro Radioativo',
        kind: 'ghost',
        primary: '#b4d65b',
        secondary: '#4f8849',
        accent: '#f5ee83',
        mark: '☢'
      },
      {
        name: 'Serpente de DNA',
        kind: 'serpent',
        primary: '#468ec3',
        secondary: '#31547e',
        accent: '#de79bb',
        mark: '🧬'
      },
      {
        name: 'Titã da Entropia',
        kind: 'golem',
        primary: '#6d7788',
        secondary: '#373f5b',
        accent: '#e58c5d',
        mark: '⚗'
      }
    ]
  },

  'História': {
    hero: {
      name: 'Ayla, Cronista das Eras',
      kind: 'chronicle',
      primary: '#c47b43',
      secondary: '#72462e',
      accent: '#f3d178',
      mark: '⌛'
    },
    scene: {
      name: 'Ruínas do Reino Antigo',
      theme: 'ruins',
      decor: [
        '🏺',
        '🏛️',
        '🗿',
        '⚱️'
      ]
    },
    monsters: [
      {
        name: 'Múmia do Reino Antigo',
        kind: 'mummy',
        primary: '#c8b990',
        secondary: '#817454',
        accent: '#e6d6ad',
        mark: '𓂀'
      },
      {
        name: 'Legionário de Cinzas',
        kind: 'warrior',
        primary: '#a85045',
        secondary: '#592e37',
        accent: '#e7b45c',
        mark: '⚔'
      },
      {
        name: 'Cavaleiro Sem Rosto',
        kind: 'knight',
        primary: '#708294',
        secondary: '#39495b',
        accent: '#d6c18b',
        mark: '♜'
      },
      {
        name: 'Autômato Industrial',
        kind: 'automaton',
        primary: '#9a7255',
        secondary: '#514638',
        accent: '#e3a64f',
        mark: '⚙'
      },
      {
        name: 'Cronos, Senhor do Tempo',
        kind: 'timebeast',
        primary: '#7765af',
        secondary: '#3d3975',
        accent: '#f0ce70',
        mark: '⌛'
      }
    ]
  },

  'Geografia': {
    hero: {
      name: 'Maia, Cartógrafa dos Mundos',
      kind: 'navigator',
      primary: '#48a69a',
      secondary: '#285f68',
      accent: '#edc96b',
      mark: 'N'
    },
    scene: {
      name: 'Cordilheira dos Quatro Ventos',
      theme: 'mountains',
      decor: [
        '🌋',
        '🏔️',
        '🌊',
        '🧭'
      ]
    },
    monsters: [
      {
        name: 'Titã Tectônico',
        kind: 'golem',
        primary: '#9b7659',
        secondary: '#594b43',
        accent: '#f0b965',
        mark: '◆'
      },
      {
        name: 'Espírito dos Climas',
        kind: 'storm',
        primary: '#6c9dc0',
        secondary: '#46617f',
        accent: '#d5ecf0',
        mark: '☁'
      },
      {
        name: 'Kraken Abissal',
        kind: 'kraken',
        primary: '#478d91',
        secondary: '#27515d',
        accent: '#e29068',
        mark: '◉'
      },
      {
        name: 'Dragão Vulcânico',
        kind: 'dragon',
        primary: '#d45d3d',
        secondary: '#7a3031',
        accent: '#ffc568',
        mark: '🔥'
      },
      {
        name: 'Gaia, Guardiã Primordial',
        kind: 'treebeast',
        primary: '#68a45d',
        secondary: '#3b6948',
        accent: '#f1d171',
        mark: '✿'
      }
    ]
  }
};

/**
 * Mostra uma tela e oculta as outras, levando a página ao início.
 */
function show(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle('hidden', key !== name);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Chama um endpoint da API e converte respostas de erro em exceções.
 */
async function api(path, options) {
  const response = await fetch(path, options);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || 'API ' + response.status);
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * Exibe uma mensagem temporária de estado para o jogador.
 */
function toast(message) {
  const element = document.querySelector('#toast');

  element.textContent = message;
  element.classList.add('show');

  setTimeout(() => {
    element.classList.remove('show');
  }, 2400);
}

/** Contador usado para manter exclusivos os IDs internos dos SVGs. */
let figureSequence = 0;

/**
 * Desenha um herói ou monstro em SVG com as cores e o estilo cadastrados.
 * @param {object} person Dados visuais do personagem.
 * @param {boolean} isMonster Indica se o personagem é um monstro.
 */
function figureSvg(person, isMonster = false) {
  const p = person.primary;
  const s = person.secondary;
  const a = person.accent;
  const k = person.kind;
  const id = 'figure-' + (++figureSequence);
  let back = '';
  let body = '';
  let head = '';
  let extras = '';
  if (!isMonster) {
  back=`<path d="M38 152 Q27 108 51 91 L80 82 L109 91 Q133 111 122 152Z" fill="${s}"/><path d="M51 99 L80 119 L109 99 L119 156 L41 156Z" fill="${p}"/><path d="M68 119 L80 135 L92 119" fill="${a}"/>`;
  const hair = { scribe:'#543665',sage:'#293b68',scientist:'#27634f',chronicle:'#65432e',navigator:'#24545a'}[k]||s;
  head='<path d="M50 70 Q48 28 80 27 Q114 28 110 71 L105 89 Q96 107 80 107 Q63 105 54 88Z" fill="#d89c75" stroke="#9c6558" stroke-width="1.5"/><path d="M50 66 Q47 29 81 25 Q111 28 112 65 Q95 49 74 53 Q61 53 50 66Z" fill="'+hair+'"/><path d="M57 43 Q77 32 101 42" fill="none" stroke="#ffffff" stroke-opacity=".28" stroke-width="5" stroke-linecap="round"/><ellipse cx="68" cy="75" rx="5" ry="4" fill="#fff4d6"/><ellipse cx="92" cy="75" rx="5" ry="4" fill="#fff4d6"/><circle cx="69" cy="75" r="2.5" fill="#25342f"/><circle cx="93" cy="75" r="2.5" fill="#25342f"/><path d="M72 90 Q80 96 88 90" fill="none" stroke="#754e4b" stroke-width="3" stroke-linecap="round"/><circle cx="58" cy="86" r="3" fill="#e99588" opacity=".6"/><circle cx="102" cy="86" r="3" fill="#e99588" opacity=".6"/>'
  const gear = { scribe:`<path d="M43 47 L80 3 L117 47 L107 52 L80 23 L53 52Z" fill="${p}"/><circle cx="80" cy="48" r="6" fill="${a}"/>`,sage:`<path d="M52 52 Q50 23 80 20 Q110 23 108 52Z" fill="${p}"/><circle cx="80" cy="39" r="5" fill="${a}"/>`,scientist:`<rect x="51" y="63" width="27" height="20" rx="8" fill="none" stroke="${a}" stroke-width="5"/><rect x="82" y="63" width="27" height="20" rx="8" fill="none" stroke="${a}" stroke-width="5"/><path d="M77 70 L83 70" stroke="${a}" stroke-width="4"/>`,chronicle:`<path d="M45 67 Q42 22 80 20 Q117 23 115 67 L106 58 Q80 45 54 60Z" fill="${p}"/><path d="M47 64 L114 64" stroke="${a}" stroke-width="6"/>`,navigator:`<path d="M43 57 Q80 35 117 57 L111 65 L49 65Z" fill="${p}"/><path d="M80 21 L88 49 L80 45 L72 49Z" fill="${a}"/><path d="M80 19V8" stroke="${a}" stroke-width="4"/>`};
  extras=gear[k]||'';
  } else {
  const forms={
   ink:`<path d="M42 115 Q31 81 48 72 Q53 54 67 63 Q81 44 91 63 Q111 52 115 76 Q135 93 117 115 L112 146 L99 130 L87 151 L74 132 L58 150 L57 126Z" fill="${p}" stroke="${s}" stroke-width="5"/>`,
   gargoyle:`<path d="M46 74 L24 43 L56 55 L67 63 M114 74 L136 43 L104 55 L93 63" fill="${s}" stroke="${a}" stroke-width="4"/><path d="M45 110 Q47 77 80 72 Q113 77 115 110 L126 145 L97 134 L80 151 L63 134 L34 145Z" fill="${p}"/>`,
   ghost:`<path d="M48 131 Q38 119 46 92 Q48 60 80 57 Q112 60 114 92 Q122 118 111 131 L98 123 L87 136 L76 124 L64 137Z" fill="${p}" stroke="${a}" stroke-width="4"/>`,
   raven:`<path d="M48 83 Q19 55 22 44 Q48 46 68 69 L80 60 L94 69 Q116 45 139 44 Q135 69 111 87 L117 116 L80 145 L43 116Z" fill="${p}" stroke="${s}" stroke-width="4"/><path d="M92 83 L117 91 L93 98Z" fill="${a}"/>`,
   dragon:`<path d="M45 81 Q17 38 14 48 Q18 89 52 106 M115 81 Q143 38 146 48 Q142 89 108 106" fill="${s}" stroke="${a}" stroke-width="4"/><path d="M55 72 L49 46 L69 61 M105 72 L111 46 L91 61" fill="${p}" stroke="${a}" stroke-width="3"/><path d="M49 112 Q47 77 80 70 Q113 77 111 112 L126 145 L95 135 L80 151 L65 135 L34 145Z" fill="${p}"/>`,
   golem:`<path d="M43 74 L56 56 L105 56 L118 74 L119 112 L136 143 L104 136 L80 153 L56 136 L24 143 L41 112Z" fill="${p}" stroke="${s}" stroke-width="5"/><path d="M54 88 L70 97 L64 108 M102 87 L90 98 L98 111" fill="none" stroke="${a}" stroke-width="4"/>`,
   sphinx:`<path d="M34 103 Q38 70 80 68 Q122 70 126 103 L137 143 L99 133 L80 151 L61 133 L23 143Z" fill="${p}"/><path d="M53 75 L47 48 L65 61 M107 75 L113 48 L95 61" fill="${s}"/><path d="M62 107 Q80 119 98 107 L91 124 L69 124Z" fill="${a}"/>`,
   serpent:`<path d="M47 125 Q20 126 36 104 Q51 83 79 102 Q109 124 124 98 Q137 74 112 62" fill="none" stroke="${p}" stroke-width="22" stroke-linecap="round"/><path d="M86 75 Q78 48 102 40 Q127 47 121 71 L107 84Z" fill="${p}" stroke="${s}" stroke-width="4"/><path d="M96 45 L92 29 L106 41 M116 43 L126 29 L126 49" fill="${a}"/>`,
   automaton:`<rect x="50" y="55" width="60" height="52" rx="9" fill="${p}" stroke="${s}" stroke-width="5"/><path d="M80 55 V34 M68 33 H92" stroke="${a}" stroke-width="5"/><path d="M43 112 L57 101 H103 L117 112 L126 146 L98 136 L80 151 L62 136 L34 146Z" fill="${s}"/><circle cx="67" cy="79" r="6" fill="${a}"/><circle cx="93" cy="79" r="6" fill="${a}"/>`,
   hydra:`<path d="M43 103 Q39 73 80 69 Q121 73 117 103 L132 145 L99 134 L80 151 L61 134 L28 145Z" fill="${p}"/><path d="M54 78 Q48 60 59 48 Q73 42 79 58 L79 78 M75 70 Q72 48 87 40 Q103 43 101 67 L99 78 M96 77 Q98 54 112 51 Q128 59 119 82" fill="${p}" stroke="${s}" stroke-width="4"/><circle cx="64" cy="60" r="3" fill="${a}"/><circle cx="89" cy="55" r="3" fill="${a}"/><circle cx="111" cy="65" r="3" fill="${a}"/>`,
   germ:`<circle cx="80" cy="100" r="43" fill="${p}" stroke="${s}" stroke-width="5"/><path d="M80 48V32 M80 168V152 M34 100H18 M142 100H126 M47 67L35 55 M125 145L113 133 M113 67L125 55 M35 145L47 133" stroke="${a}" stroke-width="7" stroke-linecap="round"/><circle cx="65" cy="93" r="5" fill="#20352a"/><circle cx="95" cy="93" r="5" fill="#20352a"/>`,
   slime:`<path d="M37 136 Q27 112 42 91 Q56 71 69 79 Q80 52 95 78 Q120 68 126 100 Q137 124 122 143 Q80 158 37 136Z" fill="${p}" stroke="${s}" stroke-width="5"/><circle cx="66" cy="109" r="5" fill="#24392f"/><circle cx="96" cy="109" r="5" fill="#24392f"/><ellipse cx="80" cy="132" rx="12" ry="5" fill="${a}"/>`,
   mummy:`<path d="M57 61 Q56 43 80 42 Q105 43 103 64 L111 108 L126 145 L98 135 L80 151 L62 135 L34 145 L49 107Z" fill="${p}" stroke="${s}" stroke-width="4"/><path d="M57 57 Q80 66 104 56 M52 77 Q80 88 108 75 M51 101 Q80 111 110 98 M48 124 Q80 135 117 122" fill="none" stroke="${a}" stroke-width="5"/>`,
   warrior:`<path d="M46 73 L80 45 L114 73 L108 102 L125 145 L97 135 L80 151 L63 135 L35 145 L52 102Z" fill="${p}" stroke="${s}" stroke-width="5"/><path d="M51 75 L80 52 L109 75 L104 89 H56Z" fill="${a}"/><path d="M60 105 H100" stroke="${s}" stroke-width="6"/>`,
   knight:`<path d="M50 67 L80 46 L110 67 L105 108 L126 145 L97 135 L80 151 L63 135 L34 145 L55 108Z" fill="${p}" stroke="${s}" stroke-width="5"/><path d="M53 67 L80 31 L107 67Z" fill="${a}"/><path d="M62 84 H98 M80 72V101" stroke="${s}" stroke-width="5"/>`,
   timebeast:`<path d="M45 80 Q41 52 59 44 L68 58 Q81 43 92 58 L102 42 Q122 51 116 81 L124 116 L138 145 L103 136 L80 153 L57 136 L22 145 L39 116Z" fill="${p}"/><circle cx="66" cy="88" r="5" fill="${a}"/><circle cx="94" cy="88" r="5" fill="${a}"/><path d="M80 76V113 M67 101H93" stroke="${a}" stroke-width="4"/>`,
   storm:`<path d="M48 126 Q25 114 39 95 Q35 72 57 70 Q69 49 87 68 Q111 63 119 85 Q141 100 121 120 L109 132 L96 122 L82 138 L68 125 L55 139Z" fill="${p}" stroke="${s}" stroke-width="4"/><path d="M83 90 L70 111 H83 L76 128 L98 102 H85 L94 90Z" fill="${a}"/>`,
   kraken:`<path d="M55 100 Q51 66 80 62 Q109 66 105 100 L119 132 Q138 143 132 155 Q115 162 103 140 L94 120 M57 111 L45 137 Q29 155 17 143 Q17 130 39 120 M68 118 L65 146 Q73 164 85 153 L83 123 M97 112 L114 126 Q141 126 143 112 Q137 101 119 110" fill="none" stroke="${p}" stroke-width="14" stroke-linecap="round"/><circle cx="70" cy="88" r="4" fill="${a}"/><circle cx="90" cy="88" r="4" fill="${a}"/>`,
   treebeast:`<path d="M48 83 Q35 65 43 51 Q57 52 62 65 Q68 37 80 30 Q93 41 98 65 Q111 49 123 54 Q126 74 110 88 L112 112 L127 146 L98 135 L80 151 L62 135 L33 146 L49 111Z" fill="${p}" stroke="${s}" stroke-width="5"/><path d="M80 48V120" stroke="${a}" stroke-width="5"/><circle cx="67" cy="91" r="4" fill="${a}"/><circle cx="93" cy="91" r="4" fill="${a}"/>`
  };
  body = forms[k] || forms.golem;
 }
  return '<svg viewBox="0 0 160 170" aria-hidden="true"><defs><radialGradient id="'+id+'-aura"><stop stop-color="'+a+'" stop-opacity=".42"/><stop offset="1" stop-color="'+a+'" stop-opacity="0"/></radialGradient><filter id="'+id+'-shadow" x="-.3" y="-.3" width="1.7" height="1.8"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#101714" flood-opacity=".55"/></filter></defs><circle cx="80" cy="84" r="76" fill="url(#'+id+'-aura)"/><circle cx="80" cy="84" r="62" fill="none" stroke="'+a+'" stroke-opacity=".42" stroke-width="1.5" stroke-dasharray="3 6"/><ellipse cx="80" cy="157" rx="48" ry="8" fill="#101714" opacity=".55"/><g filter="url(#'+id+'-shadow)">'+back+body+head+extras+'<path d="M52 102l28 20 28-20-7 25-21 15-21-15z" fill="'+a+'" stroke="'+s+'" stroke-width="2"/><circle cx="80" cy="119" r="9" fill="'+a+'" stroke="'+s+'" stroke-width="3"/><text x="80" y="123" text-anchor="middle" font-size="10" font-weight="900" fill="'+s+'">'+person.mark+'</text></g><circle cx="34" cy="55" r="2" fill="#fff2bd"/><circle cx="125" cy="40" r="2" fill="#fff2bd"/><circle cx="132" cy="119" r="1.5" fill="#fff2bd"/></svg>';
}
/**
 * Desenha cenários SVG locais para as matérias sem depender de serviços externos.
 */
let sceneSequence = 0;

/**
 * Cria o fundo ilustrado da arena usando os desenhos do tema escolhido.
 * @param {string} theme Identificador visual do cenário.
 */
function sceneSvg(theme) {
  const id = 'scene-' + (++sceneSequence);
 const scenes = {
  library:`<path d="M78 198V80h145v118M477 198V80h145v118" fill="#292238" stroke="#d0a966" stroke-width="5"/><path d="M98 110h105M98 145h105M98 180h105M497 110h105M497 145h105M497 180h105" stroke="#d0a966" stroke-width="4"/><path d="M293 211V91a57 57 0 0 1 114 0v120" fill="#654b77" stroke="#edca78" stroke-width="5"/><path d="M350 50v75m-28-37h56" stroke="#fff0b0" stroke-width="3"/><circle cx="350" cy="105" r="13" fill="#f2d27b" opacity=".8"/><g fill="#f8e6b0"><circle cx="280" cy="42" r="2"/><circle cx="430" cy="62" r="3"/><circle cx="251" cy="122" r="2"/><circle cx="445" cy="145" r="2"/></g><path d="M0 211h700" stroke="#c69d64" stroke-width="3" opacity=".55"/>`,
  observatory:`<g fill="#f6d17b"><circle cx="91" cy="52" r="3"/><circle cx="164" cy="91" r="2"/><circle cx="246" cy="36" r="3"/><circle cx="426" cy="49" r="2"/><circle cx="580" cy="79" r="3"/><circle cx="632" cy="33" r="2"/></g><circle cx="350" cy="102" r="62" fill="none" stroke="#83b9e5" stroke-width="2" opacity=".6"/><circle cx="350" cy="102" r="37" fill="none" stroke="#e3c879" stroke-width="2" opacity=".55"/><circle cx="350" cy="102" r="13" fill="#e4c973" opacity=".8"/><path d="M87 212V144l45-43 45 43v68M530 212v-67l44-43 44 43v67" fill="#202c47" stroke="#7ba4d8" stroke-width="4"/><path d="M105 212v-46q27-42 54 0v46M548 212v-46q26-42 52 0v46" fill="#477099"/><path d="M252 215l97-116 32 17-73 111" fill="#607ea7" stroke="#e5ca79" stroke-width="4"/><circle cx="354" cy="109" r="14" fill="#e5ca79"/>`,
  laboratory:`<g fill="#a0dfac" opacity=".65"><path d="M80 212Q39 143 70 93Q113 139 80 212ZM120 212Q109 130 166 82Q177 153 120 212ZM622 212Q587 139 632 95Q664 148 622 212ZM575 212Q561 133 517 89Q502 163 575 212Z"/><path d="M74 212l20-96m-6 96 64-102m470 102-12-92m-35 92-40-101" fill="none" stroke="#4b9e75" stroke-width="4"/></g><path d="M274 75h47m-37 0v44l-35 76q-7 16 13 16h72q20 0 13-16l-35-76V75m-51 92h73" fill="#69c2ad" fill-opacity=".25" stroke="#c1edc2" stroke-width="5"/><path d="M273 167h74" stroke="#f2d66c" stroke-width="6"/><path d="M437 85c-44 33 44 51 0 84s44 50 0 80m22-164c44 33-44 51 0 84s-44 50 0 80" fill="none" stroke="#df83c3" stroke-width="5"/><g fill="#d0f1bb"><circle cx="222" cy="81" r="3"/><circle cx="469" cy="52" r="4"/><circle cx="397" cy="139" r="3"/></g>`,
  ruins:`<circle cx="550" cy="58" r="31" fill="#f2cf7b" opacity=".8"/><path d="M74 213l119-119 120 119zM332 213l94-91 93 91z" fill="#7f6042" stroke="#cfaa70" stroke-width="4"/><path d="M192 94l-26 81h52zM426 122l-22 59h44z" fill="#d0aa70" opacity=".7"/><path d="M89 212V126h31v86m27 0V109h30v103m239 0v-76h30v76m31 0v-95h30v95" fill="#57443a" stroke="#d0aa70" stroke-width="4"/><path d="M55 212h585" stroke="#e4c17b" stroke-width="4"/><g fill="#f6dfa9"><circle cx="113" cy="68" r="2"/><circle cx="303" cy="51" r="3"/><circle cx="635" cy="118" r="2"/></g>`,
  mountains:`<circle cx="560" cy="57" r="28" fill="#f2d487" opacity=".75"/><path d="M12 215L146 66l133 149zM174 215L335 39l157 176zM414 215L552 83l138 132z" fill="#294956" stroke="#8bbdc0" stroke-width="4"/><path d="M114 103l32-37 34 38-23-9-12 14-12-15zM293 86l42-47 45 51-30-13-15 17-15-18zM519 116l33-33 34 33-23-9-11 11-12-12z" fill="#d9eddf"/><path d="M0 213Q135 165 252 211t248 0 200 4v35H0z" fill="#327780"/><path d="M0 231q125-35 250 0t250 0 200 0" fill="none" stroke="#9de0d3" stroke-width="5" opacity=".75"/><g fill="#e8d18a"><circle cx="74" cy="45" r="2"/><circle cx="390" cy="72" r="2"/><circle cx="649" cy="54" r="3"/></g>`
 };

   return '<svg viewBox="0 0 900 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="'+id+'-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7890a1"/><stop offset=".48" stop-color="#364957"/><stop offset="1" stop-color="#171f25"/></linearGradient><radialGradient id="'+id+'-light"><stop stop-color="#ffe7a7" stop-opacity=".26"/><stop offset="1" stop-color="#ffe7a7" stop-opacity="0"/></radialGradient><linearGradient id="'+id+'-floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#28332e"/><stop offset="1" stop-color="#111815"/></linearGradient></defs><rect width="900" height="340" fill="url(#'+id+'-sky)"/><circle cx="450" cy="135" r="230" fill="url(#'+id+'-light)"/><g fill="#fff0bd" opacity=".75"><circle cx="85" cy="48" r="2"/><circle cx="191" cy="76" r="1.5"/><circle cx="310" cy="39" r="2"/><circle cx="670" cy="58" r="2"/><circle cx="822" cy="90" r="1.5"/></g><g transform="translate(0 0) scale(1.285 1.36)">'+scenes[theme]+'</g><path d="M0 267h900v73H0z" fill="url(#'+id+'-floor)" opacity=".88"/><path d="M0 267h900" stroke="#ffe5a7" stroke-opacity=".42" stroke-width="3"/><path d="M0 312q145-30 293 0t307 0 300 0" fill="none" stroke="#ffffff" stroke-opacity=".1" stroke-width="2"/></svg>';
}
/**
 * Busca as matérias na API e monta um cartão de entrada para cada mundo.
 * Cada cartão mostra cenário, herói, lista de monstros e botão de início.
 */
async function loadSubjects() {
  try {
    const subjects = await api('/api/subjects');
    const grid = document.querySelector('#subject-grid');

    grid.innerHTML = '';

    subjects.forEach((subject, index) => {
      const world = WORLDS[subject.name];
      const card = document.createElement('article');

      card.className = 'subject-card';
      card.style.setProperty('--accent', subject.color);
      card.innerHTML =
        '<div class="world-art" data-world="' + world.scene.theme + '">' +
          '<div class="world-art-scene">' + sceneSvg(world.scene.theme) + '</div>' +
          '<span class="world-number">MUNDO 0' + (index + 1) + ' <i>·</i> 5 FASES</span>' +
          '<div class="subject-avatar">' + figureSvg(world.hero) + '</div>' +
        '</div>' +
        '<div class="world-card-copy">' +
          '<span class="world-label">' + subject.icon + ' ' + subject.name.toUpperCase() + '</span>' +
          '<h3>' + world.hero.name + '</h3>' +
          '<p class="hero-card-name">' + (world.hero.role || subject.role) + '</p>' +
          '<p class="world-location">' + world.scene.name + '</p>' +
          '<details class="monster-roster">' +
            '<summary>Conhecer monstros e chefe final</summary>' +
            '<ol>' +
              world.monsters.map((monster, monsterIndex) =>
                '<li class="' + (monsterIndex === 4 ? 'final-boss' : '') + '">' +
                  (monsterIndex === 4 ? '<span>♛ CHEFE FINAL</span>' : '') +
                  '<b>' + monster.name + '</b>' +
                '</li>'
              ).join('') +
            '</ol>' +
          '</details>' +
          '<button class="subject-enter">Entrar neste mundo <span>→</span></button>' +
        '</div>';

      card.querySelector('.subject-enter').addEventListener('click', () => {
        startSubject(subject, world);
      });

      grid.append(card);
    });
  } catch (error) {
    document.querySelector('#subject-grid').innerHTML =
      '<p class="loading">Não foi possível conectar à API Java. Atualize para tentar novamente.</p>';
  }
}

/**
 * Zera o progresso anterior, prepara o cenário e inicia a matéria escolhida.
 * @param {object} subject Dados da matéria recebidos da API.
 * @param {object} world Dados visuais locais do herói, cenário e monstros.
 */
async function startSubject(subject, world) {
  clearInterval(state.timer);

  Object.assign(state, {
    subject,
    world,
    xp: 0,
    correct: 0,
    answered: 0,
    streak: 0,
    bestStreak: 0,
    monsterHits: 0,
    bossHits: 0,
    wrongAnswers: [],
    monstersDefeated: 0,
    bossQuestions: 0,
    finalBattle: false,
    heroHp: 100,
    bossHp: 100,
    endReason: null,
    seen: new Set()
  });

  document.querySelector('#hero-name').textContent = world.hero.name.toUpperCase();
  document.querySelector('#hero-role').textContent = world.hero.role || subject.role;
  document.querySelector('#hero-avatar').innerHTML = figureSvg(world.hero);
  document.querySelector('#hero-avatar').setAttribute('aria-label', world.hero.name);

  document.querySelector('#arena').dataset.world = world.scene.theme;
  document.querySelector('#scene-label').textContent = world.scene.name;
  document.querySelector('#scene-illustration').innerHTML = sceneSvg(world.scene.theme);
  document.body.dataset.world = world.scene.theme;
  document.querySelector('#scene-items').innerHTML = world.scene.decor
    .map((item, index) =>
      '<span class="scene-object scene-object-' + (index + 1) + '">' + item + '</span>'
    )
    .join('');

  document.querySelector('#game-subject').textContent = subject.name.toUpperCase();
  document.querySelector('#aside-subject').textContent = subject.name;
  document.querySelector('.game-layout').classList.remove('hidden');
  document.querySelector('#phase-results').classList.add('hidden');

  show('game');
  await loadQuestion();
}

/**
 * Pede uma pergunta inédita à API e atualiza a arena para o monstro atual.
 * A API recebe os IDs já vistos para evitar repetir perguntas na partida.
 */
async function loadQuestion() {
  clearInterval(state.timer);
  state.locked = false;
  document.querySelector('#feedback').textContent = 'Escolha uma resposta para atacar.';
  document.querySelector('#options').innerHTML = '';
  document.querySelector('#hint-button').disabled = false;
  document.querySelector('#hint-button').classList.remove('hidden');
  document.querySelector('#next-button').classList.add('hidden');

  try {
    const finalBattle = state.monstersDefeated >= 4;
    const difficulty = finalBattle ? 'medium' : 'easy';
    const subject = encodeURIComponent(state.subject.name);
    const exclude = encodeURIComponent([...state.seen].join(','));
    const url = '/api/question?subject=' + subject + '&difficulty=' + difficulty + '&exclude=' + exclude;
    const question = await api(url);
    state.seen.add(question.id);
    state.question = question;
    state.finalBattle = finalBattle;

    const monsterIndex = Math.min(state.monstersDefeated, 4);
    const monster = state.world.monsters[monsterIndex];
    if (!finalBattle && state.monsterHits === 0) state.bossHp = 100;

    const arena = document.querySelector('#arena');
    const bossAvatar = document.querySelector('#boss-avatar');
    const roundPill = document.querySelector('#round-pill');
    const kicker = document.querySelector('#question-kicker');
    const reward = document.querySelector('#reward');

    arena.classList.toggle('final-battle', finalBattle);
    bossAvatar.innerHTML = figureSvg(monster, true);
    bossAvatar.classList.remove('hit');
    bossAvatar.setAttribute('aria-label', monster.name);

    document.querySelector('#boss-name').textContent = monster.name.toUpperCase();
    document.querySelector('#boss-role').textContent = finalBattle
      ? 'CHEFE FINAL · 5 VIDAS'
      : 'MONSTRO ' + (state.monstersDefeated + 1) + ' DE 4';
    document.querySelector('#boss-health').style.width = state.bossHp + '%';
      document.querySelector('#hero-hp-value').textContent = state.heroHp + ' / 100';
      document.querySelector('#boss-hp-value').textContent = state.bossHp + ' / 100';

    kicker.textContent = finalBattle
      ? 'BATALHA FINAL · PERGUNTA MÉDIA ' + (state.bossHits + 1) + '/5'
      : 'PERGUNTA DO MESTRE';
    kicker.classList.toggle('final-kicker', finalBattle);
    document.querySelector('#feedback').textContent = finalBattle
      ? 'Acerte cinco perguntas médias para vencer o chefe final.'
      : 'Escolha uma resposta para atacar.';
    document.querySelector('#question-text').textContent = question.prompt;
    reward.textContent = '+' + question.exp + ' XP';
    reward.classList.toggle('medium-reward', finalBattle);

    roundPill.textContent = finalBattle
      ? 'CHEFE FINAL · ' + (state.bossHits + 1) + '/5'
      : 'DESAFIO ' + (state.monstersDefeated + 1);
    roundPill.classList.toggle('final-round', finalBattle);
    document.querySelector('#phase-label').textContent = finalBattle
      ? 'CHEFE FINAL · ' + (state.bossHits + 1) + '/5'
      : 'FASE ' + (state.monstersDefeated + 1) + ' / 5';

    question.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'option';
      button.innerHTML = '<span class="letter">' + letters[index] + '</span>' + option;
      button.addEventListener('click', () => submitAnswer(index, button));
      document.querySelector('#options').append(button);
    });

    startTimer();
    updateProgress();
  } catch (error) {
    if(error.status===410){
      state.endReason=error.message;
      state.question=null;
      document.querySelector('#feedback').textContent=state.endReason;
      document.querySelector('#hint-button').classList.add('hidden');
      const nextButton=document.querySelector('#next-button');
      nextButton.textContent='VER RESULTADO →';
      nextButton.classList.remove('hidden');
      return;
    }
    toast('Erro ao carregar pergunta. Confira o servidor.');
  }
}
/**
 * Inicia a contagem de 30 segundos e envia uma resposta vazia quando o tempo acaba.
 */
function startTimer() {
  state.seconds = 30;
  document.querySelector('#timer').textContent = state.seconds;

  state.timer = setInterval(() => {
    state.seconds--;
    document.querySelector('#timer').textContent = state.seconds;

    if (state.seconds <= 0) {
      submitAnswer(-1, null);
    }
  }, 1000);
}
/**
 * Envia a escolha à API, atualiza as vidas e registra erros para a revisão final.
 * @param {number} index Índice da alternativa; -1 indica que o tempo acabou.
 * @param {HTMLButtonElement|null} button Botão escolhido pelo jogador.
 */
async function submitAnswer(index, button) {
  if (state.locked) return;
  state.locked = true;
  clearInterval(state.timer);
  const buttons = [...document.querySelectorAll('.option')];
  buttons.forEach((item) => item.disabled = true);

  try {
    const result = await api('/api/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: state.question.id, selectedOption: index })
    });
    const wasFinal = state.finalBattle;
    const opponent = state.world.monsters[Math.min(state.monstersDefeated, 4)];
    state.answered++;
    if (wasFinal) state.bossQuestions++;

    if (result.correct) {
      state.correct++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      state.xp += result.gainedExp;
      if (wasFinal) {
        state.bossHits++;
        state.bossHp = Math.max(0, 100 - state.bossHits * 20);
        document.querySelector('#feedback').textContent = state.bossHits >= 5
          ? 'Você derrotou ' + opponent.name + '! +' + result.gainedExp + ' XP!'
          : 'Acerto! Faltam ' + (5 - state.bossHits) + ' acertos para vencer o chefe. +' + result.gainedExp + ' XP!';
       } else {
        state.monsterHits++;
        state.bossHp = Math.max(0, 100 - Math.round(state.monsterHits * 100 / 3));
        if (state.monsterHits >= 3) {
          state.monstersDefeated++;
          state.monsterHits = 0;
          document.querySelector('#feedback').textContent = 'Você derrotou ' + opponent.name + '! +' + result.gainedExp + ' XP!';
          if (state.monstersDefeated >= 4) state.bossHp = 100;
         } else {
          document.querySelector('#feedback').textContent = 'Acerto! Faltam ' + (3 - state.monsterHits) + ' acertos para derrotar ' + opponent.name + '. +' + result.gainedExp + ' XP!';
        }
      }
      if (button) button.classList.add('correct');
      document.querySelector('.boss-avatar').classList.add('hit');
      document.querySelector('#boss-health').style.width = state.bossHp + '%';
     } else {
      state.streak = 0;
      state.heroHp = Math.max(0, state.heroHp - result.playerDamage);
      state.wrongAnswers.push({
        prompt: state.question.prompt,
        selected: index >= 0 ? state.question.options[index] : 'Tempo esgotado',
        correct: state.question.options[result.correctOption]
      });
      if (button) button.classList.add('wrong');
      document.querySelector('#feedback').textContent = index < 0
        ? (wasFinal ? 'Tempo esgotado. O chefe final contra-atacou.' : 'Tempo esgotado. O monstro atacou.')
        : (wasFinal ? 'Resposta incorreta. O chefe final contra-atacou.' : 'Resposta incorreta. O monstro atacou.');
      document.querySelector('.hero-character .avatar').classList.add('hit');
      document.querySelector('#hero-health').style.width = state.heroHp + '%';
      if(state.heroHp<=0){state.endReason='Seu herói ficou sem vida. A fase terminou.';document.querySelector('#feedback').textContent+=' Seu herói ficou sem vida.';}
    }

    buttons.forEach((item, optionIndex) => {
      if (optionIndex === result.correctOption) item.classList.add('correct');
    });
    document.querySelector('#hint-button').classList.add('hidden');
    const nextButton = document.querySelector('#next-button');
    nextButton.classList.remove('hidden');
    nextButton.textContent = state.heroHp<=0
      ? 'VER RESULTADO →'
      : wasFinal
      ? (state.bossHits >= 5 ? 'VER RESULTADO →' : 'CHEFE · ' + (5 - state.bossHits) + ' VIDAS RESTANTES →')
      : (state.monstersDefeated >= 4 ? 'INVOCAR CHEFE FINAL →' : state.monsterHits === 0 ? 'PRÓXIMO DESAFIO →' : 'ATACAR DE NOVO · ' + state.monsterHits + '/3 ACERTOS →');
    updateProgress();
  } catch (error) {
    state.locked = false;
    buttons.forEach((item) => item.disabled = false);
    toast('Não foi possível enviar sua resposta.');
  }
}

/** Atualiza os indicadores de experiência, acertos, sequência e vida. */
function updateProgress() {
  document.querySelector('#xp').textContent = state.xp;
  document.querySelector('#xp-fill').style.width = (state.xp % 300 / 3) + '%';
  document.querySelector('#correct-count').textContent = state.correct;
  document.querySelector('#challenge-count').textContent = state.monstersDefeated < 4
    ? 'Monstro ' + (state.monstersDefeated + 1) + ' · ' + state.monsterHits + ' / 3 acertos'
    : 'Chefe ' + state.bossHits + ' / 5 vidas · ' + state.bossQuestions + ' perguntas';
  document.querySelector('#streak-count').textContent = state.streak + ' em sequência';
  document.querySelector('#hero-health').style.width = state.heroHp + '%';
  document.querySelector('#hero-hp-value').textContent = state.heroHp + ' / 100';
  document.querySelector('#boss-hp-value').textContent = state.bossHp + ' / 100';
}
/** Calcula o aproveitamento e mostra o resultado, incluindo respostas erradas. */
function finish() {
  clearInterval(state.timer);
  const won = state.bossHits >= 5;
  const accuracy = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
  const grade = accuracy >= 90 ? { title: 'Mestre da matéria', message: 'Excelente domínio! Você está pronto para outro desafio.', mark: '★' }
    : accuracy >= 70 ? { title: 'Grande explorador', message: 'Você entendeu bem o conteúdo e está avançando com confiança.', mark: '✦' }
    : accuracy >= 50 ? { title: 'Aprendiz dedicado', message: 'Bom começo! Revise alguns tópicos e tente novamente.', mark: '◆' }
    : { title: 'Sua jornada começou', message: 'Cada tentativa ensina algo. Revise a matéria e volte mais forte.', mark: '✧' };
  document.querySelector('.game-layout').classList.add('hidden');
  const results = document.querySelector('#phase-results');
  results.classList.remove('hidden');
  results.dataset.world = state.world.scene.theme;
  document.querySelector('#result-mark').textContent = grade.mark;
  document.querySelector('#result-eyebrow').textContent = won ? 'MUNDO CONQUISTADO' : 'FASE ENCERRADA';
  document.querySelector('#result-title').textContent = grade.title;
  document.querySelector('#result-message').textContent = state.endReason || grade.message;
  document.querySelector('#result-subject').textContent = state.subject.name;
  document.querySelector('#result-accuracy').textContent = accuracy + '%';
  document.querySelector('#result-correct').textContent = state.correct + ' de ' + state.answered;
  document.querySelector('#result-xp').textContent = state.xp + ' XP';
  document.querySelector('#result-streak').textContent = state.bestStreak;
  document.querySelector('#result-boss').textContent = won ? 'Chefe derrotado: ' + state.world.monsters[4].name : 'Chefe: ' + state.world.monsters[4].name;
  document.querySelector('#result-progress').style.width = accuracy + '%';
  const wrongSection = document.querySelector('#wrong-answers');
  const wrongList = document.querySelector('#wrong-answer-list');
  wrongList.innerHTML = '';
  wrongSection.classList.toggle('hidden', state.wrongAnswers.length === 0);
  state.wrongAnswers.forEach((entry, index) => {
    const item = document.createElement('article');
    item.className = 'wrong-answer-item';
    const question = document.createElement('b');
    question.textContent = (index + 1) + '. ' + entry.prompt;
    const selected = document.createElement('p');
    selected.textContent = 'Sua resposta: ' + entry.selected;
    const answer = document.createElement('p');
    answer.className = 'right-answer';
    answer.textContent = 'Resposta correta: ' + entry.correct;
    item.append(question, selected, answer);
    wrongList.append(item);
  });
  document.querySelector('#all-correct-note').classList.toggle('hidden', state.wrongAnswers.length > 0);
}

/**
 * Mostra a dica da pergunta atual e impede que ela seja acionada novamente.
 */
function useHint() {
  if (!state.question || state.locked) {
    return;
  }

  document.querySelector('#feedback').textContent =
    'Dica do mestre: ' + state.question.hint;
  document.querySelector('#hint-button').disabled = true;
}

/**
 * Registra os cliques dos botões das telas e da batalha.
 * Os callbacks encerram o cronômetro quando o jogador sai ou troca de matéria.
 */
function bindEvents() {
  // Navegação entre início e lobby.
  document.querySelector('#begin-button').addEventListener('click', () => {
    show('select');
  });

  document.querySelector('#home-button').addEventListener('click', () => {
    clearInterval(state.timer);
    show('home');
  });

  document.querySelectorAll('[data-screen="home"]').forEach((button) => {
    button.addEventListener('click', () => show('home'));
  });

  // Ações disponíveis durante a matéria.
  document.querySelector('#change-subject').addEventListener('click', () => {
    clearInterval(state.timer);
    show('select');
  });

  document.querySelector('#leave-button').addEventListener('click', () => {
    clearInterval(state.timer);
    show('select');
  });

  document.querySelector('#hint-button').addEventListener('click', useHint);

  document.querySelector('#restart-button').addEventListener('click', () => {
    if (state.subject) {
      startSubject(state.subject, state.world);
    }
  });

  document.querySelector('#next-button').addEventListener('click', () => {
    if (state.bossHits >= 5 || state.heroHp <= 0 || state.endReason) {
      finish();
      return;
    }

    loadQuestion();
  });

  // Botões de repetição ou retorno ao lobby na tela de resultados.
  document.querySelector('#result-retry').addEventListener('click', () => {
    if (state.subject) {
      startSubject(state.subject, state.world);
    }
  });

  document.querySelector('#result-lobby').addEventListener('click', () => {
    document.querySelector('#phase-results').classList.add('hidden');
    document.querySelector('.game-layout').classList.remove('hidden');
    show('select');
  });
}

/** Prepara os controles e carrega o lobby ao abrir o jogo. */
bindEvents();
loadSubjects();