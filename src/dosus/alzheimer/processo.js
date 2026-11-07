import { meemCalc, meemInicial } from "../../shared/meem.jsx";
import { cdrCalc, cdrInicial } from "../../shared/cdr.jsx";
import { apresentacoes, exames, situacaoExame, criterioDoTratamento, criterios, avaliaCriterio, familias } from "./dados.js";
import { hojeISO } from "../../shared/ui.jsx";

export const novoAlzheimer = () => ({
  cid: "",
  tipo: "inicio", // inicio | continuidade | troca
  meem: meemInicial, meemData: hojeISO(),
  cdr: cdrInicial, cdrAplicado: false, cdrData: hojeISO(),
  presc: { itens: [], data: hojeISO() },
  hist: { inicio: "", queixas: "", funcional: "", neuroTipo: "RM", neuroData: "", neuroLaudo: "", comorbidades: "", medicamentos: "", tratPrevio: null, tratTexto: "", estab: null },
  lme: { anamnese: "", anamneseEditada: false, preenchidoPor: "medico", outroNome: "", outroCPF: "", docTipo: "CPF", data: hojeISO() },
  termo: { autoriza: null, local: "", data: hojeISO() },
  acesso: { a: [false, false, false], b: [false, false, false, false], excl: [false, false, false, false, false], exclNenhuma: false,
    adesao: null, iache: [false, false, false, false], iacheNenhuma: false, gal: null, mem: null, obs: "", data: hojeISO() },
  rel: { extra: "", usadoEm: null },
  exames: {},
  docs: { ident: false, resid: false },
});

export const pacienteVazio = () => ({
  nome: "", nascimento: "", idade: "", sexo: "", mae: "", cpf: "", cns: "", peso: "", altura: "",
  tel1: "", tel2: "", email: "", raca: "", etnia: "", escolaridade: "", cidade: "",
  incapaz: false, responsavel: "", respDoc: "", respParentesco: "",
});

export function idadeDe(p) {
  if (p.nascimento) {
    const n = new Date(p.nascimento + "T00:00:00"), h = new Date();
    let i = h.getFullYear() - n.getFullYear();
    if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) i--;
    return i >= 0 && i < 130 ? String(i) : "";
  }
  return p.idade || "";
}

/* escolaridade em anos → faixa do corte do MEEM (Brucki 2003) */
export function anosParaEscIdx(anos) {
  if (anos === "" || anos == null) return null;
  const a = Number(anos);
  if (a <= 0) return 0;
  if (a <= 4) return 1;
  if (a <= 8) return 2;
  if (a <= 11) return 3;
  return 4;
}

/* ≤ 4 anos de estudo? (corte dos critérios do PCDT) */
export function escolaridadeBaixa(pac, meem) {
  if (pac.escolaridade !== "" && pac.escolaridade != null) return Number(pac.escolaridade) <= 4;
  const idx = meem?.escIdx;
  if (idx == null) return null;
  return idx <= 1;
}

const vazio = (v) => v == null || String(v).trim() === "";

/* tudo o que é calculado a partir do processo — usado pelas telas e pelo checklist */
export function derivar(pac, d, med) {
  const meem = meemCalc(d.meem);
  const cdr = cdrCalc(d.cdr);
  const itens = d.presc.itens || [];
  const fams = [...new Set(itens.map((i) => apresentacoes[i.ap]?.fam).filter(Boolean))];
  const nomesFam = fams.map((f) => familias[f].nome);
  const crit = criterioDoTratamento(fams);
  const escBaixa = escolaridadeBaixa(pac, d.meem);
  const meemAplicado = meem.marcados;
  const avaliacao = crit && meemAplicado && d.cdrAplicado && escBaixa != null
    ? avaliaCriterio(criterios.find((c) => c.id === crit), meem.total, escBaixa, cdr.global) : null;

  /* exames obrigatórios conforme os medicamentos */
  const exObrig = exames.filter((e) => e.para === "todos" || e.para.some((f) => fams.includes(f)));
  const exStatus = exObrig.map((e) => ({ ...e, sit: situacaoExame(e, d.exames[e.id]) }));
  // memantina aceita creatinina OU TFG; sem galantamina a creatinina pode ser substituída pela TFG
  const tfg = exStatus.find((e) => e.id === "tfg");
  const creat = exStatus.find((e) => e.id === "creat");
  const soMem = fams.includes("mem") && !fams.includes("gal");
  const exPend = exStatus.filter((e) => {
    if (e.sit.ok) return false;
    if (e.id === "tfg") return !(creat && creat.sit.ok);
    if (e.id === "creat" && soMem) return !(tfg && tfg.sit.ok);
    return true;
  });

  const faltaMed = [];
  if (vazio(med.nome)) faltaMed.push("nome do médico");
  if (vazio(med.crm)) faltaMed.push("CRM");
  if (vazio(med.uf)) faltaMed.push("UF do CRM");

  /* LME */
  const faltaLME = [];
  if (vazio(med.cnes)) faltaLME.push("CNES");
  if (vazio(med.estabelecimento)) faltaLME.push("estabelecimento");
  if (vazio(pac.nome)) faltaLME.push("nome do paciente");
  if (vazio(pac.mae)) faltaLME.push("nome da mãe");
  if (vazio(pac.peso)) faltaLME.push("peso");
  if (vazio(pac.altura)) faltaLME.push("altura");
  if (!itens.length) faltaLME.push("medicamento");
  if (vazio(d.cid)) faltaLME.push("CID-10");
  if (d.hist.tratPrevio == null) faltaLME.push("tratamento prévio (sim/não)");
  if (vazio(med.nome)) faltaLME.push("nome do médico");
  if (vazio(med.cns)) faltaLME.push("CNS do médico");
  if (pac.incapaz && vazio(pac.responsavel)) faltaLME.push("nome do responsável");

  /* prescrição */
  const faltaPresc = [];
  if (!itens.length) faltaPresc.push("escolher o medicamento");
  if (vazio(pac.nome)) faltaPresc.push("nome do paciente");
  faltaPresc.push(...faltaMed);

  /* TER */
  const faltaTER = [];
  if (vazio(pac.nome)) faltaTER.push("nome do paciente");
  if (d.termo.autoriza == null) faltaTER.push("autorização de uso das informações");
  if (!itens.length) faltaTER.push("medicamento");
  if (vazio(d.termo.local) && vazio(med.cidade)) faltaTER.push("local");
  if (pac.incapaz && vazio(pac.responsavel)) faltaTER.push("responsável legal");
  faltaTER.push(...faltaMed);

  /* formulário de acesso */
  const a = d.acesso;
  const faltaAcesso = [];
  if (vazio(pac.nome)) faltaAcesso.push("nome do paciente");
  if (vazio(d.cid)) faltaAcesso.push("CID-10");
  if (!a.a.every(Boolean)) faltaAcesso.push("critérios obrigatórios (A)");
  if (!a.b.some(Boolean)) faltaAcesso.push("ao menos uma característica clínica (B)");
  if (!a.exclNenhuma && !a.excl.some(Boolean)) faltaAcesso.push("critérios de exclusão");
  if (a.excl.some(Boolean)) faltaAcesso.push("há critério de exclusão marcado");
  if (a.adesao == null) faltaAcesso.push("adesão ao tratamento");
  if (fams.some((f) => familias[f].classe === "iache") && !a.iacheNenhuma && !a.iache.some(Boolean)) faltaAcesso.push("contraindicações dos IAChE");
  if (a.gal == null) faltaAcesso.push("item da galantamina");
  if (a.mem == null) faltaAcesso.push("item da memantina");
  if (d.hist.estab == null) faltaAcesso.push("estabilização/melhora clínica");
  faltaAcesso.push(...faltaMed);
  const contraind = a.adesao === "incapaz" || a.iache.some(Boolean) || a.gal === "sim" || a.mem === "sim";

  /* relatório */
  const faltaRel = [];
  if (vazio(d.cid)) faltaRel.push("CID-10");
  if (vazio(d.hist.queixas)) faltaRel.push("história clínica");
  if (!itens.length) faltaRel.push("medicamento solicitado");
  if (d.hist.tratPrevio == null) faltaRel.push("tratamento prévio");
  if (!d.rel.usadoEm) faltaRel.push("copiar ou imprimir o relatório");

  const checklist = [
    { id: "ident", grupo: "doc", nome: "Identidade e CPF do paciente (cópia)", ok: d.docs.ident, manual: true, falta: ["confirmar que o paciente trouxe a cópia"] },
    { id: "resid", grupo: "doc", nome: "Comprovante de residência (cópia)", ok: d.docs.resid, manual: true, falta: ["confirmar a cópia; se em nome de terceiros, formulário específico"] },
    { id: "meem", grupo: "doc", nome: "MEEM", sec: "meem", ok: meemAplicado && escBaixa != null, falta: [!meemAplicado && "aplicar o MEEM", escBaixa == null && "informar a escolaridade"].filter(Boolean) },
    { id: "cdr", grupo: "doc", nome: "CDR", sec: "cdr", ok: d.cdrAplicado, falta: ["aplicar o CDR"] },
    { id: "exames", grupo: "doc", nome: "Exames obrigatórios", sec: "exames", ok: exPend.length === 0, falta: exPend.map((e) => `${e.nome}: ${e.sit.txt}`) },
    { id: "presc", grupo: "doc", nome: "Prescrição médica", sec: "prescricao", ok: faltaPresc.length === 0, falta: faltaPresc },
    { id: "lme", grupo: "doc", nome: "LME", sec: "lme", ok: faltaLME.length === 0, falta: faltaLME },
    { id: "ter", grupo: "doc", nome: "Termo de Esclarecimento (TER)", sec: "termo", ok: faltaTER.length === 0, falta: faltaTER },
    { id: "acessoOuRel", grupo: "doc", nome: "Formulário de acesso OU relatório", sec: faltaAcesso.length <= faltaRel.length ? "acesso" : "relatorio",
      ok: faltaAcesso.length === 0 || faltaRel.length === 0,
      falta: faltaAcesso.length <= faltaRel.length ? faltaAcesso.map((f) => `formulário: ${f}`) : faltaRel.map((f) => `relatório: ${f}`) },
    { id: "criterio", grupo: "crit", nome: "Critérios de MEEM/CDR do PCDT", sec: "visao", ok: !!avaliacao?.ok, alerta: !!avaliacao && !avaliacao.ok,
      falta: !crit ? ["escolher o medicamento"] : !avaliacao ? ["aplicar MEEM e CDR e informar escolaridade"]
        : [!avaliacao.meemOk && `MEEM ${meem.total} fora da faixa ${avaliacao.faixa[0]}–${avaliacao.faixa[1]}`,
           !avaliacao.cdrOk && `CDR ${cdr.global} fora do exigido`].filter(Boolean) },
  ];
  const feitos = checklist.filter((c) => c.ok).length;

  return { meem, cdr, itens, fams, nomesFam, crit, escBaixa, avaliacao, exStatus, exPend, faltaLME, faltaPresc, faltaTER, faltaAcesso, faltaRel, contraind, checklist, feitos, meemAplicado };
}
