import { Fragment } from "react";
import { Badge, CheckBox, CheckChip, CopyBlock, ResultBar, BotaoImprimir, FichaCabecalho, FichaRodape, Campo, Pentagonos, useCopyOk, useEstado } from "./ui.jsx";

/* ================= MEEM ================= */
export const meemSections = [
  { key: "ot", title: "Orientação temporal", note: "Pergunte ao paciente. 1 ponto para cada resposta correta.", items: [
    { q: "Que dia é hoje?" },
    { q: "Em que mês estamos?" },
    { q: "Em que ano estamos?" },
    { q: "Em que dia da semana estamos?" },
    { q: "Qual é a hora aproximada?", hint: "aceitar variação de mais ou menos uma hora" },
  ] },
  { key: "oe", title: "Orientação espacial", note: "Pergunte ao paciente. 1 ponto para cada resposta correta.", items: [
    { q: "Em qual local nós estamos?", hint: "apontando para o chão: consultório, dormitório, sala" },
    { q: "Que local é este aqui?", hint: "apontando ao redor, num sentido mais amplo: hospital, casa de repouso, própria casa" },
    { q: "Em qual bairro nós estamos?", hint: "ou o nome de uma rua próxima" },
    { q: "Em que cidade nós estamos?" },
    { q: "Em que estado nós estamos?" },
  ] },
  { key: "reg", title: "Memória de registro", note: "Diga 3 palavras (1 ponto cada). Edite abaixo as palavras usadas.", words: true, len: 3 },
  { key: "ac", title: "Atenção e cálculo", calc: true, len: 5,
    note: "Subtrair 100 − 7 sucessivamente. Se o paciente não conseguir, use a soletração de MUNDO ao contrário. Vale a tarefa com melhor aproveitamento.",
    items: ["93", "86", "79", "72", "65"], mundo: ["O", "D", "N", "U", "M"] },
  { key: "evoc", title: "Memória de evocação", note: "Marque cada palavra recordada corretamente.", evoc: true, len: 3 },
  { key: "nom", title: "Nomeação", note: "Mostrar os objetos e pedir o nome.", items: ["Relógio", "Caneta"] },
  { key: "rep", title: "Repetição", note: "Pedir para repetir a frase.", items: ["“Nem aqui, nem ali, nem lá”"] },
  { key: "com", title: "Comando verbal (3 etapas)", note: "Entregar uma folha e dar o comando completo.", items: ["Pega o papel com a mão direita", "Dobra ao meio", "Coloca no chão"] },
  { key: "leit", title: "Leitura", note: "Mostrar a frase escrita e pedir para ler e executar.", items: ["“FECHE OS OLHOS”"] },
  { key: "esc", title: "Escrita", items: ["Escreve uma frase completa (sujeito + verbo, com sentido)"] },
  { key: "cop", title: "Praxia construtiva", items: ["Copia os 2 pentágonos que se cruzam"] },
];
export const meemCutoffs = [["Analfabeto", "20"], ["1–4 anos", "25"], ["5–8 anos", "26"], ["9–11 anos", "28"], ["> 11 anos", "29"]];

/* agrupamento e texto de cada item na ficha impressa */
export const meemGrupos = { ot: "Orientação", reg: "Registro", ac: "Atenção e cálculo", evoc: "Evocação", nom: "Linguagem" };
export const meemFicha = {
  ot: () => "Qual é o dia, o mês, o ano, o dia da semana e a hora aproximada (tolerância de uma hora).",
  oe: () => "Em qual local estamos (específico, apontando o chão) e que local é este (amplo), bairro ou rua próxima, cidade e estado.",
  reg: (w) => `Dizer três palavras: ${w.join(", ")}. Pedir para prestar atenção, pois terá de repeti-las mais tarde.`,
  ac: (_, x) => `Subtrair 100 − 7 (93, 86, 79, 72, 65). Alternativo: soletrar MUNDO ao contrário (O, D, N, U, M). Vale a tarefa com melhor aproveitamento.${x}`,
  evoc: (w) => `Perguntar pelas três palavras anteriores: ${w.join(", ")}.`,
  nom: () => "Nomear dois objetos: relógio e caneta.",
  rep: () => "Repetir: “Nem aqui, nem ali, nem lá”.",
  com: () => "Comando de três estágios, dito de uma só vez: pegar o papel com a mão direita, dobrar ao meio e colocar no chão.",
  leit: () => "Ler (só com os olhos) e executar: FECHE OS OLHOS.",
  esc: () => "Escrever uma frase completa, com começo, meio e fim.",
  cop: () => "Copiar o desenho dos dois pentágonos que se cruzam.",
};

export const meemInicial = { checked: {}, words: ["CARRO", "VASO", "TIJOLO"], mundoOn: false, escIdx: null };
const lenOf = (s) => (s.items ? s.items.length : s.len);

/* cálculo puro, reaproveitado pelo DOSUS */
export function meemCalc(st) {
  const checked = st?.checked || {};
  const conta = (pref, n) => { let c = 0; for (let i = 0; i < n; i++) if (checked[`${pref}-${i}`]) c++; return c; };
  /* atenção e cálculo: vale a tarefa com melhor aproveitamento (subtração ou MUNDO) */
  const acSub = conta("ac", 5);
  const acMundo = conta("mundo", 5);
  const acScore = Math.max(acSub, acMundo);
  const acTarefa = acMundo > acSub ? "soletração de MUNDO" : "subtração de 7";
  const score = (s) => (s.calc ? acScore : conta(s.key, lenOf(s)));
  const total = meemSections.reduce((a, s) => a + score(s), 0);
  const escIdx = st?.escIdx ?? null;
  /* corte por escolaridade (Brucki et al., 2003); abaixo do corte = suspeito */
  const corte = escIdx === null ? null : parseInt(meemCutoffs[escIdx][1], 10);
  const abaixo = corte === null ? total < 24 : total < corte;
  const marcados = Object.values(checked).some(Boolean);
  return { total, score, acSub, acMundo, acTarefa, corte, abaixo, escIdx, marcados };
}

export function MEEM({ estado, setEstado }) {
  const [st, setSt] = useEstado(meemInicial, estado, setEstado);
  const { checked, words, mundoOn, escIdx } = { ...meemInicial, ...st };
  const upd = (k, v) => setSt((p) => ({ ...meemInicial, ...p, [k]: typeof v === "function" ? v({ ...meemInicial, ...p }[k]) : v }));
  const setChecked = (v) => upd("checked", v);
  const setWords = (v) => upd("words", v);
  const setMundoOn = (v) => upd("mundoOn", v);
  const setEscIdx = (v) => upd("escIdx", v);
  const [ok, fire] = useCopyOk();
  const toggle = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const { total, score, acSub, acMundo, acTarefa, corte, abaixo } = meemCalc(st);
  const notaRes = corte === null
    ? (total < 24 ? "Abaixo do corte clássico (24) — escolha a escolaridade para o corte específico"
                  : "Acima do corte clássico (24) — escolha a escolaridade para o corte específico")
    : `${abaixo ? "Abaixo" : "Dentro"} do esperado para ${meemCutoffs[escIdx][0].toLowerCase()} (corte ${corte})`;

  const text = `MEEM (Mini-Exame do Estado Mental): ${total}/30. ` +
    meemSections.map((s) => `${s.title.toLowerCase()} ${score(s)}/${lenOf(s)}`).join(", ") + ". " +
    `Em atenção e cálculo valeu a ${acTarefa}` +
    (mundoOn || acMundo > 0 ? ` (subtração ${acSub}/5, MUNDO ${acMundo}/5). ` : ". ") +
    (corte === null ? "" : `Escolaridade ${meemCutoffs[escIdx][0].toLowerCase()}, corte ${corte}: ${abaixo ? "abaixo" : "dentro"} do esperado.`);

  return (
    <>
    <div className="space-y-4 print:hidden">
      <ResultBar title="Pontuação" value={`${total}`} suffix="/30" tone={abaixo ? "amber" : "teal"} note={notaRes} />
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-700 mb-1.5">Escolaridade — toque para aplicar o corte (Brucki et al., 2003):</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {meemCutoffs.map(([e, c], i) => {
            const sel = escIdx === i;
            return (
              <button key={e} onClick={() => setEscIdx(sel ? null : i)}
                className={"rounded-lg border px-2 py-1.5 text-left transition-colors " +
                  (sel ? "bg-teal-600 border-teal-600 text-white shadow-sm" : "bg-white border-slate-200 hover:border-teal-300")}>
                <div className={"text-[11px] " + (sel ? "text-teal-50" : "text-slate-500")}>{e}</div>
                <div className={"font-bold " + (sel ? "text-white" : "text-slate-700")}>{c}</div>
              </button>
            );
          })}
        </div>
      </div>
      {meemSections.map((s) => (
        <div key={s.key} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-800 text-sm">{s.title}</span>
            <Badge>{score(s)}/{lenOf(s)}</Badge>
          </div>
          {s.note && <p className="text-xs text-slate-400 mb-2">{s.note}</p>}
          {s.calc ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-600">Subtração 100 − 7</span>
                  <Badge tone={acSub >= acMundo ? "teal" : "slate"}>{acSub}/5{acSub >= acMundo ? " · conta" : ""}</Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-5 grid-cols-3">
                  {s.items.map((it, i) => (
                    <CheckChip key={i} checked={!!checked[`ac-${i}`]} onToggle={() => toggle(`ac-${i}`)}>{it}</CheckChip>
                  ))}
                </div>
              </div>

              {mundoOn || acMundo > 0 ? (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">Soletrar MUNDO ao contrário</span>
                    <Badge tone={acMundo > acSub ? "teal" : "slate"}>{acMundo}/5{acMundo > acSub ? " · conta" : ""}</Badge>
                  </div>
                  <div className="grid gap-2 grid-cols-5">
                    {s.mundo.map((l, i) => (
                      <CheckChip key={i} checked={!!checked[`mundo-${i}`]} onToggle={() => toggle(`mundo-${i}`)}>{l}</CheckChip>
                    ))}
                  </div>
                  <button onClick={() => { setMundoOn(false); setChecked((p) => { const n = { ...p }; s.mundo.forEach((_, i) => delete n[`mundo-${i}`]); return n; }); }}
                    className="text-[11px] text-slate-400 hover:text-teal-600 mt-1.5">
                    Remover a soletração
                  </button>
                </div>
              ) : (
                <button onClick={() => setMundoOn(true)}
                  className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-teal-400 hover:text-teal-700 transition-colors">
                  Não conseguiu a subtração? Usar MUNDO (ODNUM)
                </button>
              )}
            </div>
          ) : s.words ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckBox checked={!!checked[`reg-${i}`]} onToggle={() => toggle(`reg-${i}`)} />
                  <input value={words[i]} placeholder={`Palavra ${i + 1}`}
                    onChange={(e) => setWords((w) => { const n = [...w]; n[i] = e.target.value; return n; })}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-teal-400 outline-none" />
                </div>
              ))}
            </div>
          ) : s.evoc ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <CheckChip key={i} checked={!!checked[`evoc-${i}`]} onToggle={() => toggle(`evoc-${i}`)}>
                  {words[i] || `Palavra ${i + 1}`}
                </CheckChip>
              ))}
            </div>
          ) : (
            <div className={"grid gap-2 " + (s.items.some((it) => it.hint) ? "grid-cols-1" : s.items.length > 1 ? "sm:grid-cols-2" : "grid-cols-1")}>
              {s.items.map((it, i) => (
                <CheckChip key={i} checked={!!checked[`${s.key}-${i}`]} onToggle={() => toggle(`${s.key}-${i}`)}>
                  {typeof it === "string" ? it : (
                    <>
                      {it.q}
                      {it.hint && <span className="block text-xs text-slate-400 mt-0.5">{it.hint}</span>}
                    </>
                  )}
                </CheckChip>
              ))}
            </div>
          )}
        </div>
      ))}
      <CopyBlock text={text} ok={ok} onCopy={() => fire(text)} onReset={() => setSt({ ...meemInicial, words, escIdx })} />
      <BotaoImprimir />
    </div>

    {/* ficha para impressão / PDF */}
    <div className="hidden print:block text-black">
      <FichaCabecalho titulo="Mini-Exame do Estado Mental (MEEM)"
        extra={<div><Campo rot="Escolaridade (anos completos de estudo)" valor={escIdx === null ? "" : meemCutoffs[escIdx][0]} w="150px" /></div>} />
      <table className="w-full border-collapse text-[10.5px]">
        <tbody>
          {meemSections.map((s) => {
            const extraAc = s.calc && (mundoOn || acMundo > 0)
              ? ` Valeu a ${acTarefa}: subtração ${acSub}/5, MUNDO ${acMundo}/5.` : "";
            return (
              <Fragment key={s.key}>
                {meemGrupos[s.key] && (
                  <tr>
                    <td colSpan={3} className="border border-black px-2 py-1 font-bold uppercase text-[10px] bg-neutral-100">
                      {meemGrupos[s.key]}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="border border-black px-2 py-1 align-top">
                    {meemFicha[s.key](words, extraAc)}
                    {s.key === "cop" && (
                      <div className="mt-1 flex items-start gap-3">
                        <Pentagonos w={132} />
                        <div className="flex-1 border border-dashed border-neutral-400 h-[106px] relative">
                          <span className="absolute top-1 left-1 text-[8px] text-neutral-500 uppercase tracking-wide">Cópia do paciente</span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="border border-black px-2 py-1 text-center w-10 align-top font-bold">{lenOf(s)}</td>
                  <td className="border border-black px-2 py-1 text-center w-12 align-top font-bold">{score(s)}</td>
                </tr>
              </Fragment>
            );
          })}
          <tr className="font-bold">
            <td className="border border-black px-2 py-1 uppercase">Total</td>
            <td className="border border-black px-2 py-1 text-center">30</td>
            <td className="border border-black px-2 py-1 text-center">{total}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-[10px]">
        <b>Interpretação:</b> {corte === null
          ? `${total}/30. Corte clássico 24 — escolaridade não informada.`
          : `${total}/30, ${abaixo ? "abaixo" : "dentro"} do esperado para escolaridade ${meemCutoffs[escIdx][0].toLowerCase()} (corte ${corte}).`}
        {" "}Cortes por escolaridade (Brucki et al., 2003): {meemCutoffs.map(([e, c]) => `${e.toLowerCase()} ${c}`).join(" · ")}.
      </p>
      <FichaRodape />
    </div>
    </>
  );
}
