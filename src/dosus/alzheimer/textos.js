import { apresentacoes, familias, cids, qtdTexto, criterios, acessoTxt, PORTARIA, situacaoExame, todosExames } from "./dados.js";
import { idadeDe } from "./processo.js";
import { meemCutoffs } from "../../shared/meem.jsx";

const fmt = (iso) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("/") : iso || "");
const v = (n) => String(n).replace(".", ",");
const minusc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const semPonto = (s) => String(s || "").trim().replace(/[.;]\s*$/, "");

export const cidDesc = (cod) => cids.find((c) => c.cod === cod)?.desc || "";

function sexoTxt(p) {
  return p.sexo === "F" ? "sexo feminino" : p.sexo === "M" ? "sexo masculino" : "";
}

function escolaridadeTxt(pac, meem) {
  if (pac.escolaridade !== "" && pac.escolaridade != null) {
    const a = Number(pac.escolaridade);
    return a === 0 ? "analfabeto(a)" : `${a} ano${a === 1 ? "" : "s"} de escolaridade`;
  }
  if (meem?.escIdx != null) return `escolaridade ${meemCutoffs[meem.escIdx][0].toLowerCase()}`;
  return "";
}

export function textoMEEM(pac, d, der) {
  if (!der.meemAplicado) return "";
  const esc = escolaridadeTxt(pac, d.meem);
  return `MEEM ${der.meem.total}/30${d.meemData ? ` em ${fmt(d.meemData)}` : ""}${esc ? ` (${esc})` : ""}`;
}
export function textoCDR(d, der) {
  if (!d.cdrAplicado) return "";
  return `CDR global ${v(der.cdr.global)} (${der.cdr.label.toLowerCase()}), CDR-SOB ${v(der.cdr.sob)}${d.cdrData ? ` em ${fmt(d.cdrData)}` : ""}`;
}
export function textoNeuro(d) {
  const h = d.hist;
  if (!h.neuroLaudo && !h.neuroData) return "";
  const tipo = h.neuroTipo === "TC" ? "TC de crânio" : "RM de encéfalo";
  return `${tipo}${h.neuroData ? ` (${fmt(h.neuroData)})` : ""}${h.neuroLaudo ? `: ${semPonto(h.neuroLaudo)}` : ""}`;
}
export function textoExames(d) {
  const feitos = todosExames.filter((e) => e.id !== "img" && d.exames[e.id]?.feito);
  if (!feitos.length) return "";
  return feitos.map((e) => {
    const r = d.exames[e.id];
    return `${e.nome}${r.resultado ? ` ${semPonto(r.resultado)}` : ""}${r.data ? ` (${fmt(r.data)})` : ""}`;
  }).join("; ");
}
/* "Donepezila 5 mg e 10 mg (comprimido)" — agrupa as apresentações de cada droga */
const textoTratamento = (der) => der.fams.map((f) => {
  const aps = [...new Set(der.itens.map((i) => i.ap).filter((ap) => apresentacoes[ap].fam === f))];
  const nomes = aps.map((ap) => apresentacoes[ap].lme.replace(/^\S+\s/, ""));
  return `${familias[f].nome.toLowerCase()} ${nomes.join(" e ")}`;
}).join(", associada a ");

/* campo 11 do LME — curto e objetivo */
export function anamneseLME(pac, d, der) {
  const idade = idadeDe(pac);
  const h = d.hist;
  const partes = [];
  partes.push(`Paciente${idade ? ` de ${idade} anos` : ""}${sexoTxt(pac) ? `, ${sexoTxt(pac)}` : ""}, com quadro de declínio cognitivo progressivo de início insidioso${h.inicio ? ` (${semPonto(h.inicio)})` : ""}${h.queixas ? `: ${minusc(semPonto(h.queixas))}` : ""}.`);
  if (h.funcional) partes.push(`Repercussão funcional: ${minusc(semPonto(h.funcional))}.`);
  const aval = [textoMEEM(pac, d, der), textoCDR(d, der)].filter(Boolean).join("; ");
  if (aval) partes.push(`${aval}.`);
  const neuro = textoNeuro(d);
  if (neuro) partes.push(`${neuro}.`);
  if (d.tipo === "continuidade") partes.push(`Em tratamento, ${d.hist.estab === "sim" ? "com estabilização ou melhora clínica" : d.hist.estab === "nao" ? "sem estabilização clínica" : "em reavaliação"}.`);
  partes.push(`Preenche critérios do PCDT da Doença de Alzheimer, sem critérios de exclusão ou contraindicações ao tratamento.`);
  return partes.join(" ");
}

/* prescrição — para colar na prescrição eletrônica */
export function textoReceita(pac, d, der, med) {
  const linhas = [];
  linhas.push(`Paciente: ${pac.nome || "_______________"}`);
  if (pac.cpf || pac.cns) linhas.push([pac.cpf && `CPF: ${pac.cpf}`, pac.cns && `CNS: ${pac.cns}`].filter(Boolean).join(" · "));
  linhas.push("");
  const vias = new Set(der.itens.map((i) => (apresentacoes[i.ap].un === "adesivo" ? "transdérmico" : "oral")));
  linhas.push(`USO ${[...vias].map((x) => x.toUpperCase()).join(" E ")} — USO CONTÍNUO`);
  linhas.push("");
  der.itens.forEach((it, n) => {
    const ap = apresentacoes[it.ap];
    const meses = it.meses.filter((q) => q > 0).length;
    const total = it.meses.reduce((a, b) => a + (Number(b) || 0), 0);
    const q1 = it.meses.find((q) => q > 0) || 0;
    const qtd = meses > 1 && it.meses.filter((q) => q > 0).every((q) => q === q1)
      ? `${qtdTexto(it.ap, q1)} por mês (${meses} meses)`
      : `${qtdTexto(it.ap, total)}`;
    linhas.push(`${n + 1}. ${ap.nome} ——— ${qtd}`);
    linhas.push(`   ${it.pos}`);
    linhas.push("");
  });
  linhas.push(`${med.cidade ? `${med.cidade}, ` : ""}${fmt(d.presc.data)}`);
  linhas.push("");
  linhas.push(`${med.nome || "_______________"} — CRM ${med.crm || "____"}/${med.uf || "__"}`);
  return linhas.join("\n");
}

/* relatório médico (alternativa ao formulário de acesso) */
export function textoRelatorio(pac, d, der, med) {
  const idade = idadeDe(pac);
  const h = d.hist;
  const a = d.acesso;
  const L = [];
  L.push("RELATÓRIO MÉDICO — DOENÇA DE ALZHEIMER");
  L.push("");
  L.push(`Paciente: ${pac.nome || "_______________"}${idade ? `, ${idade} anos` : ""}${sexoTxt(pac) ? `, ${sexoTxt(pac)}` : ""}.`);
  if (pac.cns || pac.cpf) L.push([pac.cns && `CNS ${pac.cns}`, pac.cpf && `CPF ${pac.cpf}`].filter(Boolean).join(" · ") + ".");
  L.push(`CID-10: ${d.cid || "___"}${d.cid ? ` — ${cidDesc(d.cid)}` : ""}.`);
  L.push("");
  L.push("HISTÓRIA CLÍNICA");
  L.push(`Quadro de declínio cognitivo progressivo, de início insidioso${h.inicio ? ` (${semPonto(h.inicio)})` : ""}${h.queixas ? `, caracterizado por ${minusc(semPonto(h.queixas))}` : ""}.` +
    (h.funcional ? ` Repercussão funcional: ${minusc(semPonto(h.funcional))}.` : "") +
    (h.comorbidades ? ` Comorbidades: ${minusc(semPonto(h.comorbidades))}.` : "") +
    (h.medicamentos ? ` Medicamentos em uso: ${minusc(semPonto(h.medicamentos))}.` : ""));
  L.push("");
  L.push("AVALIAÇÃO COGNITIVA E EXAMES");
  const aval = [textoMEEM(pac, d, der), textoCDR(d, der)].filter(Boolean);
  if (aval.length) L.push(`${aval.join(". ")}.`);
  const neuro = textoNeuro(d);
  if (neuro) L.push(`${neuro}.`);
  const lab = textoExames(d);
  if (lab) L.push(`Exames laboratoriais: ${lab}.`);
  L.push("");
  L.push("TRATAMENTO MEDICAMENTOSO REALIZADO");
  L.push(h.tratPrevio ? `${semPonto(h.tratTexto) || "Em tratamento prévio para a doença"}.` : h.tratPrevio === false ? "Sem tratamento prévio específico para a doença." : "___");
  if (d.tipo === "continuidade") L.push(`Em continuidade de tratamento, ${h.estab === "sim" ? "com estabilização ou melhora clínica" : h.estab === "nao" ? "sem estabilização ou melhora clínica" : "em reavaliação"}.`);
  L.push("");
  L.push("CRITÉRIOS DE INCLUSÃO (PCDT)");
  const incl = [];
  if (a.a.every(Boolean)) incl.push("Apresenta sintomas cognitivos/comportamentais que interferem nas atividades usuais, representam declínio em relação ao nível prévio e não são explicados por delirium ou doença psiquiátrica maior.");
  const b = acessoTxt.b.filter((_, i) => a.b[i]).map((t) => minusc(semPonto(t)));
  if (b.length) incl.push(`Características clínicas: ${b.join("; ")}.`);
  if (der.crit && der.avaliacao) {
    const c = criterios.find((x) => x.id === der.crit);
    incl.push(`Escores para ${minusc(c.nome)}: MEEM ${der.meem.total} (faixa exigida ${der.avaliacao.faixa[0]}–${der.avaliacao.faixa[1]} para escolaridade ${der.escBaixa ? "≤ 4" : "> 4"} anos) e CDR ${v(der.cdr.global)} (exigido ${c.cdr.join(" ou ")})${der.avaliacao.ok ? "." : " — ATENÇÃO: fora da faixa do PCDT."}`);
  }
  L.push(incl.length ? incl.join("\n") : "___");
  L.push("");
  L.push("CRITÉRIOS DE EXCLUSÃO E CONTRAINDICAÇÕES");
  const excl = acessoTxt.excl.filter((_, i) => a.excl[i]);
  L.push(excl.length ? `Presente(s): ${excl.map((t) => minusc(semPonto(t))).join("; ")}.`
    : a.exclNenhuma ? "Não apresenta doença cerebrovascular importante, características de demência com corpos de Lewy, de demência frontotemporal variante comportamental ou de afasia progressiva primária, nem outra doença ou medicamento com efeito substancial sobre a cognição." : "___");
  const ci = [];
  if (a.adesao === "incapaz") ci.push("incapacidade de adesão ao tratamento");
  acessoTxt.iache.forEach((t, i) => a.iache[i] && ci.push(minusc(semPonto(t))));
  if (a.gal === "sim") ci.push(minusc(semPonto(acessoTxt.gal[0])));
  if (a.mem === "sim") ci.push(minusc(semPonto(acessoTxt.mem[0])));
  L.push(ci.length ? `Contraindicação(ões) presente(s): ${ci.join("; ")}.` : "Sem contraindicações ao medicamento solicitado e sem incapacidade de adesão ao tratamento.");
  L.push("");
  L.push("CONDUTA");
  L.push(der.itens.length ? `Solicito ${textoTratamento(der)}, conforme o Protocolo Clínico e Diretrizes Terapêuticas da Doença de Alzheimer (${PORTARIA.replace("PORTARIA CONJUNTA", "Portaria Conjunta").replace(", DE ", ", de ").replace(" DE NOVEMBRO DE ", " de novembro de ")}).` : "___");
  if (d.rel.extra) { L.push(""); L.push(d.rel.extra.trim()); }
  L.push("");
  L.push(`${med.cidade ? `${med.cidade}, ` : ""}${fmt(d.lme.data)}`);
  L.push(`${med.nome || "_______________"} — CRM ${med.crm || "____"}/${med.uf || "__"}`);
  return L.join("\n");
}

/* situação de cada exame, para o relatório e para a tela */
export { situacaoExame };
