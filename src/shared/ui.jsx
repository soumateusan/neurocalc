import { useState, createContext, useContext } from "react";
import { Printer, Copy, Check, RotateCcw, Info } from "lucide-react";

/* ---------- identificação do paciente, compartilhada entre as abas ---------- */
export const PacienteCtx = createContext({ nome: "", idade: "", data: "", app: "NeuroCalc" });

/* estado interno, ou controlado por fora (o DOSUS guarda as respostas no processo do paciente) */
export function useEstado(inicial, estado, setEstado) {
  const [interno, setInterno] = useState(inicial);
  if (setEstado) return [estado ?? inicial, (v) => setEstado(typeof v === "function" ? v(estado ?? inicial) : v)];
  return [interno, setInterno];
}
export const hojeISO = () => new Date().toISOString().slice(0, 10);
export const fmtData = (iso) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("/") : iso || "");

/* linha pontilhada de formulário, usada só na impressão */
export function Campo({ rot, valor, w = "180px" }) {
  return (
    <span className="whitespace-nowrap">
      {rot}:{" "}
      <span className="inline-block border-b border-black align-bottom px-1" style={{ minWidth: w }}>
        {valor || " "}
      </span>
    </span>
  );
}

export function FichaCabecalho({ titulo, extra }) {
  const p = useContext(PacienteCtx);
  return (
    <div className="mb-3">
      <h1 className="text-center text-sm font-bold uppercase tracking-wide">{titulo}</h1>
      <div className="mt-3 text-[11px] leading-7">
        <div><Campo rot="Nome do paciente" valor={p.nome} w="320px" /></div>
        <div className="flex flex-wrap gap-x-6">
          <Campo rot="Idade" valor={p.idade ? `${p.idade} anos` : ""} w="70px" />
          <Campo rot="Data da avaliação" valor={fmtData(p.data)} w="110px" />
        </div>
        {extra}
      </div>
    </div>
  );
}

export function FichaRodape() {
  const p = useContext(PacienteCtx);
  return (
    <div className="mt-10 text-[11px]">
      <Campo rot="Assinatura e carimbo" valor="" w="320px" />
      <p className="mt-6 text-[9px] text-neutral-500 border-t border-neutral-300 pt-2">
        Documento gerado pelo {p.app || "NeuroCalc"}. Instrumento de rastreio — não substitui o julgamento clínico.
      </p>
    </div>
  );
}

export function BotaoImprimir({ label = "Imprimir / salvar em PDF" }) {
  return (
    <button onClick={() => window.print()}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800">
      <Printer size={16} /> {label}
    </button>
  );
}

/* dois pentágonos que se cruzam — estímulo da praxia construtiva do MEEM.
   A interseção é um quadrilátero, como na figura original. */
export function Pentagonos({ w = 150 }) {
  return (
    <svg viewBox="0 0 114 92" width={w} height={(w * 92) / 114} className="block">
      <polygon points="38,12 66.5,32.7 55.6,66.3 20.4,66.3 9.5,32.7" fill="none" stroke="#000" strokeWidth="1.1" />
      <polygon points="76,26 104.5,46.7 93.6,80.3 58.4,80.3 47.5,46.7" fill="none" stroke="#000" strokeWidth="1.1" />
    </svg>
  );
}

/* tabela simples da ficha impressa */
export function FichaTabela({ cols, linhas, total }) {
  return (
    <table className="w-full border-collapse text-[11px]">
      <thead>
        <tr>
          {cols.map((c, i) => (
            <th key={i} className={"border border-black px-2 py-1 font-bold " + (i === 0 ? "text-left" : "text-center w-16")}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((l, i) => (
          <tr key={i}>
            {l.map((c, j) => (
              <td key={j} className={"border border-black px-2 py-1 " + (j === 0 ? "" : "text-center")}>{c}</td>
            ))}
          </tr>
        ))}
        {total && (
          <tr className="font-bold">
            {total.map((c, j) => (
              <td key={j} className={"border border-black px-2 py-1 " + (j === 0 ? "" : "text-center")}>{c}</td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );
}

/* ---------- clipboard ---------- */
export function copyToClipboard(text, onOk) {
  const done = () => onOk();
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand("copy"); done(); } catch { /* sem área de transferência */ }
    document.body.removeChild(ta);
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    else fallback();
  } catch { fallback(); }
}
export function useCopyOk() {
  const [ok, setOk] = useState(false);
  const fire = (text) => copyToClipboard(text, () => { setOk(true); setTimeout(() => setOk(false), 1800); });
  return [ok, fire];
}

/* ---------- shared UI ---------- */
export function Picker({ value, onChange, options = [0, 1, 2, 3, 4], labels }) {
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

export function ScoredItem({ label, bold, value, options = [0, 1, 2, 3, 4], desc, hint, onChange }) {
  const [open, setOpen] = useState(false);
  const meaning = desc ? desc[options.indexOf(value)] : null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <span className={"text-sm " + (bold ? "font-semibold text-slate-800" : "text-slate-700")}>{label}</span>
          {hint && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{hint}</p>}
        </div>
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

export function CheckChip({ checked, onToggle, children }) {
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

export function CheckBox({ checked, onToggle }) {
  return (
    <button onClick={onToggle}
      className={"w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 " +
        (checked ? "bg-teal-600 border-teal-600" : "bg-white border-slate-300 hover:border-teal-300")}>
      {checked && <Check size={16} className="text-white" />}
    </button>
  );
}

export function NumField({ value, onChange, max = 90, suffix }) {
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

export function NumRow({ label, hint, value, onChange, max, suffix }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="min-w-0"><div className="text-sm text-slate-700">{label}</div>{hint && <div className="text-xs text-slate-400">{hint}</div>}</div>
      <NumField value={value} onChange={onChange} max={max} suffix={suffix} />
    </div>
  );
}

export function Badge({ children, tone = "teal" }) {
  const map = {
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return <span className={"inline-block px-2.5 py-1 rounded-full text-xs font-semibold border " + map[tone]}>{children}</span>;
}

export function ResultBar({ title, value, suffix, tone = "teal", note, compact }) {
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

export function CopyBlock({ text, onCopy, ok, onReset }) {
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
