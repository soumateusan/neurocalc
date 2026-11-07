/* Doença de Alzheimer — dados do PCDT (Portaria Conjunta SAES/SCTIE nº 27/2025) e das orientações da SESAB/BA.
   Fonte das orientações: https://www.ba.gov.br/saude/publicacoes/patologia/alzheimer */

export const LINK_SESAB = "https://www.ba.gov.br/saude/publicacoes/patologia/alzheimer";
export const PORTARIA = "PORTARIA CONJUNTA SAES/SCTIE Nº 27, DE 27 DE NOVEMBRO DE 2025";

export const cids = [
  { cod: "G30.0", desc: "Doença de Alzheimer de início precoce" },
  { cod: "G30.1", desc: "Doença de Alzheimer de início tardio" },
  { cod: "G30.8", desc: "Outras formas de doença de Alzheimer" },
  { cod: "F00.0", desc: "Demência na doença de Alzheimer de início precoce" },
  { cod: "F00.1", desc: "Demência na doença de Alzheimer de início tardio" },
  { cod: "F00.2", desc: "Demência na doença de Alzheimer, forma atípica ou mista" },
];

/* apresentações — "lme" é o texto exato da lista do LME 2026 */
export const apresentacoes = {
  don5: { fam: "don", nome: "Donepezila 5 mg", un: "comprimido", grupo: "1A", lme: "Donepezila 5 mg (comprimido)" },
  don10: { fam: "don", nome: "Donepezila 10 mg", un: "comprimido", grupo: "1A", lme: "Donepezila 10 mg (comprimido)" },
  gal8: { fam: "gal", nome: "Galantamina 8 mg (liberação prolongada)", un: "cápsula", grupo: "1A", lme: "Galantamina 8 mg (cápsula de liberação prolongada)" },
  gal16: { fam: "gal", nome: "Galantamina 16 mg (liberação prolongada)", un: "cápsula", grupo: "1A", lme: "Galantamina 16 mg (cápsula de liberação prolongada)" },
  gal24: { fam: "gal", nome: "Galantamina 24 mg (liberação prolongada)", un: "cápsula", grupo: "1A", lme: "Galantamina 24 mg (cápsula de liberação prolongada)" },
  mem10: { fam: "mem", nome: "Memantina 10 mg", un: "comprimido", grupo: "1A", lme: "Memantina 10 mg (comprimido revestido)" },
  riv15: { fam: "riv", nome: "Rivastigmina 1,5 mg", un: "cápsula", grupo: "1A", lme: "Rivastigmina 1,5 mg (cápsula)" },
  riv3: { fam: "riv", nome: "Rivastigmina 3 mg", un: "cápsula", grupo: "1A", lme: "Rivastigmina 3 mg (cápsula)" },
  riv45: { fam: "riv", nome: "Rivastigmina 4,5 mg", un: "cápsula", grupo: "1A", lme: "Rivastigmina 4,5 mg (cápsula)" },
  riv6: { fam: "riv", nome: "Rivastigmina 6 mg", un: "cápsula", grupo: "1A", lme: "Rivastigmina 6 mg (cápsula)" },
  rivSol: { fam: "riv", nome: "Rivastigmina 2 mg/mL solução oral (frasco 120 mL)", un: "frasco", grupo: "1B", lme: "Rivastigmina 2,0 mg/mL solução oral (frasco de 120 mL)" },
  rivAd9: { fam: "riv", nome: "Rivastigmina 9 mg adesivo transdérmico (4,6 mg/24 h)", un: "adesivo", grupo: "1A", lme: "Rivastigmina 9 mg (adesivo transdérmico)" },
  rivAd18: { fam: "riv", nome: "Rivastigmina 18 mg adesivo transdérmico (9,5 mg/24 h)", un: "adesivo", grupo: "1A", lme: "Rivastigmina 18 mg (adesivo transdérmico)" },
};

export const familias = {
  don: { nome: "Donepezila", termo: "Donepezila", classe: "iache" },
  gal: { nome: "Galantamina", termo: "Galantamina", classe: "iache" },
  riv: { nome: "Rivastigmina", termo: "Rivastigmina", classe: "iache" },
  mem: { nome: "Memantina", termo: "Memantina", classe: "mem" },
};

const plural = (un, n) => (n === 1 ? un : un === "cápsula" ? "cápsulas" : un === "comprimido" ? "comprimidos" : un === "adesivo" ? "adesivos" : "frascos");
export const qtdTexto = (ap, n) => `${n} ${plural(apresentacoes[ap].un, n)}`;

/* esquemas prontos — cada linha é um item da receita e uma linha do LME.
   "meses" = quantidade por mês (6 colunas do LME). Tudo editável depois. */
const m6 = (...v) => [...v, ...Array(6 - v.length).fill(v[v.length - 1])];
export const esquemas = [
  { id: "don-tit", fam: "don", nome: "Donepezila — titulação (5 → 10 mg)", itens: [
    { ap: "don5", pos: "Tomar 1 comprimido por via oral à noite, ao deitar, por 4 a 6 semanas.", meses: [30, 0, 0, 0, 0, 0] },
    { ap: "don10", pos: "Após, tomar 1 comprimido de 10 mg por via oral à noite, ao deitar, uso contínuo.", meses: [0, 30, 30, 30, 30, 30] },
  ] },
  { id: "don5", fam: "don", nome: "Donepezila 5 mg/dia", itens: [
    { ap: "don5", pos: "Tomar 1 comprimido por via oral à noite, ao deitar, uso contínuo.", meses: m6(30) },
  ] },
  { id: "don10", fam: "don", nome: "Donepezila 10 mg/dia (manutenção)", itens: [
    { ap: "don10", pos: "Tomar 1 comprimido por via oral à noite, ao deitar, uso contínuo.", meses: m6(30) },
  ] },
  { id: "gal-tit", fam: "gal", nome: "Galantamina — titulação (8 → 16 → 24 mg)", itens: [
    { ap: "gal8", pos: "Tomar 1 cápsula por via oral pela manhã, com alimento, por 4 semanas.", meses: [30, 0, 0, 0, 0, 0] },
    { ap: "gal16", pos: "Após, tomar 1 cápsula de 16 mg por via oral pela manhã, com alimento, por 4 semanas.", meses: [0, 30, 0, 0, 0, 0] },
    { ap: "gal24", pos: "Após, tomar 1 cápsula de 24 mg por via oral pela manhã, com alimento, uso contínuo (se tolerado).", meses: [0, 0, 30, 30, 30, 30] },
  ] },
  { id: "gal16", fam: "gal", nome: "Galantamina 16 mg/dia (manutenção)", itens: [
    { ap: "gal16", pos: "Tomar 1 cápsula por via oral pela manhã, com alimento, uso contínuo.", meses: m6(30) },
  ] },
  { id: "gal24", fam: "gal", nome: "Galantamina 24 mg/dia (manutenção)", itens: [
    { ap: "gal24", pos: "Tomar 1 cápsula por via oral pela manhã, com alimento, uso contínuo.", meses: m6(30) },
  ] },
  { id: "riv-tit", fam: "riv", nome: "Rivastigmina cápsula — titulação (1,5 → 4,5 mg 12/12 h)", itens: [
    { ap: "riv15", pos: "Tomar 1 cápsula por via oral de 12/12 horas, junto às refeições, por 4 semanas.", meses: [60, 0, 0, 0, 0, 0] },
    { ap: "riv3", pos: "Após, tomar 1 cápsula de 3 mg por via oral de 12/12 horas, junto às refeições, por 4 semanas.", meses: [0, 60, 0, 0, 0, 0] },
    { ap: "riv45", pos: "Após, tomar 1 cápsula de 4,5 mg por via oral de 12/12 horas, junto às refeições, uso contínuo (aumentar para 6 mg 12/12 h se tolerado).", meses: [0, 0, 60, 60, 60, 60] },
  ] },
  ...["riv3", "riv45", "riv6"].map((ap) => ({ id: ap, fam: "riv", nome: `${apresentacoes[ap].nome} 12/12 h (manutenção)`, itens: [
    { ap, pos: "Tomar 1 cápsula por via oral de 12/12 horas, junto às refeições, uso contínuo.", meses: m6(60) },
  ] })),
  { id: "rivAd-tit", fam: "riv", nome: "Rivastigmina adesivo — titulação (9 → 18 mg)", itens: [
    { ap: "rivAd9", pos: "Aplicar 1 adesivo sobre a pele íntegra (costas, braço ou tórax) 1 vez ao dia, trocando a cada 24 horas e alternando o local, por 4 semanas.", meses: [30, 0, 0, 0, 0, 0] },
    { ap: "rivAd18", pos: "Após, aplicar 1 adesivo de 18 mg 1 vez ao dia, trocando a cada 24 horas e alternando o local, uso contínuo.", meses: [0, 30, 30, 30, 30, 30] },
  ] },
  ...["rivAd9", "rivAd18"].map((ap) => ({ id: ap, fam: "riv", nome: `${apresentacoes[ap].nome} (manutenção)`, itens: [
    { ap, pos: "Aplicar 1 adesivo sobre a pele íntegra (costas, braço ou tórax) 1 vez ao dia, trocando a cada 24 horas e alternando o local, uso contínuo.", meses: m6(30) },
  ] })),
  ...[1.5, 3, 4.5, 6].map((mg) => {
    const ml = String(mg / 2).replace(".", ",");
    const frascos = Math.ceil((mg * 2 * 30) / 2 / 120);
    return { id: `rivSol${mg}`, fam: "riv", nome: `Rivastigmina solução oral — ${String(mg).replace(".", ",")} mg 12/12 h`, itens: [
      { ap: "rivSol", pos: `Tomar ${ml} mL (${String(mg).replace(".", ",")} mg) por via oral de 12/12 horas, junto às refeições, uso contínuo.`, meses: m6(frascos) },
    ] };
  }),
  { id: "mem-tit", fam: "mem", nome: "Memantina — titulação semanal (5 → 20 mg)", itens: [
    { ap: "mem10", pos: "1ª semana: ½ comprimido pela manhã. 2ª semana: ½ comprimido de 12/12 horas. 3ª semana: 1 comprimido pela manhã e ½ à noite. A partir da 4ª semana: 1 comprimido de 12/12 horas, uso contínuo.", meses: [40, 60, 60, 60, 60, 60] },
  ] },
  { id: "mem20", fam: "mem", nome: "Memantina 20 mg/dia (manutenção)", itens: [
    { ap: "mem10", pos: "Tomar 1 comprimido por via oral de 12/12 horas, uso contínuo.", meses: m6(60) },
  ] },
];

/* exames — validade em meses (null = indeterminada) */
export const exames = [
  { id: "img", nome: "Laudo de TC ou RM de encéfalo", val: null, para: "todos" },
  { id: "creat", nome: "Creatinina", val: 3, para: ["gal", "mem"] },
  { id: "tgp", nome: "ALT/TGP", val: 3, para: ["gal"] },
  { id: "tgo", nome: "AST/TGO", val: 3, para: ["gal"] },
  { id: "tfg", nome: "Taxa de filtração glomerular (TFG)", val: 3, para: ["mem"], alternativaDe: "creat", nota: "para memantina, creatinina OU TFG" },
];
export const examesComplementares = [
  { id: "hemo", nome: "Hemograma completo", val: 3 },
  { id: "na", nome: "Sódio", val: 3 },
  { id: "k", nome: "Potássio", val: 3 },
  { id: "ca", nome: "Cálcio", val: 3 },
  { id: "gli", nome: "Glicose", val: 3 },
  { id: "ureia", nome: "Ureia", val: 3 },
  { id: "tsh", nome: "TSH", val: 3 },
  { id: "sifilis", nome: "Sorologia para sífilis", val: 12 },
  { id: "hiv", nome: "HIV", val: 12 },
  { id: "b12", nome: "Vitamina B12 e ácido fólico", val: 3 },
];
export const todosExames = [...exames, ...examesComplementares];

/* validade: dentro / vencido / sem data */
export function situacaoExame(ex, reg) {
  if (!reg || !reg.feito) return { ok: false, txt: "pendente" };
  if (ex.val == null) return { ok: true, txt: "validade indeterminada" };
  if (!reg.data) return { ok: false, txt: "informe a data" };
  const lim = new Date(reg.data + "T00:00:00");
  lim.setMonth(lim.getMonth() + ex.val);
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dias = Math.round((lim - hoje) / 86400000);
  if (dias < 0) return { ok: false, txt: `vencido há ${-dias} dia${-dias === 1 ? "" : "s"}` };
  return { ok: true, txt: `válido até ${lim.toLocaleDateString("pt-BR")}${dias <= 15 ? " (vence logo)" : ""}` };
}

/* critérios de escala (MEEM por escolaridade + CDR) */
export const criterios = [
  { id: "iache", nome: "Inibidor da acetilcolinesterase (donepezila, galantamina ou rivastigmina)", alto: [12, 24], baixo: [8, 21], cdr: [1, 2] },
  { id: "combo", nome: "Memantina associada a inibidor da acetilcolinesterase", alto: [12, 19], baixo: [8, 15], cdr: [2] },
  { id: "mono", nome: "Memantina em monoterapia", alto: [5, 11], baixo: [3, 7], cdr: [3] },
];

/* qual critério se aplica ao que foi prescrito */
export function criterioDoTratamento(fams) {
  const temI = fams.some((f) => familias[f]?.classe === "iache");
  const temM = fams.includes("mem");
  if (temI && temM) return "combo";
  if (temM) return "mono";
  if (temI) return "iache";
  return null;
}

export function avaliaCriterio(c, meem, escBaixa, cdr) {
  const faixa = escBaixa ? c.baixo : c.alto;
  const meemOk = meem != null && meem >= faixa[0] && meem <= faixa[1];
  const cdrOk = cdr != null && c.cdr.includes(cdr);
  return { faixa, meemOk, cdrOk, ok: meemOk && cdrOk };
}

export const documentos = [
  { id: "ident", nome: "Cópia do documento de identidade e CPF do paciente", manual: true },
  { id: "resid", nome: "Cópia do comprovante de residência (paciente ou responsável legal)", manual: true, nota: "Se em nome de terceiros, preencher o formulário específico da SESAB." },
  { id: "lme", nome: "LME adequadamente preenchido (renovar semestralmente)" },
  { id: "presc", nome: "Prescrição médica (Lei 13.732/2018, Portaria SVS/MS 344/1998)" },
  { id: "ter", nome: "Termo de Esclarecimento e Responsabilidade (TER)" },
  { id: "meem", nome: "Mini-Exame do Estado Mental (MEEM)" },
  { id: "cdr", nome: "Escala CDR" },
  { id: "acessoOuRel", nome: "Formulário de acesso OU relatório médico" },
];

export const unidades = [
  { regiao: "Capital e Região Metropolitana", nome: "CREASI — Centro de Referência Estadual de Atenção à Saúde do Idoso",
    end: "Av. Antônio Carlos Magalhães, s/n, ao lado do edifício WN, Salvador - BA",
    tel: "(71) 3103-6139 · (71) 99920-9849 (WhatsApp)", horario: "7h às 17h (farmácia)",
    email: "creasi.farmacia@saude.ba.gov.br · sesab.creasi@saude.ba.gov.br" },
  { regiao: "Interior", nome: "Bases Regionais de Saúde e Núcleos Regionais de Saúde (antigas DIRES)" },
];

/* formulário de acesso — textos do formulário oficial */
export const acessoTxt = {
  a: [
    "Interferem com a habilidade no trabalho ou em atividades usuais;",
    "Representam declínio em relação a níveis prévios de funcionamento e desempenho;",
    "Não são explicáveis por delirium (estado confusional agudo) ou doença psiquiátrica maior.",
  ],
  b: [
    "Início insidioso, com evolução ao longo de meses a anos;",
    "Clara história de perda cognitiva referida pelo paciente e/ou informante;",
    "Déficit cognitivo mais proeminente e inicial evidenciado por avaliação cognitiva, incluindo o Mini-Exame do Estado Mental (MEEM);",
    "Tomografia computadorizada ou, preferencialmente, ressonância magnética de crânio, com achados compatíveis e/ou que excluam outras possibilidades diagnósticas ou comorbidades, principalmente doença cerebrovascular.",
  ],
  excl: [
    "Doença cerebrovascular importante, definida por história de AVC temporalmente relacionada ao início ou à piora do comprometimento cognitivo, presença de infartos múltiplos ou extensos ou lesões acentuadas da substância branca evidenciadas por exame de neuroimagem;",
    "Características centrais de demência com corpos de Lewy, tais como alucinações visuais recorrentes, parkinsonismo, distúrbio comportamental do sono REM e flutuação cognitiva;",
    "Características proeminentes da variante comportamental da demência frontotemporal, tais como hiperoralidade, hipersexualidade e perseveração;",
    "Características proeminentes de afasia progressiva primária, manifestando-se como variante semântica, com discurso fluente, anomia e dificuldades de memória semântica, ou como variante não fluente, com agramatismo e/ou apraxia de fala importante;",
    "Outra doença concomitante ativa, neurológica ou não neurológica, ou uso de medicamento que possa exercer efeito substancial sobre a cognição.",
  ],
  todos: ["Identificação de incapacidade de adesão ao tratamento."],
  iache: [
    "Evidência de lesão cerebral orgânica ou metabólica simultânea não compensada;",
    "Insuficiência cardíaca ou arritmia cardíaca graves;",
    "Alteração da condução cardíaca, tais como bradicardia sintomática, bloqueio atrioventricular (AV) de segundo ou terceiro grau ou síndrome do nó sinusal doente;",
    "Asma ou doença pulmonar obstrutiva grave ou descompensada.",
  ],
  gal: ["Insuficiência hepática ou renal graves."],
  mem: ["Clearance de creatinina inferior a 5 mL/minuto/1,73 m²."],
};
