import React, { useState } from "react";
import { Brain, Activity, ClipboardList, Stethoscope, Zap, HeartPulse, CloudRain, Users, Flame, Copy, Check, RotateCcw, Info, AlertTriangle } from "lucide-react";

/* ---------- clipboard ---------- */
function copyToClipboard(text, onOk) {
  const done = () => onOk();
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand("copy"); done(); } catch {}
    document.body.removeChild(ta);
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    else fallback();
  } catch { fallback(); }
}
function useCopyOk() {
  const [ok, setOk] = useState(false);
  const fire = (text) => copyToClipboard(text, () => { setOk(true); setTimeout(() => setOk(false), 1800); });
  return [ok, fire];
}

/* ---------- shared UI ---------- */
function Picker({ value, onChange, options = [0, 1, 2, 3, 4], labels }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o, i) => {
        const sel = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} title={labels ? labels[i] : undefined}
            className={"min-w-[2.4rem] px-2 py-1.5 rounded-lg text-sm font-semibold border transition-colors " +
              (sel ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                   : "bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700")}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function ScoredItem({ label, bold, value, options = [0, 1, 2, 3, 4], desc, onChange }) {
  const [open, setOpen] = useState(false);
  const meaning = desc ? desc[options.indexOf(value)] : null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={"text-sm " + (bold ? "font-semibold text-slate-800" : "text-slate-700")}>{label}</span>
        {desc && (
          <button onClick={() => setOpen((o) => !o)} className="text-slate-400 hover:text-teal-600 shrink-0 mt-0.5">
            <Info size={15} />
          </button>
        )}
      </div>
      <Picker value={value} onChange={onChange} options={options} labels={desc} />
      {meaning && <div className="text-xs text-teal-700 mt-1.5"><b>{value}</b> — {meaning}</div>}
      {open && desc && (
        <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
          {options.map((o, i) => (
            <div key={o} className="text-xs text-slate-500 flex gap-2">
              <span className="font-bold text-slate-600 w-7 shrink-0">{o}</span><span>{desc[i]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckChip({ checked, onToggle, children }) {
  return (
    <button onClick={onToggle}
      className={"flex items-center gap-2 px-3 py-2 rounded-lg text-sm border text-left transition-colors w-full " +
        (checked ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-white border-slate-200 text-slate-600 hover:border-teal-300")}>
      <span className={"w-4 h-4 rounded border flex items-center justify-center shrink-0 " +
        (checked ? "bg-teal-600 border-teal-600" : "border-slate-300")}>
        {checked && <Check size={12} className="text-white" />}
      </span>
      <span>{children}</span>
    </button>
  );
}

function CheckBox({ checked, onToggle }) {
  return (
    <button onClick={onToggle}
      className={"w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 " +
        (checked ? "bg-teal-600 border-teal-600" : "bg-white border-slate-300 hover:border-teal-300")}>
      {checked && <Check size={16} className="text-white" />}
    </button>
  );
}

function NumField({ value, onChange, max = 90, suffix }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-slate-200">−</button>
      <input type="number" value={value} min={0} max={max}
        onChange={(e) => { let v = parseInt(e.target.value || "0", 10); if (isNaN(v)) v = 0; onChange(Math.max(0, Math.min(max, v))); }}
        className="w-14 text-center rounded-lg border border-slate-200 py-1.5 text-sm font-semibold text-slate-800 focus:border-teal-400 outline-none" />
      <button onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 font-bold hover:bg-teal-200">+</button>
      {suffix && <span className="text-xs text-slate-400 ml-1">{suffix}</span>}
    </div>
  );
}

function NumRow({ label, hint, value, onChange, max, suffix }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="min-w-0"><div className="text-sm text-slate-700">{label}</div>{hint && <div className="text-xs text-slate-400">{hint}</div>}</div>
      <NumField value={value} onChange={onChange} max={max} suffix={suffix} />
    </div>
  );
}

function Badge({ children, tone = "teal" }) {
  const map = { teal: "bg-teal-50 text-teal-700 border-teal-200", slate: "bg-slate-100 text-slate-600 border-slate-200" };
  return <span className={"inline-block px-2.5 py-1 rounded-full text-xs font-semibold border " + map[tone]}>{children}</span>;
}

function ResultBar({ title, value, suffix, tone = "teal", note, compact }) {
  const map = { teal: "from-teal-500 to-teal-600", amber: "from-amber-500 to-amber-600", red: "from-red-500 to-red-600", slate: "from-slate-500 to-slate-600" };
  return (
    <div className={"rounded-2xl bg-gradient-to-br text-white p-4 shadow-sm " + map[tone]}>
      <div className="text-xs uppercase tracking-wide opacity-80">{title}</div>
      <div className="flex items-baseline gap-1">
        <span className={compact ? "text-2xl font-bold" : "text-3xl font-bold"}>{value}</span>
        {suffix && <span className="text-lg font-medium opacity-80">{suffix}</span>}
      </div>
      {note && <div className="text-xs opacity-90 mt-0.5">{note}</div>}
    </div>
  );
}

function CopyBlock({ text, onCopy, ok, onReset }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
      <div className="text-xs text-slate-600 leading-relaxed bg-white rounded-lg border border-slate-200 p-2.5">{text}</div>
      <div className="flex gap-2">
        <button onClick={onCopy} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700">
          {ok ? <><Check size={16} /> Copiado!</> : <><Copy size={16} /> Copiar em linha</>}
        </button>
        <button onClick={onReset} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100">
          <RotateCcw size={15} /> Zerar
        </button>
      </div>
    </div>
  );
}

/* ================= MEEM ================= */
const meemSections = [
  { key: "ot", title: "Orientação temporal", items: ["Ano", "Estação do ano", "Mês", "Dia da semana", "Dia do mês"] },
  { key: "oe", title: "Orientação espacial", items: ["Estado", "Cidade", "Bairro / rua", "Local (instituição)", "Andar / cômodo"] },
  { key: "reg", title: "Memória de registro", note: "Diga 3 palavras (1 ponto cada). Edite abaixo as palavras usadas.", words: true, len: 3 },
  { key: "ac", title: "Atenção e cálculo", note: "100 − 7 sucessivamente (ou soletrar “MUNDO” de trás para frente).", items: ["93", "86", "79", "72", "65"] },
  { key: "evoc", title: "Memória de evocação", note: "Marque cada palavra recordada corretamente.", evoc: true, len: 3 },
  { key: "nom", title: "Nomeação", note: "Mostrar os objetos e pedir o nome.", items: ["Relógio", "Caneta"] },
  { key: "rep", title: "Repetição", note: "Pedir para repetir a frase.", items: ["“Nem aqui, nem ali, nem lá”"] },
  { key: "com", title: "Comando verbal (3 etapas)", note: "Entregar uma folha e dar o comando completo.", items: ["Pega o papel com a mão direita", "Dobra ao meio", "Coloca no chão"] },
  { key: "leit", title: "Leitura", note: "Mostrar a frase escrita e pedir para ler e executar.", items: ["“FECHE OS OLHOS”"] },
  { key: "esc", title: "Escrita", items: ["Escreve uma frase completa (sujeito + verbo, com sentido)"] },
  { key: "cop", title: "Praxia construtiva", items: ["Copia os 2 pentágonos que se cruzam"] },
];
const meemCutoffs = [["Analfabeto", "20"], ["1–4 anos", "25"], ["5–8 anos", "26"], ["9–11 anos", "28"], ["> 11 anos", "29"]];

function MEEM() {
  const [checked, setChecked] = useState({});
  const [words, setWords] = useState(["CARRO", "VASO", "TIJOLO"]);
  const [ok, fire] = useCopyOk();
  const toggle = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const lenOf = (s) => (s.items ? s.items.length : s.len);
  const score = (s) => { let n = 0; for (let i = 0; i < lenOf(s); i++) if (checked[`${s.key}-${i}`]) n++; return n; };
  const total = meemSections.reduce((a, s) => a + score(s), 0);
  const text = `MEEM (Mini-Exame do Estado Mental): ${total}/30. ` +
    meemSections.map((s) => `${s.title.toLowerCase()} ${score(s)}/${lenOf(s)}`).join(", ") + ".";

  return (
    <div className="space-y-4">
      <ResultBar title="Pontuação" value={`${total}`} suffix="/30" tone={total >= 24 ? "teal" : "amber"}
        note={total >= 24 ? "Acima do corte clássico (24)" : "Abaixo de 24 — avaliar conforme escolaridade"} />
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-700 mb-1.5">Pontos de corte por escolaridade (Brucki et al., 2003):</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {meemCutoffs.map(([e, c]) => (
            <div key={e} className="bg-white rounded-lg border border-slate-200 px-2 py-1.5">
              <div className="text-[11px] text-slate-500">{e}</div><div className="font-bold text-slate-700">{c}</div>
            </div>
          ))}
        </div>
      </div>
      {meemSections.map((s) => (
        <div key={s.key} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-800 text-sm">{s.title}</span>
            <Badge>{score(s)}/{lenOf(s)}</Badge>
          </div>
          {s.note && <p className="text-xs text-slate-400 mb-2">{s.note}</p>}
          {s.words ? (
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
            <div className={"grid gap-2 " + (s.items.length > 1 ? "sm:grid-cols-2" : "grid-cols-1")}>
              {s.items.map((it, i) => (
                <CheckChip key={i} checked={!!checked[`${s.key}-${i}`]} onToggle={() => toggle(`${s.key}-${i}`)}>{it}</CheckChip>
              ))}
            </div>
          )}
        </div>
      ))}
      <CopyBlock text={text} ok={ok} onCopy={() => fire(text)} onReset={() => { setChecked({}); }} />
    </div>
  );
}

/* ================= UPDRS MOTOR (clássico /108) ================= */
const dBradi = ["Normal", "Discreto: leve lentidão e/ou redução de amplitude", "Leve: lentidão e fadiga moderadas; amplitude reduz no meio da tarefa", "Moderado: interrupções frequentes ou bloqueio; amplitude reduz cedo", "Grave: mal consegue ou não consegue executar"];
const dTremRep = ["Ausente", "Discreto e infrequente", "Leve em amplitude e persistente, ou moderado e intermitente", "Moderado em amplitude e presente na maior parte do tempo", "Acentuado e presente quase sempre"];
const dTremAcao = ["Ausente", "Discreto, presente com o movimento", "Moderado em amplitude com o movimento", "Moderado em amplitude na postura e na ação", "Acentuado; interfere na alimentação"];
const dRig = ["Ausente", "Discreta ou detectável só com manobra de ativação", "Leve a moderada", "Acentuada, mas amplitude completa é alcançada", "Grave; amplitude de movimento limitada"];
const dFala = ["Normal", "Discreta perda de expressão, dicção ou volume", "Monótona/arrastada, mas compreensível (moderada)", "Difícil de entender em parte", "Ininteligível"];
const dFacial = ["Normal", "Hipomimia mínima ('face de pôquer')", "Diminuição discreta porém anormal da expressão", "Hipomimia moderada; lábios entreabertos parte do tempo", "Face em máscara; lábios afastados; perda acentuada"];
const dLevantar = ["Normal", "Lento ou precisa de mais de uma tentativa", "Apoia-se nos braços da cadeira", "Tende a cair para trás; levanta sozinho com esforço", "Incapaz sem ajuda"];
const dPostura = ["Ereta/normal", "Levemente curvada (pode ser normal para idoso)", "Moderadamente curvada; pode inclinar para um lado", "Curvatura acentuada/cifose; inclinação moderada", "Flexão acentuada; anormalidade postural extrema"];
const dMarcha = ["Normal", "Lenta; passos curtos arrastados, sem propulsão", "Anda com dificuldade, pouca/nenhuma ajuda; festinação", "Distúrbio grave; necessita assistência", "Não consegue andar mesmo com ajuda"];
const dEstab = ["Normal; recupera-se", "Retropulsão, mas recupera sem ajuda", "Sem resposta postural; cairia se não amparado", "Muito instável; perde o equilíbrio espontaneamente", "Incapaz de ficar em pé sem apoio"];
const dBradiCorp = ["Nenhuma", "Lentidão mínima (pode ser normal); leve redução de amplitude", "Lentidão/pobreza de movimento leves, claramente anormais", "Lentidão moderada, pobreza ou pequena amplitude", "Lentidão acentuada, pobreza ou amplitude muito reduzida"];

const updrsItems = [
  { key: "fala", label: "Fala", desc: dFala },
  { key: "facial", label: "Expressão facial", desc: dFacial },
  { key: "trep_cabeca", group: "Tremor de repouso", label: "Cabeça / face", desc: dTremRep },
  { key: "trep_md", group: "Tremor de repouso", label: "Mão direita", desc: dTremRep },
  { key: "trep_me", group: "Tremor de repouso", label: "Mão esquerda", desc: dTremRep },
  { key: "trep_pd", group: "Tremor de repouso", label: "Perna direita", desc: dTremRep },
  { key: "trep_pe", group: "Tremor de repouso", label: "Perna esquerda", desc: dTremRep },
  { key: "tacao_md", group: "Tremor de ação / postural", label: "Mão direita", desc: dTremAcao },
  { key: "tacao_me", group: "Tremor de ação / postural", label: "Mão esquerda", desc: dTremAcao },
  { key: "rig_pescoco", group: "Rigidez", label: "Pescoço", desc: dRig },
  { key: "rig_md", group: "Rigidez", label: "Mão direita", desc: dRig },
  { key: "rig_me", group: "Rigidez", label: "Mão esquerda", desc: dRig },
  { key: "rig_pd", group: "Rigidez", label: "Perna direita", desc: dRig },
  { key: "rig_pe", group: "Rigidez", label: "Perna esquerda", desc: dRig },
  { key: "toque_d", group: "Toque de dedos", label: "Direita", desc: dBradi },
  { key: "toque_e", group: "Toque de dedos", label: "Esquerda", desc: dBradi },
  { key: "mmaos_d", group: "Movimentos das mãos", label: "Direita", desc: dBradi },
  { key: "mmaos_e", group: "Movimentos das mãos", label: "Esquerda", desc: dBradi },
  { key: "malt_d", group: "Movimentos alternados rápidos", label: "Direita", desc: dBradi },
  { key: "malt_e", group: "Movimentos alternados rápidos", label: "Esquerda", desc: dBradi },
  { key: "agil_d", group: "Agilidade das pernas", label: "Direita", desc: dBradi },
  { key: "agil_e", group: "Agilidade das pernas", label: "Esquerda", desc: dBradi },
  { key: "levantar", label: "Levantar da cadeira", desc: dLevantar },
  { key: "postura", label: "Postura", desc: dPostura },
  { key: "marcha", label: "Marcha", desc: dMarcha },
  { key: "estab", label: "Estabilidade postural", desc: dEstab },
  { key: "bradi", label: "Bradicinesia corporal", desc: dBradiCorp },
];
const updrsDys = [
  { key: "dys_dur", label: "Duração das discinesias", desc: ["Nenhuma", "≤ 25% do dia", "26–50% do dia", "51–75% do dia", "> 75% do dia"] },
  { key: "dys_incap", label: "Incapacidade", desc: ["Sem incapacidade", "Discreta", "Leve", "Moderada", "Completa/grave"] },
  { key: "dys_dor", label: "Dor (discinesia)", desc: ["Sem dor", "Discreta", "Leve", "Moderada", "Grave"] },
];

function UPDRS() {
  const init = Object.fromEntries([...updrsItems, ...updrsDys].map((d) => [d.key, 0]));
  const [s, setS] = useState(init);
  const [ok, fire] = useCopyOk();
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const g = (k) => s[k] ?? 0;
  const total = updrsItems.reduce((a, it) => a + g(it.key), 0);
  const pct = ((total / 108) * 100).toFixed(2).replace(".", ",");
  const dysSum = g("dys_dur") + g("dys_incap") + g("dys_dor");
  const dysText = dysSum === 0
    ? `Não há discinesias (duração: ${g("dys_dur")}, incapacidade: ${g("dys_incap")}, dor: ${g("dys_dor")}).`
    : `Discinesias presentes (duração: ${g("dys_dur")}, incapacidade: ${g("dys_incap")}, dor: ${g("dys_dor")}).`;
  const text =
    `UPDRS - Exame Motor: Pontuação total ${total}/108 (${pct}%). ` +
    `Fala ${g("fala")}, expressão facial ${g("facial")}, ` +
    `tremor de repouso cabeça ${g("trep_cabeca")}, mão direita ${g("trep_md")}, mão esquerda ${g("trep_me")}, perna direita ${g("trep_pd")}, perna esquerda ${g("trep_pe")}, ` +
    `tremor de ação/postural mão direita ${g("tacao_md")}, mão esquerda ${g("tacao_me")}, ` +
    `rigidez: pescoço ${g("rig_pescoco")}, mão direita ${g("rig_md")}, mão esquerda ${g("rig_me")}, perna direita ${g("rig_pd")}, perna esquerda ${g("rig_pe")}, ` +
    `toque de dedos: direita ${g("toque_d")}, esquerda ${g("toque_e")}, ` +
    `movimentos das mãos: direita ${g("mmaos_d")}, esquerda ${g("mmaos_e")}, ` +
    `movimentos alternados rápidos: direita ${g("malt_d")}, esquerda ${g("malt_e")}, ` +
    `agilidade das pernas: direita ${g("agil_d")}, esquerda ${g("agil_e")}, ` +
    `levantar da cadeira ${g("levantar")}, postura ${g("postura")}, marcha ${g("marcha")}, estabilidade postural ${g("estab")}, bradicinesia corporal ${g("bradi")}. ` +
    dysText;

  let lastGroup = null;
  return (
    <div className="space-y-4">
      <ResultBar title="Pontuação total" value={`${total}`} suffix="/108" tone="teal" note={`${pct}% do máximo`} />
      <p className="text-xs text-slate-400">Toque no ícone ⓘ de cada item para ver o que cada nota (0–4) significa.</p>
      <div className="space-y-2">
        {updrsItems.map((it) => {
          const showHeader = it.group && it.group !== lastGroup;
          lastGroup = it.group || null;
          return (
            <div key={it.key}>
              {showHeader && <div className="mt-3 mb-1 text-xs font-bold uppercase tracking-wide text-teal-700">{it.group}</div>}
              <ScoredItem label={it.label} bold={!it.group} value={g(it.key)} desc={it.desc} onChange={(v) => set(it.key, v)} />
            </div>
          );
        })}
      </div>
      <div className="mt-3 mb-1 text-xs font-bold uppercase tracking-wide text-amber-700">Discinesias (opcional)</div>
      <div className="space-y-2">
        {updrsDys.map((it) => (
          <ScoredItem key={it.key} label={it.label} bold value={g(it.key)} desc={it.desc} onChange={(v) => set(it.key, v)} />
        ))}
      </div>
      <CopyBlock text={text} ok={ok} onCopy={() => fire(text)} onReset={() => setS(init)} />
    </div>
  );
}

/* ================= CDR ================= */
const cdrBoxes = [
  { key: "mem", label: "Memória", primary: true, opts: [0, 0.5, 1, 2, 3], desc: [
    "Sem perda de memória ou esquecimento leve inconsistente",
    "Esquecimento leve e consistente; lembrança parcial dos eventos",
    "Perda moderada, mais marcada para fatos recentes; interfere nas atividades diárias",
    "Perda grave; retém só material muito aprendido; o novo se perde rápido",
    "Perda grave; restam apenas fragmentos"] },
  { key: "ori", label: "Orientação", opts: [0, 0.5, 1, 2, 3], desc: [
    "Totalmente orientado",
    "Orientado, com leve dificuldade nas relações de tempo",
    "Dificuldade moderada com tempo; orientado ao local no exame",
    "Grave dificuldade com tempo; em geral desorientado no tempo, às vezes no espaço",
    "Orientado apenas quanto à própria pessoa"] },
  { key: "jul", label: "Julgamento e solução de problemas", opts: [0, 0.5, 1, 2, 3], desc: [
    "Resolve bem os problemas do dia a dia; bom julgamento",
    "Leve prejuízo na solução de problemas, semelhanças e diferenças",
    "Dificuldade moderada; julgamento social geralmente mantido",
    "Grave prejuízo; julgamento social geralmente comprometido",
    "Incapaz de fazer julgamentos ou resolver problemas"] },
  { key: "com", label: "Relações comunitárias", opts: [0, 0.5, 1, 2, 3], desc: [
    "Independente no trabalho, compras e finanças",
    "Leve dificuldade nessas atividades",
    "Sem independência, mas participa de algumas; normal à inspeção casual",
    "Sem independência fora de casa; aparenta bem para ser levado a atividades",
    "Sem independência; aparenta doente demais para sair de casa"] },
  { key: "lar", label: "Lar e passatempos", opts: [0, 0.5, 1, 2, 3], desc: [
    "Vida no lar, hobbies e interesses bem mantidos",
    "Vida no lar e interesses levemente comprometidos",
    "Comprometimento leve mas definido; hobbies/tarefas difíceis abandonados",
    "Só tarefas simples preservadas; interesses muito restritos",
    "Nenhuma função significativa no lar"] },
  { key: "cui", label: "Cuidados pessoais", opts: [0, 1, 2, 3], desc: [
    "Totalmente capaz de se cuidar",
    "Precisa ser estimulado",
    "Precisa de ajuda para vestir-se, higiene e cuidados pessoais",
    "Necessita muita ajuda; frequentemente incontinente"] },
];
function mode(arr, m) {
  const c = {}; arr.forEach((v) => (c[v] = (c[v] || 0) + 1));
  let best = arr[0], bc = 0;
  Object.keys(c).forEach((k) => { const v = parseFloat(k); if (c[k] > bc || (c[k] === bc && Math.abs(v - m) < Math.abs(best - m))) { best = v; bc = c[k]; } });
  return best;
}
function globalCDR(m, sec) {
  const cnt = (p) => sec.filter(p).length;
  if (m === 0) return cnt((x) => x >= 0.5) >= 2 ? 0.5 : 0;
  if (m === 0.5) return cnt((x) => x >= 1) >= 3 ? 1 : 0.5;
  if (cnt((x) => x === m) >= 3) return m;
  const gr = sec.filter((x) => x > m), le = sec.filter((x) => x < m);
  if (gr.length >= 3 && gr.length > le.length) return mode(gr, m);
  if (le.length >= 3 && le.length > gr.length) return mode(le, m);
  return m;
}
const cdrInterp = { 0: ["Sem demência", "teal"], 0.5: ["Demência questionável / CCL", "amber"], 1: ["Demência leve", "amber"], 2: ["Demência moderada", "red"], 3: ["Demência grave", "red"] };

function CDR() {
  const init = Object.fromEntries(cdrBoxes.map((b) => [b.key, 0]));
  const [s, setS] = useState(init);
  const [ok, fire] = useCopyOk();
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const sec = ["ori", "jul", "com", "lar", "cui"].map((k) => s[k]);
  const global = globalCDR(s.mem, sec);
  const sob = cdrBoxes.reduce((a, b) => a + s[b.key], 0);
  const [label, tone] = cdrInterp[global] || ["—", "slate"];
  const text = `CDR (Clinical Dementia Rating): CDR Global ${global} — ${label}. Soma das caixas (CDR-SOB) ${sob}/18. ` +
    cdrBoxes.map((b) => `${b.label.toLowerCase()} ${s[b.key]}`).join(", ") + ".";
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <ResultBar title="CDR Global" value={`${global}`} tone={tone} note={label} compact />
        <ResultBar title="CDR-SOB" value={`${sob}`} suffix="/18" tone="slate" note="Soma das caixas" compact />
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-700 mb-1">Escala geral:</p>
        <p>0 — sem demência · 0,5 — questionável/CCL · 1 — leve · 2 — moderada · 3 — grave. Toque em ⓘ para o significado de cada nota por domínio.</p>
      </div>
      <div className="space-y-2">
        {cdrBoxes.map((b) => (
          <div key={b.key}>
            {b.primary && <div className="mb-1"><Badge>categoria primária</Badge></div>}
            <ScoredItem label={b.label} bold value={s[b.key]} options={b.opts} desc={b.desc} onChange={(v) => set(b.key, v)} />
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">CDR Global calculado pelo algoritmo da Washington University. Confira conforme seu julgamento clínico.</p>
      <CopyBlock text={text} ok={ok} onCopy={() => fire(text)} onReset={() => setS(init)} />
    </div>
  );
}

/* ================= MG-ADL ================= */
const mgadl = [
  { key: "fala", label: "Fala", desc: ["Normal", "Disartria/voz nasalada intermitente", "Constante, mas compreensível", "Difícil de entender"] },
  { key: "mast", label: "Mastigação", desc: ["Normal", "Fadiga com alimentos sólidos", "Fadiga com alimentos moles", "Necessita sonda alimentar"] },
  { key: "deglut", label: "Deglutição", desc: ["Normal", "Engasgos raros", "Engasgos frequentes / mudança de dieta", "Necessita sonda alimentar"] },
  { key: "resp", label: "Respiração", desc: ["Normal", "Dispneia aos esforços", "Dispneia em repouso", "Necessita ventilação assistida"] },
  { key: "higiene", label: "Higiene (pentear / escovar dentes)", desc: ["Normal", "Esforço aumentado, sem pausas", "Necessita de pausas para descanso", "Necessita de ajuda"] },
  { key: "levantar", label: "Levantar da cadeira", desc: ["Normal", "Leve dificuldade, sem apoio", "Apoio moderado nos braços", "Necessita de ajuda"] },
  { key: "diplopia", label: "Visão dupla (diplopia)", desc: ["Ausente", "Ocorre, mas não diária", "Diária, mas não constante", "Constante"] },
  { key: "ptose", label: "Ptose palpebral", desc: ["Ausente", "Ocorre, mas não diária", "Diária, mas não constante", "Constante"] },
];
function MGADL() {
  const init = Object.fromEntries(mgadl.map((d) => [d.key, 0]));
  const [s, setS] = useState(init);
  const [ok, fire] = useCopyOk();
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const total = mgadl.reduce((a, d) => a + s[d.key], 0);
  const tone = total <= 3 ? "teal" : total <= 8 ? "amber" : "red";
  const text = `MG-ADL (Miastenia Gravis): ${total}/24. ` + mgadl.map((d) => `${d.label.toLowerCase()} ${s[d.key]}`).join(", ") + ".";
  return (
    <div className="space-y-4">
      <ResultBar title="Pontuação total" value={`${total}`} suffix="/24" tone={tone} note="Maior = pior. Redução ≥ 2 pontos costuma ser clinicamente relevante." />
      <p className="text-xs text-slate-400">Toque em ⓘ para ver o que cada nota (0–3) significa em cada item.</p>
      <div className="space-y-2">
        {mgadl.map((d) => (
          <ScoredItem key={d.key} label={d.label} bold value={s[d.key]} options={[0, 1, 2, 3]} desc={d.desc} onChange={(v) => set(d.key, v)} />
        ))}
      </div>
      <CopyBlock text={text} ok={ok} onCopy={() => fire(text)} onReset={() => setS(init)} />
    </div>
  );
}

/* ================= ENXAQUECA (perfil + MIDAS + NRS + escore 4D) ================= */

/* Escala 4D — Pasqualetti et al., Cephalalgia 2025;45(12) (4D = Days, Drugs, Degree, Disability).
   Utilidades por dimensão (eq. 1.1–1.4), média invertida (eq. 2) e padronização 0–100 (eq. 3). */
const u4dMMD = (v) => { const m = Math.min(v, 28); return 68.48 - 11.52 * m + 0.582 * m ** 2 - 0.011 * m ** 3; };
const u4dMAM = (v) => 43.57 - 1.96 * Math.min(v, 60);
const u4dMID = (v) => 51.43 - 4.836 * Math.log(Math.min(v, 270) + 1) ** 2;
const u4dNRS = (v) => 28.85 - 11.33 * v + 1.916 * v ** 2 - 0.144 * v ** 3;
const fourDBands = [
  [5, "Nenhuma", "teal"], [20, "Muito leve", "teal"], [35, "Leve", "teal"],
  [50, "Moderada", "amber"], [65, "Grave", "amber"], [80, "Muito grave", "red"],
  [95, "Gravíssima", "red"], [Infinity, "Extrema", "red"],
];
function fourD(mmd, mams, midas, nrs) {
  const u = [u4dMMD(mmd), u4dMAM(mams), u4dMID(midas), u4dNRS(nrs)];
  const raw = -(u[0] + u[1] + u[2] + u[3]) / 4;
  const score = Math.max(0, Math.min(100, (100 * (raw + 48.1)) / 110.7));
  const [, label, tone] = fourDBands.find(([lim]) => score <= lim);
  return { u, score, label, tone };
}

const midasQs = [
  { k: "q1", label: "Dias de falta ao trabalho ou escola", hint: "nos últimos 3 meses" },
  { k: "q2", label: "Dias com produtividade ≥ 50% reduzida no trabalho/escola", hint: "nos últimos 3 meses — não contar os dias já citados acima" },
  { k: "q3", label: "Dias sem realizar tarefas domésticas", hint: "nos últimos 3 meses" },
  { k: "q4", label: "Dias com produtividade ≥ 50% reduzida nas tarefas domésticas", hint: "nos últimos 3 meses — não contar os dias já citados acima" },
  { k: "q5", label: "Dias perdidos em atividades familiares, sociais ou de lazer", hint: "nos últimos 3 meses" },
];

function Migraine() {
  const [p, setP] = useState({ cef: 0, enx: 0, med: 0, doses: 0 });
  const [m, setM] = useState({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, a: 0, b: 0 });
  const [nrs, setNrs] = useState(0);
  const [prev, setPrev] = useState("");
  const [ok1, fire1] = useCopyOk();
  const [ok2, fire2] = useCopyOk();
  const [ok4, fire4] = useCopyOk();
  const setMv = (k, v) => setM((o) => ({ ...o, [k]: v }));
  const setPv = (k, v) => setP((o) => ({ ...o, [k]: v }));

  const score = m.q1 + m.q2 + m.q3 + m.q4 + m.q5;
  let grade, gl, gtone;
  if (score <= 5) { grade = "I"; gl = "incapacidade mínima ou nenhuma"; gtone = "teal"; }
  else if (score <= 10) { grade = "II"; gl = "incapacidade leve"; gtone = "amber"; }
  else if (score <= 20) { grade = "III"; gl = "incapacidade moderada"; gtone = "amber"; }
  else { grade = "IV"; gl = "incapacidade grave"; gtone = "red"; }
  const midasText = `MIDAS: ${score} pontos — Grau ${grade} (${gl}). Dias com dor de cabeça (últimos 3 meses): ${m.a}. Intensidade média da dor: ${m.b}/10.`;

  const chronic = p.cef >= 15 && p.enx >= 8;
  const moh = p.med >= 10;
  let profText = `Perfil mensal de cefaleia: ${p.cef} dia(s) de cefaleia/mês, ${p.enx} dia(s) com características de enxaqueca/mês, ${p.med} dia(s) de uso de medicação aguda/mês, ${p.doses} dose(s) de medicação aguda/mês.`;
  if (chronic) profText += " Frequência compatível com enxaqueca crônica.";
  if (moh) profText += " Atenção: possível uso excessivo de medicação.";

  /* escore 4D — alimentado pelos dados das seções abaixo */
  const d = fourD(p.enx, p.doses, score, nrs);
  const sc = d.score.toFixed(1).replace(".", ",");
  const dims = [
    ["Dias de enxaqueca (MMD)", p.enx, "dias/mês", d.u[0]],
    ["Medicação aguda (MAM)", p.doses, "doses/mês", d.u[1]],
    ["Incapacidade (MIDAS)", score, "pts", d.u[2]],
    ["Dor na pior crise (NRS)", nrs, "/10", d.u[3]],
  ];
  const prevN = prev.trim() === "" ? NaN : parseFloat(prev.replace(",", "."));
  const delta = isNaN(prevN) ? null : d.score - Math.max(0, Math.min(100, prevN));
  const absD = delta === null ? 0 : Math.abs(delta);
  const mag = absD >= 12 ? "grande" : absD >= 7.5 ? "médio" : absD >= 3 ? "pequeno" : "não relevante";
  let fourDText = `Escore 4D de enxaqueca: ${sc}/100 — ${d.label.toLowerCase()}. Dias de enxaqueca/mês ${p.enx}, doses de medicação aguda/mês ${p.doses}, MIDAS ${score}, intensidade da pior crise (NRS) ${nrs}/10.`;
  if (delta !== null) {
    const dir = delta < 0 ? "melhora" : delta > 0 ? "piora" : "sem variação";
    fourDText += ` Em relação à avaliação anterior (${prev.trim()}): ${dir} de ${absD.toFixed(1).replace(".", ",")} ponto(s) — tamanho de efeito ${mag}.`;
  }

  return (
    <div className="space-y-5">
      {/* Escore 4D */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-teal-700">Escore 4D de enxaqueca</h2>
        <ResultBar title={`Escore 4D — ${d.label}`} value={sc} suffix="/100" tone={d.tone}
          note="Composto de dias, medicação, incapacidade e intensidade da dor" />
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-700 mb-2">Utilidade de cada dimensão</div>
          <div className="space-y-1">
            {dims.map(([l, v, un, uu]) => (
              <div key={l} className="flex items-baseline gap-2 text-xs">
                <span className="text-slate-600 flex-1 min-w-0">{l}</span>
                <span className="text-slate-400 whitespace-nowrap">{v} {un}</span>
                <span className={"font-semibold tabular-nums w-14 text-right " + (uu < 0 ? "text-red-600" : "text-teal-700")}>
                  {uu.toFixed(1).replace(".", ",")}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            As três primeiras dimensões vêm das seções abaixo (perfil mensal e MIDAS). Utilidade positiva = melhor; negativa = pior.
          </p>
        </div>
        <div className="space-y-2">
          <NumRow label="Intensidade da dor na pior crise (NRS)" hint="0 a 10 — dimensão de dor do escore 4D" value={nrs} onChange={setNrs} max={10} suffix="/10" />
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="min-w-0">
              <div className="text-sm text-slate-700">Escore 4D da avaliação anterior</div>
              <div className="text-xs text-slate-400">opcional — compara a resposta ao tratamento</div>
            </div>
            <input type="number" value={prev} min={0} max={100} placeholder="—" inputMode="decimal"
              onChange={(e) => setPrev(e.target.value)}
              className="w-20 text-center rounded-lg border border-slate-200 py-1.5 text-sm font-semibold text-slate-800 focus:border-teal-400 outline-none" />
          </div>
        </div>
        {delta !== null && (
          <div className={"rounded-xl border p-3 text-xs " + (delta < 0 ? "border-teal-200 bg-teal-50 text-teal-800" : delta > 0 ? "border-red-200 bg-red-50 text-red-800" : "border-slate-200 bg-slate-50 text-slate-600")}>
            <b>{delta < 0 ? "Melhora" : delta > 0 ? "Piora" : "Sem variação"}</b> de {absD.toFixed(1).replace(".", ",")} ponto(s) — tamanho de efeito <b>{mag}</b>.
            <div className="mt-1 opacity-80">Referência (DP = 15): ≥ 3 pequeno · ≥ 7,5 médio · ≥ 12 grande.</div>
          </div>
        )}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="mb-1"><b>Faixas:</b> 0–5 nenhuma · 5,1–20 muito leve · 20,1–35 leve · 35,1–50 moderada · 50,1–65 grave · 65,1–80 muito grave · 80,1–95 gravíssima · 95,1–100 extrema.</p>
          <p>Escala 4D (dias, medicação, dor, incapacidade) de Pasqualetti et al., <i>Cephalalgia</i> 2025. Os pesos vêm das preferências de pacientes e especialistas.</p>
        </div>
        <CopyBlock text={fourDText} ok={ok4} onCopy={() => fire4(fourDText)} onReset={() => { setNrs(0); setPrev(""); }} />
      </section>

      {/* Perfil mensal */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-teal-700">Perfil mensal de cefaleia</h2>
        <div className="grid grid-cols-4 gap-2">
          <ResultBar title="Cefaleia" value={`${p.cef}`} suffix="d" tone={p.cef >= 15 ? "amber" : "slate"} compact />
          <ResultBar title="Enxaqueca" value={`${p.enx}`} suffix="d" tone={p.enx >= 8 ? "amber" : "slate"} compact />
          <ResultBar title="Med. (dias)" value={`${p.med}`} suffix="d" tone={moh ? "red" : "slate"} compact />
          <ResultBar title="Med. (doses)" value={`${p.doses}`} tone="slate" compact />
        </div>
        <div className="space-y-2">
          <NumRow label="Dias de cefaleia por mês" value={p.cef} onChange={(v) => setPv("cef", v)} max={31} suffix="dias" />
          <NumRow label="Dias com características de enxaqueca/mês" hint="dimensão de dias do escore 4D (MMD)" value={p.enx} onChange={(v) => setPv("enx", v)} max={31} suffix="dias" />
          <NumRow label="Dias de uso de medicação aguda/mês" hint="para o critério de uso excessivo" value={p.med} onChange={(v) => setPv("med", v)} max={31} suffix="dias" />
          <NumRow label="Doses de medicação aguda por mês" hint="nº total de comprimidos/doses — dimensão de medicação do escore 4D (MAM)" value={p.doses} onChange={(v) => setPv("doses", v)} max={90} suffix="doses" />
        </div>
        {(chronic || moh) && (
          <div className="space-y-2">
            {chronic && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <b>Enxaqueca crônica:</b> frequência compatível (≥ 15 dias de cefaleia/mês por &gt; 3 meses, sendo ≥ 8 com características de enxaqueca).
              </div>
            )}
            {moh && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <b>Possível uso excessivo de medicação:</b> ≥ 10 dias/mês de triptanos, ergotamínicos, opioides ou combinações; ≥ 15 dias/mês para analgésicos simples.
              </div>
            )}
          </div>
        )}
        <CopyBlock text={profText} ok={ok2} onCopy={() => fire2(profText)} onReset={() => setP({ cef: 0, enx: 0, med: 0, doses: 0 })} />
      </section>

      {/* MIDAS */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-teal-700">MIDAS — incapacidade (últimos 3 meses)</h2>
        <ResultBar title={`MIDAS — Grau ${grade}`} value={`${score}`} suffix="pts" tone={gtone} note={gl} />
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="mb-1"><b>Todas as perguntas se referem aos últimos 3 meses.</b> Informe o <b>total de dias</b> no período inteiro — não por semana nem por mês.</p>
          <p>Pontuação = soma dos dias das 5 perguntas. Graus: 0–5 (I, mínima) · 6–10 (II, leve) · 11–20 (III, moderada) · ≥ 21 (IV, grave).</p>
        </div>
        <div className="space-y-2">
          {midasQs.map((q) => (
            <NumRow key={q.k} label={q.label} hint={q.hint} value={m[q.k]} onChange={(v) => setMv(q.k, v)} max={92} suffix="dias" />
          ))}
        </div>
        <div className="mt-1 mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Informações adicionais (não pontuam)</div>
        <div className="space-y-2">
          <NumRow label="Dias com dor de cabeça (3 meses)" value={m.a} onChange={(v) => setMv("a", v)} max={92} suffix="dias" />
          <NumRow label="Intensidade média da dor" hint="0 a 10 — item informativo do MIDAS, não entra no escore 4D" value={m.b} onChange={(v) => setMv("b", v)} max={10} suffix="/10" />
        </div>
        <CopyBlock text={midasText} ok={ok1} onCopy={() => fire1(midasText)} onReset={() => setM({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, a: 0, b: 0 })} />
      </section>
    </div>
  );
}

/* ================= PHQ-9 (depressão) ================= */
const freqDesc = ["Nenhuma vez", "Vários dias", "Mais da metade dos dias", "Quase todos os dias"];
const phq9Items = [
  "Pouco interesse ou prazer em fazer as coisas",
  "Sentir-se para baixo, deprimido ou sem perspectiva",
  "Dificuldade para pegar no sono, permanecer dormindo ou dormir demais",
  "Sentir-se cansado ou com pouca energia",
  "Falta de apetite ou comer demais",
  "Sentir-se mal consigo mesmo — ou achar que é um fracasso ou que decepcionou sua família/você mesmo",
  "Dificuldade de concentração (ex.: ler ou ver TV)",
  "Lentidão para se mover ou falar (perceptível) — ou o oposto, muito agitado/inquieto",
  "Pensar que seria melhor estar morto ou em se ferir de alguma maneira",
];
function phq9Severity(t) {
  if (t <= 4) return ["Mínima", "teal"];
  if (t <= 9) return ["Leve", "amber"];
  if (t <= 14) return ["Moderada", "amber"];
  if (t <= 19) return ["Moderadamente grave", "red"];
  return ["Grave", "red"];
}
function PHQ9() {
  const [s, setS] = useState(Array(9).fill(0));
  const [ok, fire] = useCopyOk();
  const set = (i, v) => setS((p) => p.map((x, j) => (j === i ? v : x)));
  const total = s.reduce((a, b) => a + b, 0);
  const [sev, tone] = phq9Severity(total);
  const q9 = s[8] > 0;
  const text = `PHQ-9 (depressão): ${total}/27 — gravidade ${sev.toLowerCase()}. Item 9 (ideação): ${s[8]}.`;
  return (
    <div className="space-y-4">
      <ResultBar title="Pontuação" value={`${total}`} suffix="/27" tone={tone} note={`Depressão — gravidade ${sev.toLowerCase()}`} />
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p>Nas últimas 2 semanas, com que frequência cada problema o(a) incomodou? Faixas: 0–4 mínima · 5–9 leve · 10–14 moderada · 15–19 moderadamente grave · 20–27 grave.</p>
      </div>
      {q9 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>Item 9 pontuado (pensamentos de morte/autoagressão). Recomenda-se avaliação direta do risco de suicídio.</span>
        </div>
      )}
      <div className="space-y-2">
        {phq9Items.map((it, i) => (
          <ScoredItem key={i} label={`${i + 1}. ${it}`} bold value={s[i]} options={[0, 1, 2, 3]} desc={freqDesc} onChange={(v) => set(i, v)} />
        ))}
      </div>
      <CopyBlock text={text} ok={ok} onCopy={() => fire(text)} onReset={() => setS(Array(9).fill(0))} />
    </div>
  );
}

/* ================= GAD-7 (ansiedade) ================= */
const gad7Items = [
  "Sentir-se nervoso, ansioso ou muito tenso",
  "Não conseguir parar ou controlar as preocupações",
  "Preocupar-se demais com diversas coisas",
  "Dificuldade para relaxar",
  "Ficar tão agitado que se torna difícil permanecer parado",
  "Ficar facilmente aborrecido ou irritado",
  "Sentir medo como se algo terrível fosse acontecer",
];
function gad7Severity(t) {
  if (t <= 4) return ["Mínima", "teal"];
  if (t <= 9) return ["Leve", "amber"];
  if (t <= 14) return ["Moderada", "amber"];
  return ["Grave", "red"];
}
function GAD7() {
  const [s, setS] = useState(Array(7).fill(0));
  const [ok, fire] = useCopyOk();
  const set = (i, v) => setS((p) => p.map((x, j) => (j === i ? v : x)));
  const total = s.reduce((a, b) => a + b, 0);
  const [sev, tone] = gad7Severity(total);
  const text = `GAD-7 (ansiedade): ${total}/21 — gravidade ${sev.toLowerCase()}.`;
  return (
    <div className="space-y-4">
      <ResultBar title="Pontuação" value={`${total}`} suffix="/21" tone={tone} note={`Ansiedade — gravidade ${sev.toLowerCase()}`} />
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p>Nas últimas 2 semanas, com que frequência cada problema o(a) incomodou? Faixas: 0–4 mínima · 5–9 leve · 10–14 moderada · 15–21 grave.</p>
      </div>
      <div className="space-y-2">
        {gad7Items.map((it, i) => (
          <ScoredItem key={i} label={`${i + 1}. ${it}`} bold value={s[i]} options={[0, 1, 2, 3]} desc={freqDesc} onChange={(v) => set(i, v)} />
        ))}
      </div>
      <CopyBlock text={text} ok={ok} onCopy={() => fire(text)} onReset={() => setS(Array(7).fill(0))} />
    </div>
  );
}

/* ================= GDS-15 (depressão geriátrica) ================= */
/* pointWhen = resposta que pontua (1 ponto) */
const gds15 = [
  { q: "Está basicamente satisfeito(a) com sua vida?", pointWhen: "nao" },
  { q: "Abandonou muitas de suas atividades e interesses?", pointWhen: "sim" },
  { q: "Sente que sua vida está vazia?", pointWhen: "sim" },
  { q: "Sente-se frequentemente entediado(a)?", pointWhen: "sim" },
  { q: "Está de bom humor na maior parte do tempo?", pointWhen: "nao" },
  { q: "Tem medo de que algo ruim lhe aconteça?", pointWhen: "sim" },
  { q: "Sente-se feliz na maior parte do tempo?", pointWhen: "nao" },
  { q: "Sente-se frequentemente desamparado(a)?", pointWhen: "sim" },
  { q: "Prefere ficar em casa a sair e fazer coisas novas?", pointWhen: "sim" },
  { q: "Acha que tem mais problemas de memória que a maioria?", pointWhen: "sim" },
  { q: "Acha maravilhoso estar vivo(a)?", pointWhen: "nao" },
  { q: "Sente-se inútil do jeito que está agora?", pointWhen: "sim" },
  { q: "Sente-se cheio(a) de energia?", pointWhen: "nao" },
  { q: "Sente que sua situação é sem esperança?", pointWhen: "sim" },
  { q: "Acha que a maioria das pessoas está melhor que você?", pointWhen: "sim" },
];
function GDS15() {
  const [ans, setAns] = useState({}); // i -> 'sim' | 'nao'
  const [ok, fire] = useCopyOk();
  const set = (i, v) => setAns((p) => ({ ...p, [i]: v }));
  const total = gds15.reduce((a, it, i) => a + (ans[i] === it.pointWhen ? 1 : 0), 0);
  const answered = Object.keys(ans).length;
  let sev, tone;
  if (total <= 4) { sev = "Sem depressão"; tone = "teal"; }
  else if (total <= 9) { sev = "Depressão leve a moderada"; tone = "amber"; }
  else { sev = "Depressão grave"; tone = "red"; }
  const text = `GDS-15 (escala de depressão geriátrica): ${total}/15 — ${sev.toLowerCase()}.`;
  return (
    <div className="space-y-4">
      <ResultBar title="Pontuação" value={`${total}`} suffix="/15" tone={tone} note={sev} />
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p>Como o(a) idoso(a) tem se sentido na última semana. Faixas: 0–4 sem depressão · 5–9 leve a moderada · 10–15 grave. {answered < 15 && <b>{15 - answered} pergunta(s) sem resposta.</b>}</p>
      </div>
      <div className="space-y-2">
        {gds15.map((it, i) => {
          const v = ans[i];
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-sm text-slate-700 mb-2">{i + 1}. {it.q}</div>
              <div className="flex gap-2">
                {["sim", "nao"].map((opt) => {
                  const sel = v === opt;
                  return (
                    <button key={opt} onClick={() => set(i, opt)}
                      className={"px-4 py-1.5 rounded-lg text-sm font-semibold border transition-colors " +
                        (sel ? "bg-teal-600 border-teal-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-teal-400")}>
                      {opt === "sim" ? "Sim" : "Não"}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <CopyBlock text={text} ok={ok} onCopy={() => fire(text)} onReset={() => setAns({})} />
    </div>
  );
}

/* ================= FIBROMIALGIA (FiRST + critérios ACR 2016) ================= */

/* FiRST — Perrot, Bouhassira & Fermanian, Pain 2010;150:250-6.
   Tradução livre dos 6 itens originais; a versão brasileira validada
   (Jesus et al., Adv Rheumatol 2022) não publica o texto dos itens. */
const firstItems = [
  "Sinto dor por todo o corpo.",
  "Minha dor vem acompanhada de uma fadiga geral contínua e muito desagradável.",
  "Minha dor é como queimação, choques elétricos ou cãibras.",
  "Minha dor vem acompanhada de outras sensações incomuns pelo corpo, como formigamento, agulhadas ou adormecimento.",
  "Minha dor vem acompanhada de outros problemas de saúde, como problemas digestivos, problemas urinários, dores de cabeça ou pernas inquietas.",
  "Minha dor tem impacto importante na minha vida, em especial no sono e na capacidade de concentração, e me deixa mais lento(a) de modo geral.",
];

/* Critérios ACR 2016 (revisão dos critérios 2010/2011) — Wolfe et al., Semin Arthritis Rheum 2016;46:319-29.
   Sítios em itálico no original (mandíbulas, tórax, abdome) contam no WPI mas não na contagem de regiões. */
const wpiRegions = [
  { key: "r1", label: "Região superior esquerda (1)", sites: [["Mandíbula E", true], ["Cintura escapular E", false], ["Braço E", false], ["Antebraço E", false]] },
  { key: "r2", label: "Região superior direita (2)", sites: [["Mandíbula D", true], ["Cintura escapular D", false], ["Braço D", false], ["Antebraço D", false]] },
  { key: "r3", label: "Região inferior esquerda (3)", sites: [["Quadril E (glúteo/trocânter)", false], ["Coxa E", false], ["Perna E", false]] },
  { key: "r4", label: "Região inferior direita (4)", sites: [["Quadril D (glúteo/trocânter)", false], ["Coxa D", false], ["Perna D", false]] },
  { key: "r5", label: "Região axial (5)", sites: [["Pescoço", false], ["Dorso superior", false], ["Dorso inferior (lombar)", false], ["Tórax", true], ["Abdome", true]] },
];
const sssAnchors = [
  "Sem problema",
  "Leve: discreto ou intermitente",
  "Moderado: problema considerável, frequentemente presente",
  "Grave: contínuo, intenso, perturba a vida",
];
const sssMain = [
  { key: "fad", label: "Fadiga" },
  { key: "sono", label: "Acordar cansado (sono não restaurador)" },
  { key: "cog", label: "Sintomas cognitivos" },
];
const sssExtra = [
  { key: "cef", label: "Dor de cabeça" },
  { key: "abd", label: "Dor ou cólica no baixo ventre" },
  { key: "dep", label: "Depressão" },
];
const psdBands = [[3, "Nenhum"], [7, "Leve"], [11, "Moderado"], [19, "Grave"], [Infinity, "Muito grave"]];

function Fibro() {
  const [fi, setFi] = useState({});
  const [sites, setSites] = useState({});
  const [sss, setSss] = useState({ fad: 0, sono: 0, cog: 0 });
  const [extra, setExtra] = useState({});
  const [tres, setTres] = useState(false);
  const [okF, fireF] = useCopyOk();
  const [okA, fireA] = useCopyOk();

  /* FiRST */
  const firstScore = firstItems.reduce((a, _, i) => a + (fi[i] ? 1 : 0), 0);
  const firstPos = firstScore >= 5;
  const firstNums = firstItems.map((_, i) => (fi[i] ? i + 1 : null)).filter(Boolean);
  const firstText = `FiRST (triagem de fibromialgia): ${firstScore}/6 — triagem ${firstPos ? "positiva" : "negativa"} (ponto de corte ≥ 5). ` +
    `Itens positivos: ${firstNums.length ? firstNums.join(", ") : "nenhum"}.`;

  /* ACR 2016 */
  const wpi = wpiRegions.reduce((a, r) => a + r.sites.filter((_, i) => sites[`${r.key}-${i}`]).length, 0);
  const regions = wpiRegions.filter((r) => r.sites.some((s, i) => !s[1] && sites[`${r.key}-${i}`])).length;
  const sssScore = sss.fad + sss.sono + sss.cog + sssExtra.reduce((a, e) => a + (extra[e.key] ? 1 : 0), 0);
  const c1 = (wpi >= 7 && sssScore >= 5) || (wpi >= 4 && wpi <= 6 && sssScore >= 9);
  const c2 = regions >= 4;
  const met = c1 && c2 && tres;
  const psd = wpi + sssScore;
  const psdLabel = psdBands.find(([lim]) => psd <= lim)[1];
  const acrText = `Critérios ACR 2016 para fibromialgia: ${met ? "preenchidos" : "não preenchidos"}. ` +
    `WPI ${wpi}/19, SSS ${sssScore}/12, ${regions}/5 regiões com dor, sintomas por ≥ 3 meses: ${tres ? "sim" : "não"}. ` +
    `Critério 1 (WPI ≥ 7 e SSS ≥ 5, ou WPI 4–6 e SSS ≥ 9): ${c1 ? "sim" : "não"}; critério 2 (dor em 4 de 5 regiões): ${c2 ? "sim" : "não"}. ` +
    `Escore de distresse polissintomático (WPI + SSS): ${psd}/31 — ${psdLabel.toLowerCase()}.`;

  return (
    <div className="space-y-5">
      {/* FiRST */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-teal-700">FiRST — triagem rápida</h2>
        <ResultBar title={firstPos ? "Triagem positiva" : "Triagem negativa"} value={`${firstScore}`} suffix="/6"
          tone={firstPos ? "amber" : "teal"} note={firstPos ? "≥ 5: fibromialgia provável — confirmar com os critérios ACR" : "Abaixo do corte de 5"} />
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="mb-1">Marque cada afirmação com que o paciente concorda. Cada "sim" vale 1 ponto; <b>≥ 5 indica fibromialgia provável</b>.</p>
          <p>Destinado a quem já tem dor crônica difusa. É <b>triagem, não diagnóstico</b> (sensibilidade 90,5% e especificidade 85,7% no estudo original; 92,3% e 61,6% na versão brasileira online).</p>
        </div>
        <div className="space-y-2">
          {firstItems.map((it, i) => (
            <CheckChip key={i} checked={!!fi[i]} onToggle={() => setFi((p) => ({ ...p, [i]: !p[i] }))}>{it}</CheckChip>
          ))}
        </div>
        <CopyBlock text={firstText} ok={okF} onCopy={() => fireF(firstText)} onReset={() => setFi({})} />
      </section>

      {/* ACR 2016 */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-teal-700">Critérios ACR 2016 — diagnóstico</h2>
        <div className={"rounded-2xl p-4 text-white shadow-sm bg-gradient-to-br " + (met ? "from-amber-500 to-amber-600" : "from-slate-500 to-slate-600")}>
          <div className="text-xs uppercase tracking-wide opacity-80">Critérios ACR 2016</div>
          <div className="text-xl font-bold leading-tight">{met ? "Critérios preenchidos" : "Critérios não preenchidos"}</div>
          <div className="text-xs opacity-90 mt-1.5 space-y-0.5">
            <div>{c1 ? "✓" : "✗"} 1. WPI ≥ 7 e SSS ≥ 5, ou WPI 4–6 e SSS ≥ 9</div>
            <div>{c2 ? "✓" : "✗"} 2. Dor generalizada: 4 de 5 regiões</div>
            <div>{tres ? "✓" : "✗"} 3. Sintomas presentes por ≥ 3 meses</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <ResultBar title="WPI" value={`${wpi}`} suffix="/19" tone="slate" compact />
          <ResultBar title="SSS" value={`${sssScore}`} suffix="/12" tone="slate" compact />
          <ResultBar title="Regiões" value={`${regions}`} suffix="/5" tone={c2 ? "amber" : "slate"} compact />
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          O diagnóstico é válido <b>independentemente de outros diagnósticos</b> — não é preciso excluir outras condições que expliquem os sintomas. Tanto o WPI como o SSS se referem à <b>última semana</b>.
        </div>

        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Índice de dor generalizada (WPI)</div>
          <p className="text-xs text-slate-400 mb-2">Na última semana, onde houve dor? Itens marcados com * contam no WPI, mas não na contagem de regiões.</p>
          <div className="space-y-2">
            {wpiRegions.map((r) => {
              const n = r.sites.filter((_, i) => sites[`${r.key}-${i}`]).length;
              const counts = r.sites.some((s, i) => !s[1] && sites[`${r.key}-${i}`]);
              return (
                <div key={r.key} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="font-semibold text-slate-800 text-sm">{r.label}</span>
                    <Badge tone={counts ? "teal" : "slate"}>{n}/{r.sites.length}{counts ? " · conta" : ""}</Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {r.sites.map(([label, excl], i) => (
                      <CheckChip key={i} checked={!!sites[`${r.key}-${i}`]}
                        onToggle={() => setSites((p) => ({ ...p, [`${r.key}-${i}`]: !p[`${r.key}-${i}`] }))}>
                        {label}{excl ? " *" : ""}
                      </CheckChip>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Escala de gravidade de sintomas (SSS)</div>
          <p className="text-xs text-slate-400 mb-2">Gravidade na última semana, de 0 a 3.</p>
          <div className="space-y-2">
            {sssMain.map((s) => (
              <ScoredItem key={s.key} label={s.label} bold value={sss[s.key]} options={[0, 1, 2, 3]} desc={sssAnchors}
                onChange={(v) => setSss((p) => ({ ...p, [s.key]: v }))} />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2 mb-2">Na última semana, foi incomodado por algum destes? (1 ponto cada)</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {sssExtra.map((e) => (
              <CheckChip key={e.key} checked={!!extra[e.key]} onToggle={() => setExtra((p) => ({ ...p, [e.key]: !p[e.key] }))}>
                {e.label}
              </CheckChip>
            ))}
          </div>
        </div>

        <CheckChip checked={tres} onToggle={() => setTres((t) => !t)}>
          Sintomas presentes em nível semelhante por pelo menos 3 meses
        </CheckChip>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800">Distresse polissintomático (WPI + SSS)</div>
              <div className="text-xs text-slate-400">Escala de gravidade — não faz parte dos critérios diagnósticos</div>
            </div>
            <Badge>{psd}/31 · {psdLabel}</Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Faixas: 0–3 nenhum · 4–7 leve · 8–11 moderado · 12–19 grave · 20–31 muito grave.</p>
        </div>

        <CopyBlock text={acrText} ok={okA} onCopy={() => fireA(acrText)}
          onReset={() => { setSites({}); setSss({ fad: 0, sono: 0, cog: 0 }); setExtra({}); setTres(false); }} />
      </section>
    </div>
  );
}

/* ================= APP ================= */
const tabs = [
  { id: "meem", label: "MEEM", icon: Brain, comp: MEEM },
  { id: "updrs", label: "UPDRS Motor", icon: Activity, comp: UPDRS },
  { id: "cdr", label: "CDR", icon: ClipboardList, comp: CDR },
  { id: "mgadl", label: "MG-ADL", icon: Stethoscope, comp: MGADL },
  { id: "enxaqueca", label: "Enxaqueca", icon: Zap, comp: Migraine },
  { id: "fibro", label: "Fibromialgia", icon: Flame, comp: Fibro },
  { id: "phq9", label: "PHQ-9", icon: CloudRain, comp: PHQ9 },
  { id: "gad7", label: "GAD-7", icon: HeartPulse, comp: GAD7 },
  { id: "gds15", label: "GDS-15", icon: Users, comp: GDS15 },
];

export default function App() {
  const [tab, setTab] = useState("meem");
  const Active = tabs.find((t) => t.id === tab).comp;
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="max-w-2xl mx-auto px-3 py-5">
        <header className="mb-4 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center"><Brain size={20} /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-none">NeuroCalc</h1>
            <p className="text-sm text-slate-500">Escalas neurológicas — funciona offline</p>
          </div>
        </header>
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const Icon = t.icon; const sel = t.id === tab;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={"flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors " +
                  (sel ? "bg-teal-600 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200")}>
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>
        <main><Active /></main>
        <footer className="mt-6 text-[11px] text-slate-400 leading-relaxed border-t border-slate-200 pt-3">
          Ferramenta de apoio à pontuação — não substitui o julgamento clínico nem as escalas oficiais.
          As descrições são resumos próprios. O UPDRS segue a estrutura clássica de 108 pontos.
          O MDS-UPDRS é protegido por direitos autorais (MDS) — uso institucional pode exigir permissão.
          Escore 4D: Pasqualetti et al., <i>Cephalalgia</i> 2025;45(12). FiRST: Perrot et al., <i>Pain</i> 2010;150:250-6.
          Critérios de fibromialgia: revisão de 2016 de Wolfe et al., <i>Semin Arthritis Rheum</i> 2016;46:319-29.
        </footer>
      </div>
    </div>
  );
}
