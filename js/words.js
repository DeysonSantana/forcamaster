/**
 * ForcaMaster - Banco de Palavras e Utilitários Linguísticos
 * Vocabulário oficial pt-BR com acentuação gráfica real, categorias e normalização transparente.
 */

export const WORD_BANK = [
  // ANIMAIS
  { word: 'GATO', category: 'Animais', hint: 'Felino doméstico que adora caixas de papelão', difficulty: 'facil' },
  { word: 'CACHORRO', category: 'Animais', hint: 'Considerado o melhor amigo do ser humano', difficulty: 'facil' },
  { word: 'LEÃO', category: 'Animais', hint: 'Conhecido na cultura popular como o rei da selva', difficulty: 'facil' },
  { word: 'GIRAFA', category: 'Animais', hint: 'Mamífero mais alto do mundo com longo pescoço', difficulty: 'facil' },
  { word: 'ELEFANTE', category: 'Animais', hint: 'Maior mamífero terrestre com tromba flexível', difficulty: 'medio' },
  { word: 'GOLFINHO', category: 'Animais', hint: 'Mamífero marinho altamente inteligente e sociável', difficulty: 'medio' },
  { word: 'CAMALEÃO', category: 'Animais', hint: 'Réptil célebre por mudar de cor para se camuflar', difficulty: 'medio' },
  { word: 'ÁGUIA-REAL', category: 'Animais', hint: 'Poderosa ave de rapina símbolo de força e visão', difficulty: 'medio' },
  { word: 'ORNITORRINCO', category: 'Animais', hint: 'Mamífero semi-aquático que bota ovos e tem bico de pato', difficulty: 'dificil' },
  { word: 'TAMANDUÁ-BANDEIRA', category: 'Animais', hint: 'Alimenta-se quase exclusivamente de formigas e cupins', difficulty: 'dificil' },
  { word: 'PANGOLIM', category: 'Animais', hint: 'Mamífero coberto por escamas de queratina protetoras', difficulty: 'dificil' },
  { word: 'TUBARÃO-BALEIA', category: 'Animais', hint: 'O maior peixe existente no planeta Terra', difficulty: 'dificil' },

  // TECNOLOGIA & CIÊNCIA
  { word: 'ROBÔ', category: 'Tecnologia', hint: 'Máquina automática programada para realizar tarefas', difficulty: 'facil' },
  { word: 'INTERNET', category: 'Tecnologia', hint: 'Rede mundial de computadores interconectados', difficulty: 'facil' },
  { word: 'MOUSE', category: 'Tecnologia', hint: 'Dispositivo periférico apontador de computadores', difficulty: 'facil' },
  { word: 'ALGORITMO', category: 'Tecnologia', hint: 'Sequência finita e ordenada de instruções lógicas', difficulty: 'medio' },
  { word: 'PROCESSADOR', category: 'Tecnologia', hint: 'O cérebro computacional de um dispositivo eletrônico', difficulty: 'medio' },
  { word: 'MICRO-ONDAS', category: 'Tecnologia', hint: 'Eletrodoméstico que aquece alimentos por ondas eletromagnéticas', difficulty: 'medio' },
  { word: 'CRIPTOGRAFIA', category: 'Tecnologia', hint: 'Técnica de transformar dados em formato codificado seguro', difficulty: 'dificil' },
  { word: 'MICROSSERVIÇO', category: 'Tecnologia', hint: 'Padrão de arquitetura de software modular e independente', difficulty: 'dificil' },
  { word: 'NANOTECNOLOGIA', category: 'Tecnologia', hint: 'Manipulação da matéria em escala atômica e molecular', difficulty: 'dificil' },
  { word: 'INTELIGÊNCIA ARTIFICIAL', category: 'Tecnologia', hint: 'Capacidade de máquinas simularem raciocínio e aprendizado', difficulty: 'dificil' },

  // PAÍSES & GEOGRAFIA
  { word: 'BRASIL', category: 'Geografia', hint: 'Maior país da América do Sul e pentacampeão mundial', difficulty: 'facil' },
  { word: 'CANADÁ', category: 'Geografia', hint: 'Segundo maior país do mundo em área total territorial', difficulty: 'facil' },
  { word: 'JAPÃO', category: 'Geografia', hint: 'Terra do Sol Nascente conhecida pela tecnologia e tradição', difficulty: 'facil' },
  { word: 'ARGENTINA', category: 'Geografia', hint: 'País vizinho do Brasil famoso pelo tango e alfajor', difficulty: 'medio' },
  { word: 'AUSTRÁLIA', category: 'Geografia', hint: 'País-continente famoso pelos cangurus e a Grande Barreira de Corais', difficulty: 'medio' },
  { word: 'ÁFRICA DO SUL', category: 'Geografia', hint: 'Nação do extremo sul africano com 3 capitais oficiais', difficulty: 'medio' },
  { word: 'MADAGASCAR', category: 'Geografia', hint: 'Grande ilha no sudeste da África com lêmures e baobás', difficulty: 'dificil' },
  { word: 'LIECHTENSTEIN', category: 'Geografia', hint: 'Pequeno principado europeu encravado nos Alpes', difficulty: 'dificil' },

  // ALIMENTOS & CULINÁRIA
  { word: 'PIZZA', category: 'Gastronomia', hint: 'Prato de massa assada coberta por queijo e molho', difficulty: 'facil' },
  { word: 'BANANA', category: 'Gastronomia', hint: 'Fruta tropical amarela muito rica em potássio', difficulty: 'facil' },
  { word: 'PÃO DE QUEIJO', category: 'Gastronomia', hint: 'Iguaria clássica da culinária mineira feita com polvilho', difficulty: 'facil' },
  { word: 'CHOCOLATE', category: 'Gastronomia', hint: 'Doce obtido a partir da torra e moagem do cacau', difficulty: 'medio' },
  { word: 'FEIJOADA', category: 'Gastronomia', hint: 'Prato tradicional brasileiro de feijão preto e carnes', difficulty: 'medio' },
  { word: 'AÇAÍ NA TIGELA', category: 'Gastronomia', hint: 'Fruto roxo típico da Amazônia servido bem gelado', difficulty: 'medio' },
  { word: 'STROGONOFF', category: 'Gastronomia', hint: 'Prato de carne em tiras com molho cremoso e cogumelos', difficulty: 'dificil' },
  { word: 'RATATOUILLE', category: 'Gastronomia', hint: 'Guisado francês clássico de berinjela, abobrinha e tomate', difficulty: 'dificil' },
  { word: 'PETIT GÂTEAU', category: 'Gastronomia', hint: 'Bolo quente de chocolate com recheio cremoso e sorvete', difficulty: 'dificil' },

  // PROFISSÕES
  { word: 'MÉDICO', category: 'Profissões', hint: 'Profissional da saúde responsável por diagnosticar e tratar pacientes', difficulty: 'facil' },
  { word: 'PILOTO', category: 'Profissões', hint: 'Comanda aeronaves, navios ou veículos de competição', difficulty: 'facil' },
  { word: 'ARQUITETO', category: 'Profissões', hint: 'Projeta espaços habitacionais, edifícios e cidades', difficulty: 'medio' },
  { word: 'ENGENHEIRO', category: 'Profissões', hint: 'Aplica ciência e matemática para criar soluções práticas', difficulty: 'medio' },
  { word: 'ASTRÔNOMO', category: 'Profissões', hint: 'Cientista que investiga planetas, estrelas e o cosmos', difficulty: 'dificil' },
  { word: 'PALEONTÓLOGO', category: 'Profissões', hint: 'Cientista que pesquisa fósseis de seres extintos', difficulty: 'dificil' },

  // CULTURA & COTIDIANO
  { word: 'CINEMA', category: 'Cultura', hint: 'A sétima arte que combina imagens em movimento e som', difficulty: 'facil' },
  { word: 'CORAÇÃO', category: 'Cultura', hint: 'Órgão vital associado poeticamente às emoções e sentimentos', difficulty: 'facil' },
  { word: 'ROTEIRISTA', category: 'Cultura', hint: 'Autor do texto e diálogos de produções audiovisuais', difficulty: 'medio' },
  { word: 'ÁGUA-VIVA', category: 'Cultura', hint: 'Animal gelatinoso marinho que pode queimar ao toque', difficulty: 'medio' },
  { word: 'PARALELEPÍPEDO', category: 'Cultura', hint: 'Bloco de pedra com seis faces retangulares usado em calçamentos', difficulty: 'dificil' }
];

/**
 * Remove todos os diacríticos e acentos da string, convertendo 'Ç' em 'C',
 * 'Ã' em 'A', etc., preservando caracteres especiais (como hífen e espaço).
 */
export function removeAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos combinados
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'C')
    .toUpperCase();
}

/**
 * Normaliza um caractere isolado para comparação nas regras do jogo.
 * Ex: 'Á', 'À', 'Ã' -> 'A'; 'É', 'Ê' -> 'E'; 'Ç' -> 'C'
 */
export function normalizeChar(char) {
  if (!char) return '';
  const upper = char.toUpperCase();
  const normalized = upper
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ç/g, 'C');
  return normalized;
}

/**
 * Retorna uma palavra aleatória do banco
 */
export function getRandomWord(difficulty = 'todos', category = 'todas') {
  let list = [...WORD_BANK];

  if (difficulty && difficulty !== 'todos') {
    list = list.filter(w => w.difficulty === difficulty);
  }

  if (category && category !== 'todas') {
    list = list.filter(w => w.category === category);
  }

  if (list.length === 0) {
    list = WORD_BANK;
  }

  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Retorna lista única de categorias
 */
export function getCategories() {
  const cats = new Set(WORD_BANK.map(w => w.category));
  return Array.from(cats).sort();
}
