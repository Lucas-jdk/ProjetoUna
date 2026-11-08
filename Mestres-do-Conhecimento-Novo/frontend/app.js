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
  routeChoice: null,
  journeyPending: false,
  timeBonus: 0,
  bossPowerUsed: false,
  challengeMode: null,
  finishing: false,
  finishSequence: 0,
  seen: new Set()
};

/** Letras mostradas ao lado das quatro alternativas de resposta. */
const letters = ['A', 'B', 'C', 'D'];
/** Regras curtas que fazem cada encontro comum pedir um ritmo diferente. */
const CHALLENGE_MODES = [
  { name: 'Duelo de abertura', time: 30, bonusXp: 0, heal: 0, rule: '30 segundos para observar e responder.' },
  { name: 'Prova da atenção', time: 27, bonusXp: 10, heal: 0, rule: 'Respostas corretas rendem 10 XP extras.' },
  { name: 'Corrida arcana', time: 22, bonusXp: 15, heal: 0, rule: 'O relógio corre: cada acerto vale 15 XP extras.' },
  { name: 'Defesa da trilha', time: 28, bonusXp: 0, heal: 8, rule: 'Cada acerto recupera 8 pontos de vida.' }
];

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
      stages: ['Jardins da Biblioteca', 'Galeria dos Livros Vivos', 'Escadaria das Fábulas', 'Câmara das Páginas Perdidas', 'Santuário da Gramática'],
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
        mark: 'G',
        power: { name: 'Sopro incendiário', description: 'Erros contra o dragão causam 10 pontos extras de dano.', type: 'burn' }
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
      stages: ['Pátio dos Números', 'Passarela das Constelações', 'Cúpula dos Planetas', 'Núcleo das Órbitas', 'Trono do Infinito'],
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
        mark: '∞',
        power: { name: 'Cabeças em rotação', description: 'O terceiro acerto contra a hidra rende 25 XP extras.', type: 'combo' }
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
      stages: ['Trilha das Sementes', 'Jardim das Células', 'Lago das Esporas', 'Raízes Luminescentes', 'Coração da Entropia'],
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
        mark: '⚗',
        power: { name: 'Núcleo regenerativo', description: 'Seu primeiro acerto contra o titã recupera 15 pontos de vida.', type: 'heal' }
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
      stages: ['Estrada dos Estandartes', 'Praça das Colunas', 'Templo das Areias', 'Salão dos Relógios', 'Trono de Cronos'],
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
        mark: '⌛',
        power: { name: 'Rebobinar o tempo', description: 'Na primeira resposta errada, Cronos devolve 10 segundos ao relógio.', type: 'rewind' }
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
      stages: ['Vale dos Ventos', 'Trilha das Nuvens', 'Ponte sobre o Abismo', 'Encosta da Tempestade', 'Cume da Guardiã'],
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
        mark: '✿',
        power: { name: 'Raízes ancestrais', description: 'A primeira resposta errada é absorvida pelas raízes de Gaia.', type: 'shield' }
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

/** Remove e reinicia movimentos para que possam ser tocados novamente. */
const characterMotionTimers = new WeakMap();
function clearCharacterMotion(element) {
  if (!element) return;
  const pending = characterMotionTimers.get(element);
  if (pending) window.clearTimeout(pending);
  characterMotionTimers.delete(element);
  element.classList.remove('motion-attack', 'motion-damage', 'motion-victory', 'motion-defeat');
}

/** Reproduz a reação visual sem alterar vida, acerto ou qualquer regra da partida. */
function animateCharacter(selector, motion) {
  const element = document.querySelector(selector);
  if (!element || !['attack', 'damage', 'victory', 'defeat'].includes(motion)) return;
  clearCharacterMotion(element);
  void element.offsetWidth;
  element.classList.add('motion-' + motion);
  const timer = window.setTimeout(() => {
    element.classList.remove('motion-' + motion);
    characterMotionTimers.delete(element);
  }, motion === 'victory' || motion === 'defeat' ? 1050 : 720);
  characterMotionTimers.set(element, timer);
}

/** Desenha um personagem completo em SVG, com gradientes internos exclusivos. */
function figureSvg(person, isMonster = false) {
  const safeColor = (value, fallback) => /^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback;
  const p = safeColor(person.primary, '#8060a8');
  const s = safeColor(person.secondary, '#342c4a');
  const a = safeColor(person.accent, '#f2cd76');
  const kind = /^[a-z]+$/i.test(person.kind || '') ? person.kind : 'golem';
  const id = 'figure-' + (++figureSequence);
  const boss = Boolean(isMonster && person.power);
  const name = String(person.name || '').toLocaleLowerCase('pt-BR');
  const mark = String(person.mark || '✦').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
  })[character]);

  const heroes = {
    scribe: {
      cape: '<path d="M80 101Q55 111 60 151l-11 44q27 14 54-3l8-47m29-44q25 11 20 50l11 44q-27 14-54-3l-8-47" fill="@S@" stroke="#33273d" stroke-width="4"/><path d="M64 148l-5 38 20 7 8-46m47-1 8 40-18 8-9-47" fill="none" stroke="@A@" stroke-width="3"/>',
      coat: '<path d="M78 103q32-17 64 0l17 64q-49 23-98 0z" fill="@BODY@" stroke="#33273d" stroke-width="4"/><path d="M80 107l30 23 30-23-8 24-22 15-22-15z" fill="#eee1ef" stroke="#33273d" stroke-width="3"/><path d="M93 146l17 12 17-12-6 31h-22z" fill="@S@" opacity=".8"/><path d="M76 165q34 12 68 0l-3 12q-31 14-62 0z" fill="@A@" stroke="#33273d" stroke-width="3"/><path d="M85 119l-7 36m57-36 7 36" stroke="#fff2d2" stroke-width="2"/>',
      hair: '<path d="M81 66q-8-35 28-43 34 3 34 36-16-12-31-8-18-7-31 15z" fill="#54376b" stroke="#33273d" stroke-width="3"/><path d="M83 57q-13 4-8 22l7 18 9-7m50-33q15 4 9 22l-8 18-10-7m4-8q22 11 11 35-8 11-17 2" fill="#65447c" stroke="#33273d" stroke-width="3"/>',
      hat: '<path d="M73 56q-6-22 2-34l35-15 35 15q7 18 0 34l-11-7-24-24-25 25z" fill="@P@" stroke="#33273d" stroke-width="4"/><path d="M71 50L52 61l32 6m58-17 19 11-32 6" fill="@S@" stroke="#33273d" stroke-width="3"/><path d="M109 17l-8 16 10-3 8 9 6-16" fill="@A@" stroke="#fff1cc" stroke-width="2"/>',
      prop: '<path d="M158 138q22-8 29 8l-7 34-28-4z" fill="#80583f" stroke="#372c3c" stroke-width="4"/><path d="M158 145l22 4m-24 7 20 3m-17 7 16 2" stroke="#f4dda4" stroke-width="3"/>',
      detail: '<path d="M93 119l17 12 17-12m-37 52 20 7 20-7" fill="none" stroke="@A@" stroke-width="3"/>',
      eyes: '#463553'
    },
    sage: {
      cape: '<path d="M81 101q-25 12-27 42l-9 47q24 13 51 2l14-49m30-42q25 12 27 42l9 47q-24 13-51 2l-14-49" fill="@S@" stroke="#29364f" stroke-width="4"/><path d="M62 165l18 8-5 19-22-4m106-23-18 8 5 19 22-4" fill="none" stroke="@A@" stroke-width="3"/>',
      coat: '<path d="M78 103q32-15 64 0l17 64q-49 21-98 0z" fill="@BODY@" stroke="#29364f" stroke-width="4"/><path d="M82 109h56l13 57q-41 14-82 0z" fill="#eee9da" stroke="#29364f" stroke-width="3"/><path d="M94 114l16 20 16-20 9 51H85z" fill="@P@" stroke="#29364f" stroke-width="3"/><path d="M78 165q32 10 64 0l4 12q-35 13-72 0z" fill="@S@" stroke="#29364f" stroke-width="3"/>',
      hair: '<path d="M80 57q1-32 30-35 29 3 32 32-14-11-28-8-17-6-34 11z" fill="#d8d9d4" stroke="#45485a" stroke-width="3"/><path d="M81 55q-7 14 0 23m59-23q8 14 0 23m-47 21q17 17 34 0" fill="none" stroke="#b8b9b7" stroke-width="8"/>',
      hat: '<path d="M78 55q4-30 32-34 29 4 33 34l-9 6H87z" fill="@P@" stroke="#29364f" stroke-width="4"/><path d="M83 54h55" stroke="@A@" stroke-width="5"/><circle cx="110" cy="39" r="6" fill="#fff1bc"/>',
      prop: '<path d="M174 81v115m0-115q-12 14-12 27 0 12 12 15 13-3 13-15 0-13-13-27z" fill="none" stroke="#805c43" stroke-width="5"/><path d="M174 74v21m-9-10h18" stroke="@A@" stroke-width="3"/><path d="M162 196h24l-12 13z" fill="@A@" stroke="#45465a" stroke-width="3"/>',
      detail: '<path d="M92 113l18 18 18-18m-35 53 17 6 17-6" fill="none" stroke="@A@" stroke-width="3"/>',
      eyes: '#4a7190'
    },
    scientist: {
      cape: '<path d="M79 103q-23 12-21 43l-4 42 23 10 30-32m38-63q23 12 21 43l4 42-23 10-30-32z" fill="#39735f" stroke="#28463f" stroke-width="4"/><path d="M72 146l26 16-15 20-29-12m94-24-26 16 15 20 29-12" fill="none" stroke="#9ad1aa" stroke-width="4"/>',
      coat: '<path d="M78 102q32-17 64 0l17 64q-49 22-98 0z" fill="@BODY@" stroke="#29473f" stroke-width="4"/><path d="M82 108h56l14 57q-42 14-84 0z" fill="#edf0e2" stroke="#567866" stroke-width="3"/><path d="M96 108h28l-4 44-10 9-10-9z" fill="@P@" stroke="#29473f" stroke-width="3"/><path d="M90 126l20 18 20-18m-46 38q26 8 52 0" fill="none" stroke="@A@" stroke-width="4"/>',
      hair: '<path d="M80 57q0-34 30-36 31 2 32 35-16-12-31-7-18-5-31 8z" fill="#a9533b" stroke="#513841" stroke-width="3"/><path d="M82 48q-15-7-15 8 3 12 16 9m57-17q15-7 15 8-3 12-16 9" fill="#ad5d40" stroke="#513841" stroke-width="3"/><circle cx="77" cy="43" r="10" fill="#d17a4d" stroke="#513841" stroke-width="3"/><circle cx="143" cy="43" r="10" fill="#d17a4d" stroke="#513841" stroke-width="3"/>',
      hat: '<path d="M83 73q8-21 27-21t27 21" fill="none" stroke="@A@" stroke-width="5"/><circle cx="110" cy="53" r="8" fill="#f5cf76" stroke="#3f4b40" stroke-width="3"/><path d="M78 61q-10-5-8 8 3 8 10 5m61-13q10-5 8 8-3 8-10 5" fill="none" stroke="@A@" stroke-width="4"/>',
      prop: '<path d="M164 147h23v24q-4 9-12 9t-11-9z" fill="#b9ddc2" stroke="#2e4a43" stroke-width="3"/><path d="M164 158h23m-17-18v-8h12v8m-10 28q5-8 10 0" fill="none" stroke="#f4d479" stroke-width="3"/>',
      detail: '<path d="M96 111l14 18 14-18m-29 44q15 8 30 0" fill="none" stroke="@A@" stroke-width="3"/>',
      eyes: '#477d68'
    },
    chronicle: {
      cape: '<path d="M78 101q-24 11-22 43l-5 44q24 17 54 4l14-48m38-43q24 11 22 43l5 44q-24 17-54 4l-14-48z" fill="#985d40" stroke="#49353c" stroke-width="4"/><path d="M64 150l19 13-13 22-24-10m110-25-19 13 13 22 24-10" fill="none" stroke="@A@" stroke-width="4"/>',
      coat: '<path d="M78 102q32-17 64 0l17 65q-49 22-98 0z" fill="@BODY@" stroke="#49353c" stroke-width="4"/><path d="M82 108l28 22 28-22 13 57q-41 15-82 0z" fill="#c28c4e" stroke="#49353c" stroke-width="3"/><path d="M93 116l17 14 17-14v47H93z" fill="#794a3a" stroke="#49353c" stroke-width="3"/><path d="M82 165q28 11 56 0l5 12q-33 13-66 0z" fill="@A@" stroke="#49353c" stroke-width="3"/>',
      hair: '<path d="M80 57q3-33 30-35 29 2 33 34-14-9-24-4-17-12-39 5z" fill="#874631" stroke="#49333a" stroke-width="3"/><path d="M83 56q-8 14-1 24m54-24q8 14 1 24m-1-52q20-4 17 17" fill="none" stroke="#a95a3f" stroke-width="8" stroke-linecap="round"/>',
      hat: '<path d="M77 58q5-32 33-35 29 3 33 35l-8 7H85z" fill="@P@" stroke="#49333a" stroke-width="4"/><path d="M78 58h64" stroke="@A@" stroke-width="6"/><circle cx="110" cy="43" r="7" fill="#f5e5ad"/>',
      prop: '<path d="M48 141q-12 8-5 19l20 23 18-4-20-28z" fill="#b87549" stroke="#44353c" stroke-width="4"/><path d="M51 148l25 24m-31-18 19 19" stroke="#f1d081" stroke-width="3"/>',
      detail: '<path d="M96 111l14 17 14-17m-31 55 17 6 17-6" fill="none" stroke="@A@" stroke-width="3"/>',
      eyes: '#815a45'
    },
    navigator: {
      cape: '<path d="M78 103q-25 12-22 42l-3 45q25 14 53 4l14-47m39-44q25 12 22 42l3 45q-25 14-53 4l-14-47z" fill="#326f70" stroke="#293d46" stroke-width="4"/><path d="M62 148l27 15-15 17-28-14m110-18-27 15 15 17 28-14" fill="none" stroke="#9cc6a2" stroke-width="4"/>',
      coat: '<path d="M78 102q32-17 64 0l17 65q-49 22-98 0z" fill="@BODY@" stroke="#314149" stroke-width="4"/><path d="M82 108l28 21 28-21 13 57q-41 15-82 0z" fill="#e5d0a4" stroke="#314149" stroke-width="3"/><path d="M91 115h38l8 48H83z" fill="#548a7c" stroke="#314149" stroke-width="3"/><path d="M84 164q26 11 52 0l7 13q-33 13-66 0z" fill="#9b623f" stroke="#314149" stroke-width="3"/>',
      hair: '<path d="M81 57q-3-31 29-37 31 5 33 36-15-10-31-6-16-5-31 7z" fill="#28635f" stroke="#293a44" stroke-width="3"/><path d="M82 53q-12-4-13 9l10 8m61-17q12-4 13 9l-10 8m-59-30-7 24m59-24 7 24" fill="#28635f" stroke="#7a4b3e" stroke-width="4"/>',
      hat: '<path d="M69 58q7-32 41-37 34 5 41 37l-10 8H79z" fill="@P@" stroke="#293a44" stroke-width="4"/><path d="M67 63q43 10 86 0" fill="none" stroke="@A@" stroke-width="6"/><path d="M110 27v25m-9-11 9-14 9 14" fill="none" stroke="#f5dc8d" stroke-width="3"/>',
      prop: '<path d="M47 143q-10 8-3 19l22 20 18-4-23-28z" fill="#497e75" stroke="#293a44" stroke-width="4"/><path d="M51 147l27 26m-33-17 21 22" stroke="#edcf81" stroke-width="3"/><circle cx="180" cy="151" r="17" fill="#e9cc7f" stroke="#3b4847" stroke-width="4"/><path d="M180 136v30m-15-15h30m-26-11 22 22m0-22-22 22" stroke="#478477" stroke-width="2"/>',
      detail: '<path d="M96 111l14 17 14-17m-30 53 16 6 16-6" fill="none" stroke="@A@" stroke-width="3"/>',
      eyes: '#39736d'
    }
  };

  const monsters = {
    ink: { back: '<path d="M75 161q-28 20-21 46 15 9 28-6l14-20m48-20q28 20 21 46-15 9-28-6l-14-20" fill="none" stroke="@S@" stroke-width="14" stroke-linecap="round"/>', body: '<path d="M68 123q-19-21-7-43 14-16 28-3 14-32 31-9 21-24 33 2 25-4 27 27 18 20 0 41l-7 43-24-17-20 24-21-21-26 25-13-36-24 14z" fill="@BODY@" stroke="#2d263c" stroke-width="5"/><path d="M84 137l12 10-8 13m43-23-13 10 8 13" fill="none" stroke="@A@" stroke-width="4"/>', head: '<path d="M83 105q9-18 29-17 26-2 34 19l-9 29-24 13-25-15z" fill="@P@" stroke="#2d263c" stroke-width="4"/>', face: '<ellipse cx="100" cy="117" rx="6" ry="8" fill="#fff1c9"/><ellipse cx="126" cy="117" rx="6" ry="8" fill="#fff1c9"/><circle cx="101" cy="119" r="3" fill="#29243a"/><circle cx="127" cy="119" r="3" fill="#29243a"/><path d="M98 137q12 10 25-1" fill="none" stroke="@A@" stroke-width="4"/>', front: '<path d="M110 149l14 9-14 11-14-11z" fill="#f4c1d4" stroke="#46324b" stroke-width="3"/>' },
    gargoyle: { back: '<path d="M81 105L39 36l43 25 28 32m31 12 42-69-43 25-28 32" fill="@S@" stroke="#303c43" stroke-width="5"/><path d="M49 51l27 34m96-34-27 34" stroke="@A@" stroke-width="3"/>', body: '<path d="M75 113l-17-23 26 9 27-12 27 12 26-9-17 24 6 53q-27 28-57 22-32 6-58-22z" fill="@BODY@" stroke="#303c43" stroke-width="5"/><path d="M80 128l17 12-8 13 21 22 22-22-8-13 17-12" fill="none" stroke="@A@" stroke-width="4"/>', head: '<path d="M80 98L65 59l25 20 20-18 22 18 24-20-16 41q-26 16-55-2z" fill="@BODY@" stroke="#303c43" stroke-width="4"/>', face: '<ellipse cx="99" cy="106" rx="6" ry="8" fill="#ffe09b"/><ellipse cx="127" cy="106" rx="6" ry="8" fill="#ffe09b"/><path d="M91 101l13-7 8 8m7-1 9-7 12 7M98 129l12-2 12 3-10 13z" fill="none" stroke="@A@" stroke-width="4"/>', front: '<path d="M81 150l29-13 29 13m-43 15 14-9 14 9" fill="none" stroke="@S@" stroke-width="5"/>' },
    ghost: { back: '<path d="M76 125q-29 7-40 34 12 16 36 3m76-37q29 7 40 34-12 16-36 3" fill="none" stroke="@P@" stroke-width="15" stroke-linecap="round" opacity=".82"/>', body: '<path d="M72 118q-3-41 38-47 43 5 39 47l18 59-19 18-19-18-19 20-20-20-20 18-19-18z" fill="@BODY@" stroke="#4b3d65" stroke-width="4"/><path d="M84 137q26 13 52 0m-57 23q29 13 60 0" fill="none" stroke="#f5e9ff" stroke-width="3" opacity=".6"/>', head: '<path d="M80 94q0-33 30-34 32 2 32 34l-8 36q-11 14-24 14-19 0-28-14z" fill="@P@" stroke="#4b3d65" stroke-width="4"/>', face: '<ellipse cx="100" cy="102" rx="8" ry="11" fill="#fff6ff"/><ellipse cx="128" cy="102" rx="8" ry="11" fill="#fff6ff"/><ellipse cx="102" cy="106" rx="4" ry="6" fill="#493b61"/><ellipse cx="130" cy="106" rx="4" ry="6" fill="#493b61"/><path d="M99 127q13-10 28 0" fill="none" stroke="#493b61" stroke-width="4"/>', front: '<path d="M88 147q22 9 44 0" stroke="@A@" stroke-width="4" fill="none"/>' },
    raven: { back: '<path d="M91 119Q40 48 21 58q8 45 53 83l29 16m22-38q50-71 70-61-8 45-53 83l-29 16" fill="@S@" stroke="#29283a" stroke-width="5"/><path d="M45 75l39 52m91-52-39 52" stroke="#8486a0" stroke-width="3"/>', body: '<path d="M77 125q9-34 34-34 27 0 36 34l-8 48q-28 20-55 0z" fill="@BODY@" stroke="#29283a" stroke-width="4"/><path d="M85 137l26 23 27-23m-46 17 19 17 20-17" fill="none" stroke="@S@" stroke-width="5"/>', head: '<path d="M83 100q2-31 28-32 32 1 33 33l-9 31-23 13-24-13z" fill="@BODY@" stroke="#29283a" stroke-width="4"/><path d="M131 111l36 11-36 13-11-8z" fill="@A@" stroke="#29283a" stroke-width="3"/>', face: '<ellipse cx="100" cy="108" rx="8" ry="10" fill="#ffdc7a"/><ellipse cx="127" cy="108" rx="8" ry="10" fill="#ffdc7a"/><circle cx="102" cy="109" r="4" fill="#29283a"/><circle cx="129" cy="109" r="4" fill="#29283a"/>', front: '<path d="M91 161l20 8 21-8m-38 11 17 14 17-14" fill="none" stroke="#8486a0" stroke-width="3"/>' },
    dragon: { back: '<path d="M83 126Q46 36 16 52q1 68 64 109zM137 126q37-90 67-74-1 68-64 109z" fill="@S@" stroke="#44313b" stroke-width="5"/><path d="M29 64l47 60m117-60-47 60" stroke="@A@" stroke-width="3"/>', body: '<path d="M81 118q-11-35 29-43 40 8 29 43l21 56q-21 25-50 18-29 7-50-18z" fill="@BODY@" stroke="#44313b" stroke-width="5"/><path d="M82 139q28 14 56 0l-5 37q-22 16-45 0z" fill="#e7c77b" stroke="#65403c" stroke-width="3"/><path d="M91 123l8 6 9-7 9 7 9-6m-34 39 8 6 9-7 9 7 9-6" stroke="@A@" stroke-width="3"/>', head: '<path d="M85 96l-11-34 24 19 13-27 15 27 21-19-9 38q-22 15-43 0z" fill="@P@" stroke="#44313b" stroke-width="4"/><path d="M84 96q4-27 27-27 27 0 29 27l-8 34q-21 20-42 0z" fill="@BODY@" stroke="#44313b" stroke-width="4"/>', face: '<ellipse cx="100" cy="109" rx="6" ry="8" fill="#ffe37a"/><ellipse cx="126" cy="109" rx="6" ry="8" fill="#ffe37a"/><path d="M93 101q8-7 16 0m9 0q8-7 16 0M98 135q13 9 27 0" fill="none" stroke="#583b39" stroke-width="3"/>', front: '<path d="M93 153l7 12 10-8 10 8 9-12m-34 16 7 7 8-5 8 5 8-7" fill="none" stroke="#f4deb1" stroke-width="3"/>' },
    golem: { back: '<path d="M76 124l-35-27-12 48 38 14m77-35 35-27 12 48-38 14" fill="@S@" stroke="#46515c" stroke-width="5"/><path d="M47 108l24 27m102-27-24 27" stroke="#bec6c5" stroke-width="3"/>', body: '<path d="M70 113l14-24h52l14 24 5 56q-26 27-55 20-30 7-55-20z" fill="@BODY@" stroke="#46515c" stroke-width="5"/><path d="M80 128l22 13-15 18 23 24 23-24-15-18 22-13" fill="none" stroke="@S@" stroke-width="6"/><path d="M110 130l-12 22 13 1-8 20 24-29-13-1 8-13z" fill="@A@" stroke="#46515c" stroke-width="2"/>', head: '<path d="M78 99l-8-26 21 12 19-18 21 18 20-12-9 28-30 10z" fill="@BODY@" stroke="#46515c" stroke-width="4"/><path d="M83 97h54l-3 37q-11 17-24 17-14 0-24-17z" fill="@P@" stroke="#46515c" stroke-width="4"/>', face: '<circle cx="100" cy="115" r="7" fill="@A@"/><circle cx="127" cy="115" r="7" fill="@A@"/><path d="M91 108l12-7 8 8m7-1 8-7 12 7m-38 34h31" fill="none" stroke="#46515c" stroke-width="5" stroke-linecap="round"/>', front: '<path d="M88 166l22 8 22-8" fill="none" stroke="#c5c9c5" stroke-width="3"/>' },
    sphinx: { back: '<path d="M82 127Q46 55 24 69q8 59 55 91m63-33q36-72 57-58-8 59-54 91" fill="@S@" stroke="#51403b" stroke-width="4"/>', body: '<path d="M76 119q34-24 68 0l17 57q-26 24-51 18-26 6-51-18z" fill="@BODY@" stroke="#51403b" stroke-width="4"/><path d="M81 139q29 16 58 0m-55 18q27 15 54 0" fill="none" stroke="@A@" stroke-width="5"/><path d="M92 157l18-11 18 11-18 25z" fill="#efcf87" stroke="#51403b" stroke-width="3"/>', head: '<path d="M81 97l-13-33 26 20 16-19 17 19 25-20-12 38-29 13z" fill="@S@" stroke="#51403b" stroke-width="4"/><path d="M84 97q2-28 26-28 26 0 28 28l-8 36q-10 14-20 14-12 0-21-14z" fill="#e6b486" stroke="#51403b" stroke-width="4"/>', face: '<ellipse cx="101" cy="112" rx="5" ry="7" fill="#fff0a9"/><ellipse cx="127" cy="112" rx="5" ry="7" fill="#fff0a9"/><circle cx="102" cy="113" r="3" fill="#51403b"/><circle cx="128" cy="113" r="3" fill="#51403b"/><path d="M99 132q12 8 25 0" fill="none" stroke="#7b4b3d" stroke-width="3"/>', front: '<path d="M91 152l19 9 19-9" fill="none" stroke="#f5da91" stroke-width="4"/>' },
    serpent: { back: '<path d="M74 172q-48 23-38 53 16 15 37 1l21-24m47-30q48 23 38 53-16 15-37 1l-21-24" fill="none" stroke="@S@" stroke-width="18" stroke-linecap="round"/>', body: '<path d="M77 164q-35-10-30-37 5-23 27-19 22 2 39 22 20 22 42 5 18-13 6-35-5-11-19-15" fill="none" stroke="@BODY@" stroke-width="27" stroke-linecap="round"/><path d="M83 157q-23-12-22-28m53 17q22 7 40-7m8-30-12-11" fill="none" stroke="@A@" stroke-width="4"/>', head: '<path d="M116 119q-12-34 18-50 31 5 33 33l-12 25-29 5z" fill="@BODY@" stroke="#3a4850" stroke-width="4"/><path d="M126 80l-8-25 20 15m20-3 14-22-3 29" fill="@P@" stroke="#3a4850" stroke-width="4"/>', face: '<ellipse cx="143" cy="90" rx="6" ry="9" fill="#e8f59b"/><ellipse cx="161" cy="93" rx="6" ry="8" fill="#e8f59b"/><path d="M143 87v7m18-4v7m-25 12q13 7 24 0" stroke="#34434a" stroke-width="3" fill="none"/>', front: '<path d="M80 150q25 12 44 9m17-27 9-12" fill="none" stroke="#d8efaa" stroke-width="3"/>' },
    automaton: { back: '<path d="M79 122l-30 12 7 38 26-5m58-45 30 12-7 38-26-5" fill="@S@" stroke="#42414a" stroke-width="5"/><circle cx="57" cy="156" r="11" fill="@A@" stroke="#42414a" stroke-width="4"/><circle cx="163" cy="156" r="11" fill="@A@" stroke="#42414a" stroke-width="4"/>', body: '<path d="M77 117l13-13h40l13 13 7 53q-28 18-49 14-22 4-49-14z" fill="@BODY@" stroke="#42414a" stroke-width="5"/><circle cx="110" cy="151" r="22" fill="#4b4650" stroke="@A@" stroke-width="5"/><circle cx="110" cy="151" r="9" fill="@A@"/><path d="M110 131v40m-19-20h38" stroke="#fff1c3" stroke-width="3"/>', head: '<path d="M82 63l9-12h38l9 12v42l-12 13H94l-12-13z" fill="@BODY@" stroke="#42414a" stroke-width="5"/><path d="M91 65h38v10H91z" fill="@S@"/><path d="M102 51V36h16v15m-8-15V26" fill="none" stroke="@A@" stroke-width="4"/>', face: '<rect x="92" y="80" width="15" height="17" rx="5" fill="@A@"/><rect x="113" y="80" width="15" height="17" rx="5" fill="@A@"/><circle cx="99" cy="87" r="4" fill="#fff4c3"/><circle cx="120" cy="87" r="4" fill="#fff4c3"/><path d="M98 101h24" stroke="#42414a" stroke-width="4"/>', front: '<circle cx="78" cy="120" r="6" fill="#f2cf7b"/><circle cx="142" cy="120" r="6" fill="#f2cf7b"/>' },
    hydra: { back: '<path d="M81 128Q39 83 37 55q2-35 27-31 24 4 22 47l12 47m43 10q42-45 44-73-2-35-27-31-24 4-22 47l-12 47" fill="@S@" stroke="#4a3558" stroke-width="5"/>', body: '<path d="M74 121q4-31 36-31 34 0 36 31l20 51q-26 23-56 17-30 6-56-17z" fill="@BODY@" stroke="#4a3558" stroke-width="5"/><path d="M85 138q25 12 50 0l7 34q-28 17-57 0z" fill="@P@" stroke="#4a3558" stroke-width="3"/><circle cx="110" cy="155" r="14" fill="@A@" stroke="#4a3558" stroke-width="4"/>', head: '<path d="M79 99q-15-24-8-54 19-24 35 3l3 49m4 0q-8-45 11-67 26-17 36 11l-7 58m8 4q0-37 22-45 29 1 25 33l-19 29" fill="@BODY@" stroke="#4a3558" stroke-width="5"/>', face: '<circle cx="91" cy="59" r="8" fill="#fff1a2"/><circle cx="130" cy="40" r="8" fill="#fff1a2"/><circle cx="176" cy="63" r="8" fill="#fff1a2"/><circle cx="93" cy="60" r="3" fill="#493550"/><circle cx="132" cy="41" r="3" fill="#493550"/><circle cx="178" cy="64" r="3" fill="#493550"/>', front: '<path d="M84 147l14 6m24-6 14 6m-44 17 12 5m24-5 12 5" stroke="#f5dda2" stroke-width="3"/>' },
    germ: { back: '<path d="M110 74V49m0 143v-27M66 118H42m136 0h-24M79 87 61 69m98 98-18-18m0-62 18-18m-98 98 18-18" stroke="@A@" stroke-width="8" stroke-linecap="round"/><circle cx="110" cy="44" r="8" fill="@A@"/><circle cx="110" cy="197" r="8" fill="@A@"/><circle cx="36" cy="118" r="8" fill="@A@"/><circle cx="184" cy="118" r="8" fill="@A@"/>', body: '<circle cx="110" cy="121" r="57" fill="@BODY@" stroke="#3c4b45" stroke-width="5"/><circle cx="85" cy="95" r="12" fill="#fff" opacity=".3"/><circle cx="141" cy="141" r="8" fill="#fff" opacity=".23"/><path d="M74 123q14-20 36-5m-5 20q22 17 42-1" fill="none" stroke="@A@" stroke-width="4"/>', head: '<path d="M74 105q9-31 37-30 34 2 40 34l-8 34q-17 17-34 12-25-5-31-25z" fill="@P@" stroke="#3c4b45" stroke-width="4"/>', face: '<ellipse cx="96" cy="113" rx="8" ry="10" fill="#fff4bf"/><ellipse cx="126" cy="113" rx="8" ry="10" fill="#fff4bf"/><circle cx="98" cy="116" r="4" fill="#36483d"/><circle cx="128" cy="116" r="4" fill="#36483d"/><path d="M98 137q12 9 26 0" fill="none" stroke="#36483d" stroke-width="4"/>', front: '<circle cx="81" cy="148" r="5" fill="@A@"/><circle cx="145" cy="93" r="5" fill="#f6d793"/>' },
    slime: { back: '<path d="M66 170q-30 24-19 48 18 8 34-10m60-38q30 24 19 48-18 8-34-10" fill="none" stroke="@S@" stroke-width="14" stroke-linecap="round"/>', body: '<path d="M59 165q-20-22-6-46 8-26 31-22 12-36 31-18 18-21 35 9 30-2 33 31 17 26-5 48-30 18-59 16-31 2-60-18z" fill="@BODY@" stroke="#3c4d48" stroke-width="5"/><path d="M79 105q12 15 24 0m23 5q12 15 22 0" fill="none" stroke="#f5fff2" stroke-width="5" opacity=".5"/><circle cx="82" cy="140" r="6" fill="#fff" opacity=".3"/><circle cx="151" cy="120" r="5" fill="#fff" opacity=".35"/>', head: '<path d="M75 108q8-30 35-29 31 0 37 32l-9 30q-15 13-29 7-26-3-31-20z" fill="@P@" stroke="#3c4d48" stroke-width="4"/>', face: '<ellipse cx="97" cy="118" rx="8" ry="10" fill="#eaffd8"/><ellipse cx="128" cy="118" rx="8" ry="10" fill="#eaffd8"/><circle cx="100" cy="120" r="4" fill="#304340"/><circle cx="131" cy="120" r="4" fill="#304340"/><path d="M99 141q12 9 25 0" fill="none" stroke="@A@" stroke-width="4"/>', front: '<path d="M89 154q21 10 42 0" fill="none" stroke="#dffff0" stroke-width="3"/>' },
    mummy: { back: '<path d="M80 116q-25 10-29 44l-8 32 22 11 25-31m43-56q25 10 29 44l8 32-22 11-25-31" fill="@S@" stroke="#50433b" stroke-width="5"/>', body: '<path d="M80 108q30-16 60 0l16 64q-24 20-46 16-25 4-46-16z" fill="@BODY@" stroke="#50433b" stroke-width="4"/><path d="M82 120q28 10 58 0m-61 17q30 11 64 0m-66 17q32 12 68 0m-60 17q28 12 57 0" fill="none" stroke="#eee0b2" stroke-width="6" stroke-linecap="round"/><path d="M92 122l-14 9m59 2 14 10m-63 2-9 11m61 2 13 11" stroke="#b69b6b" stroke-width="2"/>', head: '<path d="M81 63q3-26 29-28 28 2 30 29l-5 52q-11 18-25 18-15 0-26-18z" fill="@BODY@" stroke="#50433b" stroke-width="4"/><path d="M82 75q26 12 56 0m-56 20q29 13 56 0m-55 19q25 12 53 0" fill="none" stroke="#eadcae" stroke-width="6"/>', face: '<ellipse cx="100" cy="91" rx="6" ry="9" fill="#ffe99b"/><ellipse cx="128" cy="91" rx="6" ry="9" fill="#ffe99b"/><path d="M91 79h16m14 0h16m-37 32h30" stroke="#4a4039" stroke-width="4"/>', front: '' },
    warrior: { back: '<path d="M77 117l-34 10 6 39 28 3m69-52 34 10-6 39-28 3" fill="@S@" stroke="#493b3a" stroke-width="5"/>', body: '<path d="M75 112l35-24 36 24 8 57q-40 24-86 0z" fill="@BODY@" stroke="#493b3a" stroke-width="5"/><path d="M82 119l28 18 29-18 3 37-32 25-31-25z" fill="@P@" stroke="#493b3a" stroke-width="4"/><path d="M110 136v43m-24-34 24 13 24-13" stroke="@A@" stroke-width="5"/>', head: '<path d="M78 91l-3-35 35-24 36 24-5 37-17 15H96z" fill="@S@" stroke="#493b3a" stroke-width="4"/><path d="M78 67l32-28 35 28-9 13H87z" fill="@A@" stroke="#493b3a" stroke-width="3"/><path d="M91 81h38v28H91z" fill="#bd8c65" stroke="#493b3a" stroke-width="3"/>', face: '<ellipse cx="101" cy="95" rx="5" ry="7" fill="#f7df91"/><ellipse cx="127" cy="95" rx="5" ry="7" fill="#f7df91"/><path d="M93 88l14-7 9 8m8-1 9-7 12 7m-47 23h34" fill="none" stroke="#493a37" stroke-width="4"/>', front: '<path d="M110 131v46m-21-32 21 12 21-12" stroke="#e8d59e" stroke-width="3"/>' },
    knight: { back: '<path d="M80 117l-28 8-8 42 30 8m72-58 28 8 8 42-30 8" fill="@S@" stroke="#343945" stroke-width="5"/>', body: '<path d="M77 108l33-19 34 19 11 62q-45 26-89 0z" fill="@BODY@" stroke="#343945" stroke-width="5"/><path d="M84 117l26 14 27-14 5 44-32 20-32-20z" fill="@S@" stroke="#343945" stroke-width="4"/><path d="M110 130v49m-23-39 23 12 23-12" stroke="@A@" stroke-width="5"/>', head: '<path d="M78 83l5-37 27-22 30 22 4 37-15 21H93z" fill="@BODY@" stroke="#343945" stroke-width="5"/><path d="M82 61l28-27 29 27-8 15H91z" fill="@S@" stroke="#343945" stroke-width="3"/><path d="M91 80h38v14H91z" fill="#242936" stroke="#343945" stroke-width="3"/>', face: '<path d="M96 84h11m7 0h12" stroke="@A@" stroke-width="4"/><circle cx="100" cy="86" r="2" fill="#fff6da"/><circle cx="121" cy="86" r="2" fill="#fff6da"/>', front: '<path d="M110 107v61m-23-34 23 12 23-12" fill="none" stroke="#d4d6d0" stroke-width="4"/>' },
    timebeast: { back: '<path d="M78 119q-27 13-34 44l19 15 33-32m48-27q27 13 34 44l-19 15-33-32" fill="@S@" stroke="#46364d" stroke-width="5"/>', body: '<path d="M78 111l32-20 33 20 13 62q-25 20-46 17-23 3-45-17z" fill="@BODY@" stroke="#46364d" stroke-width="5"/><path d="M110 117l25 20-25 38-25-38z" fill="#e4d9b0" stroke="#46364d" stroke-width="4"/><path d="M110 125l15 12-15 24-15-24z" fill="#e4a45d" stroke="#46364d" stroke-width="3"/>', head: '<path d="M82 92q-6-29 17-41l11 18 12-19q26 15 16 46l-14 22H96z" fill="@BODY@" stroke="#46364d" stroke-width="4"/>', face: '<ellipse cx="99" cy="94" rx="8" ry="10" fill="#ffe995"/><ellipse cx="127" cy="94" rx="8" ry="10" fill="#ffe995"/><circle cx="101" cy="96" r="3" fill="#46364d"/><circle cx="129" cy="96" r="3" fill="#46364d"/>', front: '<circle cx="110" cy="147" r="17" fill="#e8dcae" stroke="#46364d" stroke-width="3"/><path d="M110 136v12l8 5" fill="none" stroke="@A@" stroke-width="3"/>' },
    storm: { back: '<path d="M78 123q-31-34-47-6-9 24 21 34m73-28q31-34 47-6 9 24-21 34" fill="@S@" stroke="#3b4550" stroke-width="5"/>', body: '<path d="M55 155q-29-10-15-39 10-19 31-13 1-31 30-31 21-24 42 0 33-6 38 25 28 17 10 44-20 22-55 17-41 11-81-3z" fill="@BODY@" stroke="#3b4550" stroke-width="5"/><path d="M108 100l-20 31h19l-9 30 31-41h-21l13-20z" fill="@A@" stroke="#fff3af" stroke-width="2"/>', head: '<path d="M82 97q7-27 28-25 27-2 35 27l-5 29-22 11-25-12z" fill="@P@" stroke="#3b4550" stroke-width="4"/>', face: '<ellipse cx="100" cy="110" rx="6" ry="8" fill="#e8fbff"/><ellipse cx="127" cy="110" rx="6" ry="8" fill="#e8fbff"/><circle cx="101" cy="112" r="3" fill="#3b4550"/><circle cx="128" cy="112" r="3" fill="#3b4550"/><path d="M103 133l7-8 8 8" fill="none" stroke="#3b4550" stroke-width="3"/>', front: '<path d="M76 157l13 6m43-6 13-7" stroke="#e8f7f6" stroke-width="4"/>' },
    kraken: { back: '<path d="M83 145Q31 91 22 124q-3 25 45 38 20 10 31 25m27-42q52-54 61-21 3 25-45 38-20 10-31 25M80 153Q29 181 30 218q12 18 27 1l26-32m41-34q51 28 50 65-12 18-27 1l-26-32" fill="none" stroke="@S@" stroke-width="16" stroke-linecap="round"/>', body: '<path d="M76 127q-1-36 34-40 36 4 34 40l-7 40q-14 17-27 13-16 4-28-13z" fill="@BODY@" stroke="#34404c" stroke-width="5"/><path d="M90 143q20 13 40 0m-36 18q16 12 32 0" fill="none" stroke="@A@" stroke-width="4"/>', head: '<path d="M82 101q4-30 28-30 27 0 30 30l-7 30-22 12-23-12z" fill="@P@" stroke="#34404c" stroke-width="4"/>', face: '<ellipse cx="100" cy="106" rx="8" ry="10" fill="#ffe39a"/><ellipse cx="126" cy="106" rx="8" ry="10" fill="#ffe39a"/><circle cx="102" cy="107" r="4" fill="#32404a"/><circle cx="128" cy="107" r="4" fill="#32404a"/><path d="M100 128q10 8 22 0" fill="none" stroke="@A@" stroke-width="3"/>', front: '<g fill="#eacb91"><circle cx="43" cy="218" r="3"/><circle cx="56" cy="217" r="3"/><circle cx="163" cy="218" r="3"/><circle cx="176" cy="217" r="3"/></g>' },
    treebeast: { back: '<path d="M81 127Q39 80 27 96q-2 22 47 42m72-11q42-40 54-24 2 22-47 42" fill="none" stroke="@S@" stroke-width="17" stroke-linecap="round"/><path d="M58 110l-5-29m112 29 5-29" stroke="@A@" stroke-width="5"/>', body: '<path d="M76 111q34-23 68 0l14 63q-24 22-48 17-24 5-48-17z" fill="@BODY@" stroke="#3a493f" stroke-width="5"/><path d="M110 117v62m-19-41 19 14 19-14m-46 23 15-9m39 9-15-9" fill="none" stroke="@A@" stroke-width="5"/><path d="M83 161l15-9m39 9-15-9" stroke="#664a3c" stroke-width="4"/>', head: '<path d="M84 87Q48 52 62 30q21-5 35 24 3-36 13-42 13 12 14 42 19-34 38-24 13 23-23 53l-2 24H86z" fill="@BODY@" stroke="#3a493f" stroke-width="5"/><path d="M71 45l25 25m42-1 25-25m-53-25v48" stroke="@A@" stroke-width="4"/>', face: '<circle cx="101" cy="109" r="6" fill="#ffe88a"/><circle cx="127" cy="109" r="6" fill="#ffe88a"/><path d="M92 102q9-8 18 0m9 0q9-8 18 0m-39 29 12 8 12-8" fill="none" stroke="#453f39" stroke-width="4"/>', front: '<circle cx="110" cy="158" r="7" fill="#fff0ad" stroke="#75523d" stroke-width="3"/>' }
  };

  const monsterLegs = {
    gargoyle: '<path d="M83 164l-7 31 9 13 10-4 8-30m31-10 7 31-9 13-10-4-8-30" fill="@BODY@" stroke="#303c43" stroke-width="5"/><path d="M77 202l-13 10 27 4 8-9m39-5 13 10-27 4-8-9" fill="@S@" stroke="#303c43" stroke-width="4"/>',
    raven: '<path d="M99 165l-3 29m28-29 3 29" fill="none" stroke="#d5a84b" stroke-width="5" stroke-linecap="round"/><path d="M96 193l-11 10 22 1 7-8m13-3 11 10-22 1-7-8" fill="none" stroke="#d5a84b" stroke-width="4" stroke-linecap="round"/>',
    dragon: '<path d="M83 162l-8 38 12 17 19-5 7-32m25-18 8 38-12 17-19-5-7-32" fill="@BODY@" stroke="#44313b" stroke-width="5"/><path d="M75 199l-13 20 34 2 8-14m53-8 13 20-34 2-8-14" fill="@S@" stroke="#44313b" stroke-width="4"/>',
    golem: '<path d="M79 162l-8 40 17 20 21-7 8-37m25-16 8 40-17 20-21-7-8-37" fill="@BODY@" stroke="#46515c" stroke-width="5"/><path d="M69 202l-15 18 37 4 9-14m51-8 15 18-37 4-9-14" fill="@S@" stroke="#46515c" stroke-width="5"/>',
    sphinx: '<path d="M80 160l-5 36 12 17 18-5 8-31m27-17 5 36-12 17-18-5-8-31" fill="@BODY@" stroke="#51403b" stroke-width="5"/><path d="M75 193q16-9 31 0l-3 19q-17 8-31-2zm39 0q16-9 31 0l3 17q-15 10-31 2z" fill="@A@" stroke="#51403b" stroke-width="4"/>',
    automaton: '<path d="M85 166v35l12 17 15-8 3-37m20-7v35l-12 17-15-8-3-37" fill="@S@" stroke="#42414a" stroke-width="5"/><path d="M82 199h31v14l-15 10-16-9zm56 0h-31v14l15 10 16-9z" fill="@P@" stroke="#42414a" stroke-width="4"/><circle cx="99" cy="184" r="6" fill="@A@"/><circle cx="121" cy="184" r="6" fill="@A@"/>',
    hydra: '<path d="M79 163l-8 39 17 20 20-7 9-36m25-16 8 39-17 20-20-7-9-36" fill="@BODY@" stroke="#4a3558" stroke-width="5"/><path d="M69 202l-15 18 37 4 9-14m51-8 15 18-37 4-9-14" fill="@S@" stroke="#4a3558" stroke-width="4"/>',
    mummy: '<path d="M84 165l-5 37 14 18 18-6 7-35m20-14 5 37-14 18-18-6-7-35" fill="@BODY@" stroke="#50433b" stroke-width="4"/><path d="M79 193q15 6 28 0m-30 13q14 7 28 0m10-13q15 6 28 0m-26 13q14 7 28 0" fill="none" stroke="#eadcae" stroke-width="5"/><path d="M75 211h34m2 0h34" stroke="#55443a" stroke-width="5"/>',
    warrior: '<path d="M81 163l-7 39 15 20 19-7 8-37m24-15 7 39-15 20-19-7-8-37" fill="@BODY@" stroke="#493b3a" stroke-width="5"/><path d="M75 199h39l-3 19-22 7-17-13zm39 0h39l3 13-17 13-22-7z" fill="@S@" stroke="#493b3a" stroke-width="4"/><path d="M84 205h22m20 0h22" stroke="@A@" stroke-width="3"/>',
    knight: '<path d="M83 163l-5 40 16 20 18-6 6-38m20-16 5 40-16 20-18-6-6-38" fill="@BODY@" stroke="#343945" stroke-width="5"/><path d="M78 199h36l-2 19-19 7-17-13zm36 0h36l4 13-18 13-19-7z" fill="@S@" stroke="#343945" stroke-width="4"/><path d="M87 205h19m28 0h19" stroke="@A@" stroke-width="4"/>',
    timebeast: '<path d="M82 163l-6 39 17 20 19-7 7-37m23-15 6 39-17 20-19-7-7-37" fill="@BODY@" stroke="#46364d" stroke-width="5"/><path d="M75 199l-14 20 37 3 9-14m52-9 14 20-37 3-9-14" fill="@S@" stroke="#46364d" stroke-width="4"/><path d="M84 204l15 5m34-5-15 5" stroke="@A@" stroke-width="3"/>',
    treebeast: '<path d="M80 164l-8 39 17 20 21-7 8-37m25-15 8 39-17 20-21-7-8-37" fill="@BODY@" stroke="#3a493f" stroke-width="5"/><path d="M72 202l-20 20 43 2 9-14m41-8 20 20-43 2-9-14" fill="@S@" stroke="#3a493f" stroke-width="5"/><path d="M69 217l17-4m65 4-17-4" stroke="#b18a58" stroke-width="4"/>'
  };

  const tint = value => value
    .replaceAll('@BODY@', 'url(#' + id + '-body)')
    .replaceAll('@P@', p).replaceAll('@S@', s).replaceAll('@A@', a);
  const hero = isMonster ? null : (heroes[kind] || heroes.scribe);
  const creature = isMonster ? (monsters[kind] || monsters.golem) : null;
  let back = isMonster ? creature.back : hero.cape;
  let legs = isMonster ? (monsterLegs[kind] || '') : '<path d="M84 163l-5 42q8 10 24 7l8-44m20-5 5 42q-9 10-25 7l-7-44" fill="#4d4652" stroke="#332f3d" stroke-width="4"/><path d="M79 201q13 4 25 0l1 18q-12 8-28 1zm53 0q-13 4-25 0l-1 18q12 8 28 1z" fill="@S@" stroke="#332f3d" stroke-width="3"/><path d="M73 217h34l-4 10H69zm34 0h34l5 10h-35z" fill="#453c42" stroke="#332f3d" stroke-width="3"/><path d="M78 207h25m31 0h-25" stroke="@A@" stroke-width="3"/>';
  let body = isMonster ? creature.body : hero.coat;
  let arms = isMonster ? '' : '<path d="M80 111q-20-3-26 18l-8 29q-4 11 7 14 10 2 14-8l11-22 17-12m46-19q20-3 26 18l8 29q4 11-7 14-10 2-14-8l-11-22-17-12" fill="url(#' + id + '-body)" stroke="#34303b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M49 153l-8 9 8 9 12-9m98-9 8 9-8 9-12-9" fill="#d9a783" stroke="#654b46" stroke-width="3"/><path d="M56 126l13 5m95-5-13 5" stroke="@A@" stroke-width="4"/>';
  let head = isMonster ? creature.head : '<path d="M96 84v22q14 11 28 0V84" fill="#d6a27d" stroke="#64494b" stroke-width="3"/><path d="M80 57q0-34 30-34t31 34v24q-4 28-31 31-27-4-31-31z" fill="#e6b48d" stroke="#59434a" stroke-width="4"/><path d="M82 77q-8 11 1 21m56-21q8 11-1 21" fill="#e6b48d" stroke="#59434a" stroke-width="3"/>' + hero.hair;
  let face = isMonster ? creature.face : '<path d="M91 70q8-6 16 0m12 0q8-6 16 0" fill="none" stroke="#51404a" stroke-width="3" stroke-linecap="round"/><ellipse cx="101" cy="80" rx="5.5" ry="7" fill="#fff7e3"/><ellipse cx="126" cy="80" rx="5.5" ry="7" fill="#fff7e3"/><circle cx="102" cy="81" r="3.2" fill="' + hero.eyes + '"/><circle cx="127" cy="81" r="3.2" fill="' + hero.eyes + '"/><path d="M112 83l-3 9 6 1m-11 10q8 7 17 0" fill="none" stroke="#8b5a50" stroke-width="3" stroke-linecap="round"/><circle cx="90" cy="94" r="4" fill="#ed9186" opacity=".45"/><circle cx="140" cy="94" r="4" fill="#ed9186" opacity=".45"/>';
  let equipment = isMonster ? '' : hero.hat + hero.prop;
  let detail = isMonster ? creature.front : hero.detail;

  if (isMonster && kind === 'ghost' && name.includes('crase')) detail += '<path d="M82 152q28-25 56 0m-41-17 13 16 12-18" fill="none" stroke="@A@" stroke-width="4"/><circle cx="110" cy="157" r="5" fill="#fff5d6"/>';
  if (isMonster && kind === 'ghost' && name.includes('radioativo')) detail += '<path d="M110 142l-12 22h24z" fill="#263c40" stroke="#fff29a" stroke-width="3"/><circle cx="110" cy="157" r="3" fill="#fff29a"/>';
  if (isMonster && kind === 'golem' && name.includes('tectonico')) back += '<path d="M67 111l-16-30 26 12 13-24 16 31m21 0 15-31 14 24 25-12-15 30" fill="@P@" stroke="#46515c" stroke-width="4"/><path d="M63 148l13-10m69 10-13-10m-30 17 12-13 11 13" stroke="#c3eff0" stroke-width="4"/>';
  if (isMonster && kind === 'golem' && name.includes('entropia')) detail += '<circle cx="110" cy="151" r="26" fill="#5e3e86" stroke="#f1d98c" stroke-width="4"/><circle cx="110" cy="151" r="16" fill="none" stroke="#b9e8e1" stroke-width="3" stroke-dasharray="3 4"/><path d="M110 132l5 14 13 4-13 4-5 14-4-14-13-4 13-4z" fill="#ffe39a"/>';
  if (isMonster && kind === 'serpent' && name.includes('dna')) detail += '<path d="M72 145q34-23 68 0m-68 9q34-23 68 0m-60-12 8 12m10-18 8 12m10-18 8 12m10-13 8 12" fill="none" stroke="#e4f6b1" stroke-width="3"/>';
  if (isMonster && kind === 'serpent' && name.includes('equacoes')) detail += '<path d="M81 145q8-12 16 0t16 0 16 0m-40 12 9 7 9-7 9 7 9-7" fill="none" stroke="#efd28b" stroke-width="3"/>';
  if (isMonster && kind === 'dragon' && name.includes('vulcanico')) {
    back += '<path d="M80 99l-12-37 25 24 17-44 14 45 24-24-12 39" fill="#ee8149" stroke="#482e35" stroke-width="4"/>';
    detail += '<path d="M91 144l8 11 11-8 10 9 10-12m-39 17 8 10 10-8 10 9 10-12" fill="none" stroke="#ffbd64" stroke-width="4"/>';
  }
  if (isMonster && kind === 'dragon' && name.includes('gramatica')) detail += '<path d="M90 149l10 8 10-7 11 8 11-9" fill="none" stroke="#f5dfaa" stroke-width="3"/>';
  if (isMonster && kind === 'automaton' && name.includes('geometria')) detail += '<path d="M89 151l21-19 21 19-21 19z" fill="none" stroke="#f5dc8a" stroke-width="4"/><circle cx="110" cy="151" r="7" fill="#b9e2f2"/>';
  if (isMonster && kind === 'automaton' && name.includes('industrial')) detail += '<path d="M92 151h36m-27-10 18 20m0-20-18 20" stroke="#f4d17b" stroke-width="3"/>';

  let bossDetail = '';
  if (boss && person.power.type === 'burn') bossDetail = '<path d="M66 88Q46 69 65 43q5 18 17 23-5-27 17-42 0 29 18 38 8-19 22-25-4 34 27 54" fill="#ff9b52" stroke="#54333b" stroke-width="4"/><path d="M91 53q4-22 18-32m-1 29q17-24 33-21" fill="none" stroke="#ffe19a" stroke-width="4"/>';
  else if (boss && person.power.type === 'combo') bossDetail = '<path d="M78 94Q46 65 54 34q20-24 36 4l9 58m14 0q-8-46 14-68 25-17 37 10l-7 59" fill="@BODY@" stroke="#4a3558" stroke-width="5"/><circle cx="72" cy="41" r="8" fill="#fff0a0"/><circle cx="140" cy="25" r="8" fill="#fff0a0"/><circle cx="178" cy="45" r="8" fill="#fff0a0"/>';
  else if (boss && person.power.type === 'heal') bossDetail = '<path d="M110 104l39 40-39 40-39-40z" fill="#7549a2" stroke="#f0d890" stroke-width="5"/><circle cx="110" cy="144" r="24" fill="#d4a8ef" stroke="#f6e5ac" stroke-width="4"/><circle cx="110" cy="144" r="14" fill="#f4d575"/><path d="M110 126v36m-18-18h36m-31-13 26 26m0-26-26 26" stroke="#8c63b0" stroke-width="3"/>';
  else if (boss && person.power.type === 'rewind') bossDetail = '<circle cx="110" cy="146" r="39" fill="#f0d99a" stroke="#40324e" stroke-width="5"/><circle cx="110" cy="146" r="30" fill="#37445d" stroke="#d8ba74" stroke-width="4"/><circle cx="110" cy="146" r="21" fill="#e9dbb5"/><path d="M110 126v20l14 9m-14-29-4-8m4 0 4 8" fill="none" stroke="#46364d" stroke-width="4"/>';
  else if (boss && person.power.type === 'shield') bossDetail = '<path d="M110 125q-15 11-27 8-4 19 5 34 9 13 22 19 14-6 22-19 10-15 5-34-12 3-27-8z" fill="#498b5d" stroke="#31533f" stroke-width="4"/><path d="M110 137v37m-14-23 14 11 14-11" fill="none" stroke="#f0d982" stroke-width="4"/><circle cx="95" cy="139" r="6" fill="#f5cc76"/><circle cx="125" cy="139" r="6" fill="#e9a8bd"/>';

  const markBadge = '<g class="figure-insignia"><circle cx="110" cy="157" r="10" fill="#fff0c9" stroke="#382f3e" stroke-width="3"/><text x="110" y="161" text-anchor="middle" font-family="Georgia,serif" font-size="10" font-weight="900" fill="#342c3a">' + mark + '</text></g>';
  const layer = (name, content) => '<g class="figure-layer figure-' + name + '">' + tint(content) + '</g>';
  return '<svg class="figure-svg ' + (isMonster ? 'figure-monster' : 'figure-hero') + (boss ? ' figure-boss' : '') + '" viewBox="0 0 220 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
    '<defs><linearGradient id="' + id + '-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset=".3" stop-color="' + p + '"/><stop offset="1" stop-color="' + s + '"/></linearGradient><radialGradient id="' + id + '-aura"><stop stop-color="' + a + '" stop-opacity=".28"/><stop offset="1" stop-color="' + a + '" stop-opacity="0"/></radialGradient></defs>' +
    (boss ? '<ellipse cx="110" cy="124" rx="102" ry="111" fill="url(#' + id + '-aura)"/><circle cx="110" cy="124" r="102" fill="none" stroke="' + a + '" stroke-opacity=".34" stroke-width="2" stroke-dasharray="3 8"/>' : '') +
    '<ellipse cx="110" cy="236" rx="' + (boss ? '65' : '49') + '" ry="8" fill="#1b2024" opacity=".25"/><g class="figure-motion">' +
    layer('back', back) + layer('legs', legs) + layer('body', body) + layer('arms', arms) + layer('head', head) +
    layer('face', face) + layer('equipment', equipment + (isMonster && !boss && !['serpent', 'storm', 'kraken', 'germ', 'slime'].includes(kind) ? markBadge : '')) +
    layer('front', detail + bossDetail) + '</g></svg>';
}

/**
 * Desenha cenários SVG locais para as matérias sem depender de serviços externos.
 */
let sceneSequence = 0;

/**
 * Cria o fundo ilustrado da arena usando os desenhos do tema escolhido.
 * @param {string} theme Identificador visual do cenário.
 */
function baseSceneSvg(theme) {
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
 * Varia luz, arquitetura e elementos de cada local conforme a expedição avança.
 * @param {string} theme Tema do mundo atual.
 * @param {number} stage Etapa visual entre a chegada e o confronto final.
 * @param {string|null} routeChoice Rota escolhida no intervalo da jornada.
 */
function sceneSvg(theme, stage = 0, routeChoice = null) {
  const stageIndex = Math.max(0, Math.min(4, stage));
  const scene = baseSceneSvg(theme);
  const palettes = {
    library: [['#b4d8c5','#54786f','#283a49'],['#d2c59e','#806b78','#392e46'],['#d4a976','#73536c','#34243c'],['#a97685','#59435d','#28243a'],['#675b86','#37334f','#1e2231']],
    observatory: [['#93c9df','#547c9d','#293b5c'],['#78b3d1','#4a6d96','#263854'],['#a48cc3','#5e5682','#2c304e'],['#7874a9','#444a77','#222a47'],['#495b91','#303e68','#1c2945']],
    laboratory: [['#a5ddc2','#579b86','#274a4e'],['#85d0a8','#438b7e','#21464b'],['#86c7b4','#497c84','#24404d'],['#6caeaa','#3b6575','#20394b'],['#4e8793','#315566','#1b3444']],
    ruins: [['#e9c98b','#a27459','#54404a'],['#e0b67e','#a16e54','#573d43'],['#cb9774','#865b59','#443747'],['#a77b78','#674d61','#373349'],['#795c76','#483f5b','#292b43']],
    mountains: [['#a3e1dc','#5898a0','#2d586c'],['#88d1d1','#4f919c','#294f68'],['#91bfc8','#526f82','#304c62'],['#778fa9','#465875','#293c58'],['#586e98','#384b70','#21334e']]
  };
  const landmarks = {
    library: ['', '<g fill="#604c70" stroke="#efd08b" stroke-width="4"><path d="M20 267V159q33-49 66 0v108M814 267V159q33-49 66 0v108"/><path d="M35 267v-94q18-28 36 0v94M829 267v-94q18-28 36 0v94" fill="#9a6d77"/></g>', '<g fill="#db9568" stroke="#fff0bb" stroke-width="3"><path d="M98 112l55-23 35 35-55 23zM703 88l46-17 34 27-44 19zM391 73l31-13 23 21-29 13z"/><path d="M112 114l62 17m542-34 48 12m-365-32 34 10" stroke="#fff5dd"/></g><circle cx="450" cy="150" r="68" fill="none" stroke="#f4d78e" stroke-width="3" stroke-dasharray="4 10"/>', '<path d="M29 267V157h103v110M768 267V157h103v110" fill="#594164" stroke="#d6b77f" stroke-width="5"/><path d="M49 267V176q32-34 64 0v91m675 0v-91q32-34 64 0v91" fill="#a36e75"/><path d="M134 265l113-65 63 65m296 0 111-76 80 76" fill="#614662" stroke="#d9b877" stroke-width="3"/>', '<path d="M315 267V128q0-81 135-81t135 81v139" fill="#392f4c" stroke="#e8c77d" stroke-width="8"/><path d="M344 267V141q0-49 106-49t106 49v126" fill="#895570" stroke="#e89770" stroke-width="5"/><circle cx="450" cy="170" r="43" fill="#f4dc91" opacity=".8"/><path d="M450 109v118m-59-59h118" stroke="#fff5c9" stroke-width="4"/>'],
    observatory: ['', '<path d="M26 267V161l45-48 45 48v106M785 267V161l45-48 45 48v106" fill="#344668" stroke="#b4d1df" stroke-width="4"/><path d="M47 267v-73q24-35 48 0v73m710 0v-73q24-35 48 0v73" fill="#6c91ad"/>', '<ellipse cx="450" cy="144" rx="169" ry="62" fill="none" stroke="#e8d18b" stroke-width="4" transform="rotate(-23 450 144)"/><ellipse cx="450" cy="144" rx="119" ry="41" fill="none" stroke="#a8e2e8" stroke-width="3" transform="rotate(31 450 144)"/><circle cx="591" cy="87" r="13" fill="#f4a578"/><circle cx="300" cy="112" r="9" fill="#c7daef"/>', '<path d="M59 267l151-118 31 22-100 96m494 0 91-124 33 21-55 103" fill="#4b6389" stroke="#e8cf81" stroke-width="5"/><circle cx="745" cy="119" r="38" fill="none" stroke="#d5e8ed" stroke-width="4"/><path d="M745 66v106m-53-53h106" stroke="#d5e8ed" stroke-width="3"/>', '<circle cx="450" cy="144" r="118" fill="#29385b" stroke="#d4c7ed" stroke-width="6"/><circle cx="450" cy="144" r="83" fill="#e5e9ed"/><circle cx="487" cy="122" r="80" fill="#29385b"/><path d="M295 267v-75h37l37 75m250 0 37-75h37v75" fill="#586b94" stroke="#c1d0e3" stroke-width="4"/>'],
    laboratory: ['', '<path d="M28 267V103m0 106q-49-42-17-84 37 35 17 84zm0 38q44-45 81-14-33 37-81 14zm816-128v164m0-106q49-42 17-84-37 35-17 84zm0 38q-44-45-81-14 33 37 81 14z" fill="#4c9c79" stroke="#b6ebbc" stroke-width="4"/>', '<g fill="#a0dccb" fill-opacity=".36" stroke="#e1f3c1" stroke-width="4"><circle cx="190" cy="140" r="34"/><circle cx="704" cy="163" r="47"/><circle cx="595" cy="78" r="22"/><circle cx="305" cy="212" r="17"/></g><g fill="#ffe496"><circle cx="190" cy="140" r="9"/><circle cx="704" cy="163" r="13"/><circle cx="595" cy="78" r="6"/></g>', '<path d="M428 47c-78 51 78 89 0 135s78 68 0 103m44-238c78 51-78 89 0 135s-78 68 0 103" fill="none" stroke="#e5a1d3" stroke-width="11" opacity=".85"/><path d="M428 47c-78 51 78 89 0 135s78 68 0 103" fill="none" stroke="#eff4b6" stroke-width="4"/>', '<circle cx="450" cy="158" r="107" fill="#a5e4bb" fill-opacity=".15" stroke="#bdeeba" stroke-width="7"/><path d="M450 267V112m0 103q-110-31-87-96 74 15 87 96zm0-39q82-101 130-43-19 71-130 82" fill="#5eaf82" stroke="#d6efb4" stroke-width="5"/><circle cx="450" cy="112" r="30" fill="#f8dc83"/>'],
    ruins: ['', '<path d="M23 267V118h38v149m20 0V96h48v171m633 0V107h46v160m20 0V128h39v139" fill="#795849" stroke="#e3c08b" stroke-width="5"/><path d="M0 112h152m596 0h152" stroke="#eddaaa" stroke-width="6"/>', '<path d="M0 267q106-97 216 0m470 0q99-104 214 0" fill="#b58b59"/><path d="M142 267l70-51 54 51m400 0 49-66 57 66" fill="#765440" stroke="#e2bb7d" stroke-width="4"/><g fill="#ffe3a1" opacity=".7"><circle cx="112" cy="91" r="5"/><circle cx="183" cy="132" r="4"/><circle cx="733" cy="80" r="5"/></g>', '<path d="M38 267V132l95-96 95 96v135M674 267V132l95-96 95 96v135" fill="#805d48" stroke="#edcf94" stroke-width="6"/><path d="M72 267V157q61-67 122 0v110m514 0V157q61-67 122 0v110" fill="#433843"/><path d="M0 228q119-52 229 0t221 0 221 0 229 0v54H0" fill="#b68b5a" opacity=".82"/>', '<path d="M300 267V111l67-59h166l67 59v156" fill="#42323f" stroke="#f2c878" stroke-width="7"/><path d="M350 267V137l50-47h100l50 47v130" fill="#713f4d" stroke="#ef9168" stroke-width="6"/><path d="M450 91v160m-65-80h130" stroke="#ffe19a" stroke-width="6"/><circle cx="450" cy="171" r="31" fill="#f7cb75" opacity=".9"/>'],
    mountains: ['', '<g fill="#3b6759" stroke="#bad39f" stroke-width="4"><path d="M24 267V139l49-87 50 87v128M777 267V128l51-97 53 97v139"/><path d="M45 143l28-52 30 52m693-15 32-61 34 61" fill="#f3f1dc"/></g>', '<path d="M0 190q85-82 170 0t170 0 170 0 170 0 220 0v95H0" fill="#70bdb8" opacity=".8"/><path d="M0 208q85-82 170 0t170 0 170 0 170 0 220 0" fill="none" stroke="#e1f4de" stroke-width="10"/><path d="M80 267q67-122 135 0m464 0q57-128 115 0" fill="#4d786b"/>', '<path d="M32 267l150-120 139 120m318 0 104-148 118 148" fill="#395866" stroke="#c6ded1" stroke-width="5"/><path d="M182 147l43 31-39 7m438-63 54 35-48 10" fill="#edf1df"/><path d="M179 151l440 4" stroke="#dfbd78" stroke-width="8"/><path d="M199 153v94m395-89v92" stroke="#cb9063" stroke-width="6"/>', '<path d="M170 267l165-198 100 107 87-112 186 203" fill="#2d5060" stroke="#b4d6d5" stroke-width="5"/><path d="M335 69l51 60-38-10-18 29-17-30-37 12zm187-5 58 69-43-15-20 30-18-32-36 15" fill="#f3f2df"/><path d="M0 190q131-79 262 0t262 0 376 0v96H0" fill="#4c5e65"/><path d="M0 212q124-49 247 2t265 0 388 1" fill="none" stroke="#deeff0" stroke-width="5" opacity=".8"/>']
  };
  const palette = (palettes[theme] || palettes.library)[stageIndex];
  const stageArt = ((landmarks[theme] || landmarks.library)[stageIndex] || '');
  const routeArt = routeChoice === 'lanterns'
    ? '<g fill="#ffe6a2"><circle cx="118" cy="244" r="9"/><circle cx="780" cy="238" r="8"/><circle cx="226" cy="254" r="4"/><circle cx="681" cy="251" r="4"/></g>'
    : routeChoice === 'echoes'
      ? '<g fill="none" stroke="#baf0e7" opacity=".55"><circle cx="450" cy="228" r="30"/><circle cx="450" cy="228" r="49"/><circle cx="450" cy="228" r="70"/></g>'
      : '';
  const sky = scene
    .replace('stop-color="#7890a1"', `stop-color="${palette[0]}"`)
    .replace('stop-color="#364957"', `stop-color="${palette[1]}"`)
    .replace('stop-color="#171f25"', `stop-color="${palette[2]}"`)
    .replace('stop-color="#28332e"', `stop-color="${palette[1]}"`)
    .replace('stop-color="#111815"', `stop-color="${palette[2]}"`)
    .replace('cx="450" cy="135" r="230"', `cx="${stageIndex === 4 ? '675' : '450'}" cy="${stageIndex === 4 ? '92' : '135'}" r="230"`);
  return sky.replace('<path d="M0 267h900v73H0z"', `${stageArt}${routeArt}<path d="M0 267h900v73H0z"`);
}

/** Mostra os cinco heróis originais na tela de início. */
function renderHomeParty() {
  const party = document.querySelector('#home-characters');
  party.innerHTML = Object.values(WORLDS).map((world, index) =>
    `<div class="home-party-member home-party-member-${index + 1}" title="${world.hero.name}">${figureSvg(world.hero)}</div>`
  ).join('');
}

/** Aplica a etapa atual e a rota escolhida à paisagem da batalha. */
function renderBattleScene(stage = 0) {
  const world = state.world;
  const stageIndex = Math.max(0, Math.min(4, stage));
  const stageName = world.scene.stages?.[stageIndex] || world.scene.name;
  const arena = document.querySelector('#arena');
  arena.dataset.stage = String(stageIndex + 1);
  arena.dataset.world = world.scene.theme;
  arena.dataset.route = state.routeChoice || '';
  document.querySelector('#scene-label').textContent = stageName;
  document.querySelector('#scene-illustration').innerHTML = sceneSvg(world.scene.theme, stageIndex, state.routeChoice);
  document.querySelector('#scene-items').innerHTML = '';
}

/** Exibe o intervalo ilustrado e as duas decisões antes do próximo confronto. */
function showJourney() {
  const stageIndex = Math.min(state.monstersDefeated, 4);
  const nextMonster = state.world.monsters[stageIndex];
  const isBossApproach = stageIndex === 4;
  document.querySelector('.game-layout').classList.add('hidden');
  const journey = document.querySelector('#journey-screen');
  journey.classList.remove('hidden');
  journey.dataset.world = state.world.scene.theme;
  document.querySelector('#journey-art').innerHTML = sceneSvg(state.world.scene.theme, stageIndex);
  document.querySelector('#journey-kicker').textContent = isBossApproach ? 'O ÚLTIMO PORTÃO' : 'A JORNADA CONTINUA';
  document.querySelector('#journey-title').textContent = isBossApproach
    ? 'Uma presença antiga desperta.'
    : 'A trilha muda a cada passo.';
  document.querySelector('#journey-narrative').textContent = isBossApproach
    ? `${state.world.hero.name.split(',')[0]} atravessou quatro encontros. À frente, ${nextMonster.name} guarda o coração deste mundo.`
    : `Com ${state.world.hero.name.split(',')[0]} ao seu lado, vocês deixam ${state.world.monsters[stageIndex - 1].name} para trás. Um novo trecho revela segredos de ${state.subject.name}.`;
  document.querySelector('#journey-destination-name').textContent = isBossApproach
    ? `${nextMonster.name} · CHEFE FINAL`
    : nextMonster.name;
  document.querySelector('#journey-route').innerHTML = state.world.monsters.map((monster, index) =>
    `<span class="journey-route-node ${index < state.monstersDefeated ? 'is-cleared' : ''} ${index === stageIndex ? 'is-next' : ''}" title="${monster.name}">${index === 4 ? '♛' : index + 1}</span>`
  ).join('<i></i>');
  document.querySelector('#journey-rest').innerHTML = '<span class="journey-choice-icon">✧</span><span><b>Acampar sob as lanternas</b><small>Recupere 20 pontos de vida antes de seguir.</small></span><i>→</i>';
  document.querySelector('#journey-study').innerHTML = '<span class="journey-choice-icon">⌘</span><span><b>Estudar os ecos do caminho</b><small>Ganhe 25 XP e siga com novas ideias.</small></span><i>→</i>';
}

/** Aplica a escolha de jornada, atualiza a paisagem e prepara o próximo encontro. */
function chooseJourneyPath(choice) {
  state.routeChoice = choice === 'rest' ? 'lanterns' : 'echoes';
  if (choice === 'rest') {
    const before = state.heroHp;
    state.heroHp = Math.min(100, state.heroHp + 20);
    document.querySelector('#feedback').textContent = `A fogueira restaurou ${state.heroHp - before} pontos de vida.`;
  } else {
    state.xp += 25;
    document.querySelector('#feedback').textContent = 'Os ecos do caminho ensinaram algo novo. +25 XP.';
  }
  state.journeyPending = false;
  document.querySelector('#journey-screen').classList.add('hidden');
  document.querySelector('.game-layout').classList.remove('hidden');
  renderBattleScene(Math.min(state.monstersDefeated, 4));
  updateProgress();
  loadQuestion();
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
    routeChoice: null,
    journeyPending: false,
    timeBonus: 0,
    bossPowerUsed: false,
    challengeMode: null,
    finishing: false,
    finishSequence: state.finishSequence + 1,
    endReason: null,
    seen: new Set()
  });

  document.querySelector('#hero-name').textContent = world.hero.name.toUpperCase();
  document.querySelector('#hero-role').textContent = world.hero.role || subject.role;
  document.querySelector('#hero-avatar').innerHTML = figureSvg(world.hero);
  document.querySelector('#hero-avatar').setAttribute('aria-label', world.hero.name);

  renderBattleScene(0);
  document.body.dataset.world = world.scene.theme;
  document.querySelector('#journey-screen').classList.add('hidden');
  document.querySelector('#boss-ability').classList.add('hidden');

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
    const stageIndex = Math.min(state.monstersDefeated, 4);
    state.challengeMode = finalBattle ? null : CHALLENGE_MODES[stageIndex];
    if (!finalBattle && state.monsterHits === 0) state.bossHp = 100;

    const arena = document.querySelector('#arena');
    const bossAvatar = document.querySelector('#boss-avatar');
    const roundPill = document.querySelector('#round-pill');
    const kicker = document.querySelector('#question-kicker');
    const reward = document.querySelector('#reward');

    arena.classList.toggle('final-battle', finalBattle);
    renderBattleScene(stageIndex);
    bossAvatar.innerHTML = figureSvg(monster, true);
    clearCharacterMotion(bossAvatar);
    clearCharacterMotion(document.querySelector('#hero-avatar'));
    bossAvatar.classList.remove('hit');
    bossAvatar.setAttribute('aria-label', monster.name);

    document.querySelector('#boss-name').textContent = monster.name.toUpperCase();
    document.querySelector('#boss-role').textContent = finalBattle
      ? 'CHEFE FINAL · 5 VIDAS'
      : 'MONSTRO ' + (state.monstersDefeated + 1) + ' DE 4';
    const bossAbility = document.querySelector('#boss-ability');
    bossAbility.textContent = finalBattle && monster.power
      ? `${monster.power.name} · ${monster.power.description}`
      : '';
    bossAbility.classList.toggle('hidden', !finalBattle || !monster.power);
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
    reward.textContent = '+' + (question.exp + (state.challengeMode?.bonusXp || 0)) + ' XP';
    reward.classList.toggle('medium-reward', finalBattle);
    document.querySelector('#challenge-name').textContent = finalBattle
      ? 'Confronto lendário'
      : state.challengeMode.name;
    document.querySelector('#challenge-rule').textContent = finalBattle
      ? (monster.power?.description || 'Acerte cinco perguntas para vencer o chefe.')
      : state.challengeMode.rule;
    document.querySelector('.challenge-banner').classList.toggle('boss-challenge', finalBattle);

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
  state.seconds = (state.challengeMode?.time || 30) + state.timeBonus;
  state.timeBonus = 0;
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
      let challengeHeal = 0;
      state.correct++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      let rewardXp = result.gainedExp + (state.challengeMode?.bonusXp || 0);
      state.xp += rewardXp;
      if (wasFinal) {
        state.bossHits++;
        state.bossHp = Math.max(0, 100 - state.bossHits * 20);
        const bossPower = opponent.power;
        let powerMessage = '';
        if (bossPower?.type === 'combo' && state.bossHits === 3 && !state.bossPowerUsed) {
          rewardXp += 25;
          state.xp += 25;
          state.bossPowerUsed = true;
          powerMessage = ' A terceira cabeça revelou um segredo: +25 XP!';
        }
        if (bossPower?.type === 'heal' && !state.bossPowerUsed) {
          const before = state.heroHp;
          state.heroHp = Math.min(100, state.heroHp + 15);
          state.bossPowerUsed = true;
          powerMessage = ` O núcleo recuperou ${state.heroHp - before} pontos de vida.`;
        }
        document.querySelector('#feedback').textContent = state.bossHits >= 5
          ? 'Você derrotou ' + opponent.name + '! +' + rewardXp + ' XP!' + powerMessage
          : 'Acerto! Faltam ' + (5 - state.bossHits) + ' acertos para vencer o chefe. +' + rewardXp + ' XP!' + powerMessage;
       } else {
        state.monsterHits++;
        state.bossHp = Math.max(0, 100 - Math.round(state.monsterHits * 100 / 3));
        if (state.challengeMode?.heal) {
          const before = state.heroHp;
          state.heroHp = Math.min(100, state.heroHp + state.challengeMode.heal);
          challengeHeal = state.heroHp - before;
        }
        if (state.monsterHits >= 3) {
          state.monstersDefeated++;
          state.monsterHits = 0;
          state.journeyPending = true;
          document.querySelector('#feedback').textContent = 'Você derrotou ' + opponent.name + '! +' + rewardXp + ' XP!';
          if (state.monstersDefeated >= 4) state.bossHp = 100;
         } else {
          document.querySelector('#feedback').textContent = 'Acerto! Faltam ' + (3 - state.monsterHits) + ' acertos para derrotar ' + opponent.name + '. +' + rewardXp + ' XP!';
        }
      }
      if (challengeHeal > 0) {
        document.querySelector('#feedback').textContent += ` A trilha restaurou ${challengeHeal} pontos de vida.`;
      }
      if (button) button.classList.add('correct');
      animateCharacter('#hero-avatar', 'attack');
      animateCharacter('#boss-avatar', 'damage');
      document.querySelector('#boss-health').style.width = state.bossHp + '%';
     } else {
      state.streak = 0;
      let receivedDamage = result.playerDamage;
      let bossPowerMessage = '';
      if (wasFinal && opponent.power) {
        if (opponent.power.type === 'burn') {
          receivedDamage += 10;
          bossPowerMessage = ' O sopro incendiário causou 10 pontos extras de dano.';
        } else if (opponent.power.type === 'shield' && !state.bossPowerUsed) {
          receivedDamage = 0;
          state.bossPowerUsed = true;
          bossPowerMessage = ' As raízes ancestrais absorveram este ataque.';
        } else if (opponent.power.type === 'rewind' && !state.bossPowerUsed) {
          state.timeBonus = 10;
          state.bossPowerUsed = true;
          bossPowerMessage = ' Cronos rebobina o relógio: você terá 10 segundos extras na próxima pergunta.';
        }
      }
      state.heroHp = Math.max(0, state.heroHp - receivedDamage);
      state.wrongAnswers.push({
        prompt: state.question.prompt,
        selected: index >= 0 ? state.question.options[index] : 'Tempo esgotado',
        correct: state.question.options[result.correctOption]
      });
      if (button) button.classList.add('wrong');
      document.querySelector('#feedback').textContent = index < 0
        ? (wasFinal ? 'Tempo esgotado. O chefe final contra-atacou.' : 'Tempo esgotado. O monstro atacou.')
        : (wasFinal ? 'Resposta incorreta. O chefe final contra-atacou.' : 'Resposta incorreta. O monstro atacou.');
      document.querySelector('#feedback').textContent += bossPowerMessage;
      animateCharacter('#boss-avatar', 'attack');
      animateCharacter('#hero-avatar', 'damage');
      document.querySelector('#hero-health').style.width = state.heroHp + '%';
      if(state.heroHp<=0){state.endReason='Seu herói ficou sem vida. A fase terminou.';document.querySelector('#feedback').textContent+=' Seu herói ficou sem vida.';}
    }

    buttons.forEach((item, optionIndex) => {
      if (optionIndex === result.correctOption) item.classList.add('correct');
    });
    document.querySelector('#hero-health').style.width = state.heroHp + '%';
    document.querySelector('#hero-hp-value').textContent = state.heroHp + ' / 100';
    document.querySelector('#hint-button').classList.add('hidden');
    const nextButton = document.querySelector('#next-button');
    nextButton.classList.remove('hidden');
    nextButton.textContent = state.heroHp<=0
      ? 'VER RESULTADO →'
      : wasFinal
      ? (state.bossHits >= 5 ? 'VER RESULTADO →' : 'CHEFE · ' + (5 - state.bossHits) + ' VIDAS RESTANTES →')
      : state.journeyPending ? 'SEGUIR JORNADA →'
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
/** Reproduz o desfecho e mostra o resultado, incluindo respostas erradas. */
async function finish() {
  if (state.finishing) return;
  state.finishing = true;
  clearInterval(state.timer);
  const won = state.bossHits >= 5;
  const finishSequence = ++state.finishSequence;
  animateCharacter('#hero-avatar', won ? 'victory' : 'defeat');
  animateCharacter('#boss-avatar', won ? 'defeat' : 'victory');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) await new Promise(resolve => window.setTimeout(resolve, 560));
  if (finishSequence !== state.finishSequence) return;
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

  document.querySelector('#journey-rest').addEventListener('click', () => chooseJourneyPath('rest'));
  document.querySelector('#journey-study').addEventListener('click', () => chooseJourneyPath('study'));

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

    if (state.journeyPending) {
      showJourney();
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
renderHomeParty();
loadSubjects();
