/* Preenche o PDF oficial do LME (formulário 2026, com campos editáveis) no próprio navegador.
   O arquivo gerado continua editável no Acrobat/visualizador de PDF. */
import { PDFDocument, PDFName, PDFTextField, StandardFonts } from "pdf-lib";

import { LME_URL } from "./lme-util.js";

/* quantidade: 6 colunas (1º a 6º mês) por linha de medicamento */
const QTD = [
  ["Text6", "Text7", "Text8", "Text6a", "Text7a", "Text8a"],
  ["Text10", "Text11", "Text12", "Text10a", "Text11a", "Text12a"],
  ["Text14", "Text15", "Text16", "Text14a", "Text15a", "Text16a"],
  ["Text18", "Text19", "Text20", "Text6b", "Text7b", "Text8b"],
  ["Text22", "Text23", "Text24", "Text10b", "Text11b", "Text12b"],
  ["Text22a", "Text23a", "Text24a", "Text14b", "Text15b", "Text16b"],
];
/* ordem dos botões de opção, conferida pela posição no formulário */
export const RADIO = {
  tratPrevio: { campo: "Tratamentos prévios?", nao: 0, sim: 1 },
  incapaz: { campo: "Incapaz?", nao: 0, sim: 1 },
  preenchidoPor: { campo: "dados complementares", paciente: 0, mae: 1, responsavel: 2, medico: 3, outro: 4 },
  raca: { campo: "Radio Button1", branca: 0, amarela: 1, preta: 2, indigena: 3, parda: 4 },
  doc: { campo: "Documentos", CPF: 0, CNS: 1 },
};

function marcarRadio(form, nome, idx) {
  const f = form.getField(nome);
  const ws = f.acroField.getWidgets();
  ws.forEach((w, i) => {
    const n = w.dict.lookup(PDFName.of("AP"))?.lookup(PDFName.of("N"));
    const on = n?.keys().map((k) => k.decodeText()).find((k) => k !== "Off") ?? String(i);
    if (i === idx) {
      w.dict.set(PDFName.of("AS"), PDFName.of(on));
      f.acroField.dict.set(PDFName.of("V"), PDFName.of(on));
    } else {
      w.dict.set(PDFName.of("AS"), PDFName.of("Off"));
    }
  });
}

/* Medicamento: a lista suspensa do LME tem 344 itens e alguns visualizadores (Pré-visualização do Mac,
   por exemplo) mostram o item errado ao abrir. Para sair certo em qualquer lugar, a linha usada vira
   texto impresso na página e a lista daquela linha é removida; as linhas vazias continuam editáveis. */
function escreverMedicamento(pdf, form, fonte, nome, texto) {
  const f = form.getDropdown(nome);
  const w = f.acroField.getWidgets()[0];
  const r = w.getRectangle();
  form.removeField(f);
  let tam = 9;
  while (tam > 6 && fonte.widthOfTextAtSize(texto, tam) > r.width - 6) tam -= 0.5;
  pdf.getPage(0).drawText(texto, { x: r.x + 3, y: r.y + (r.height - tam) / 2 + 1.5, size: tam, font: fonte });
}

/* ASCII + Latin-1 (o que a fonte padrão do PDF consegue desenhar) */
const limpa = (s) => String(s ?? "").replace(/[–—]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[^\n\x20-\x7E\xA0-\xFF]/g, "");

export async function gerarLME(dados) {
  const bytes = await fetch(LME_URL).then((r) => {
    if (!r.ok) throw new Error("Não foi possível abrir o LME em branco.");
    return r.arrayBuffer();
  });
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  const fonte = await pdf.embedFont(StandardFonts.Helvetica);

  const txt = (nome, v, tam = 10) => {
    if (v == null || v === "") return;
    const f = form.getField(nome);
    if (!(f instanceof PDFTextField)) return;
    let s = limpa(v);
    const max = f.getMaxLength();
    if (max) s = s.slice(0, max);
    f.setText(s);
    f.setFontSize(tam);
  };

  txt("CNES", dados.cnes);
  txt("Nome do estabelecimento de saúde", dados.estabelecimento);
  txt("Nome do paciente", dados.nome);
  txt("Nome da mãe do paciente", dados.mae);
  txt("Peso", dados.peso);
  txt("Altura", dados.altura);

  (dados.meds || []).slice(0, 6).forEach((m, i) => {
    escreverMedicamento(pdf, form, fonte, `Selecao med ${i + 1}`, limpa(m.lme));
    m.meses.slice(0, 6).forEach((q, j) => { if (q) txt(QTD[i][j], String(q), 9); });
  });

  txt("CID", dados.cid);
  txt("Diagnóstico", dados.diagnostico);
  txt("Anamnese", dados.anamnese, (dados.anamnese || "").length > 900 ? 6.5 : 7.5);

  if (dados.tratPrevio != null) marcarRadio(form, RADIO.tratPrevio.campo, dados.tratPrevio ? RADIO.tratPrevio.sim : RADIO.tratPrevio.nao);
  if (dados.tratPrevio) txt("Tratamento", dados.tratTexto);
  marcarRadio(form, RADIO.incapaz.campo, dados.incapaz ? RADIO.incapaz.sim : RADIO.incapaz.nao);
  if (dados.incapaz) txt("Nome do Responsável", dados.responsavel);

  txt("Médico Solicitante", dados.medico);
  txt("TextCNS", dados.cnsMedico);
  txt("Today", dados.data);

  if (dados.preenchidoPor && RADIO.preenchidoPor[dados.preenchidoPor] != null) {
    marcarRadio(form, RADIO.preenchidoPor.campo, RADIO.preenchidoPor[dados.preenchidoPor]);
    if (dados.preenchidoPor === "outro") { txt("Nome", dados.outroNome); txt("CPF", dados.outroCPF); }
  }
  if (dados.raca && RADIO.raca[dados.raca] != null) marcarRadio(form, RADIO.raca.campo, RADIO.raca[dados.raca]);
  if (dados.raca === "indigena") txt("Etnia", dados.etnia);
  txt("Telefone I", dados.tel1);
  txt("Telefone II", dados.tel2);
  if (dados.docNumero) {
    marcarRadio(form, RADIO.doc.campo, RADIO.doc[dados.docTipo] ?? 0);
    txt("Documento", dados.docNumero);
  }
  txt("email", dados.email);

  return pdf.save({ updateFieldAppearances: true });
}

