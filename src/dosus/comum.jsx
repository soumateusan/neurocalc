import { Check, Copy, Printer, AlertTriangle, Info } from "lucide-react";
import { useCopyOk } from "../shared/ui.jsx";
import brasao from "./assets/brasao-bahia.jpg";

/* ---------- campos de formulário ---------- */
export function Txt({ rot, valor, onChange, tipo = "text", ph, dica, className = "", obrig, area, linhas = 4, ...rest }) {
  const cls = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:border-teal-400 outline-none";
  return (
    <label className={"block " + className}>
      {rot && <span className="block text-[11px] text-slate-500 mb-1">{rot}{obrig && <span className="text-rose-500"> *</span>}</span>}
      {area
        ? <textarea rows={linhas} value={valor ?? ""} placeholder={ph} onChange={(e) => onChange(e.target.value)} className={cls + " leading-relaxed"} {...rest} />
        : <input type={tipo} value={valor ?? ""} placeholder={ph} onChange={(e) => onChange(e.target.value)} className={cls} {...rest} />}
      {dica && <span className="block text-[11px] text-slate-400 mt-1">{dica}</span>}
    </label>
  );
}

export function Escolha({ valor, onChange, opcoes, pequeno }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {opcoes.map(([v, r]) => {
        const sel = valor === v;
        return (
          <button key={String(v)} type="button" onClick={() => onChange(sel ? null : v)}
            className={(pequeno ? "px-2.5 py-1 text-xs " : "px-3 py-1.5 text-sm ") + "rounded-lg font-semibold border transition-colors " +
              (sel ? "bg-teal-600 border-teal-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700")}>
            {r}
          </button>
        );
      })}
    </div>
  );
}

export function Marca({ checked, onToggle, children, tom = "teal" }) {
  const on = tom === "rose" ? "bg-rose-50 border-rose-300 text-rose-800" : "bg-teal-50 border-teal-300 text-teal-800";
  const box = tom === "rose" ? "bg-rose-600 border-rose-600" : "bg-teal-600 border-teal-600";
  return (
    <button type="button" onClick={onToggle}
      className={"flex items-start gap-2 px-3 py-2 rounded-lg text-sm border text-left transition-colors w-full " +
        (checked ? on : "bg-white border-slate-200 text-slate-600 hover:border-teal-300")}>
      <span className={"mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 " + (checked ? box : "border-slate-300")}>
        {checked && <Check size={12} className="text-white" />}
      </span>
      <span className="leading-snug">{children}</span>
    </button>
  );
}

export function Cartao({ titulo, sub, children, direita, className = "" }) {
  return (
    <section className={"rounded-xl border border-slate-200 bg-white p-4 " + className}>
      {(titulo || direita) && (
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            {titulo && <h3 className="font-semibold text-slate-800 text-sm">{titulo}</h3>}
            {sub && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{sub}</p>}
          </div>
          {direita}
        </div>
      )}
      {children}
    </section>
  );
}

export function Aviso({ tom = "amber", children, icone = true }) {
  const map = {
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    rose: "bg-rose-50 border-rose-200 text-rose-900",
    teal: "bg-teal-50 border-teal-200 text-teal-900",
    slate: "bg-slate-50 border-slate-200 text-slate-600",
  };
  const Ic = tom === "teal" || tom === "slate" ? Info : AlertTriangle;
  return (
    <div className={"rounded-xl border p-3 text-xs leading-relaxed flex gap-2 " + map[tom]}>
      {icone && <Ic size={15} className="shrink-0 mt-0.5" />}
      <div className="min-w-0 space-y-1">{children}</div>
    </div>
  );
}

export function Faltando({ itens, ok = "Tudo preenchido." }) {
  if (!itens.length) return <Aviso tom="teal">{ok}</Aviso>;
  return <Aviso>Falta: {itens.join(" · ")}.</Aviso>;
}

/* bloco de texto pronto para colar no prontuário/prescrição eletrônica */
export function TextoPronto({ texto, onUsado, linhas = 14 }) {
  const [ok, fire] = useCopyOk();
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
      <textarea readOnly value={texto} rows={linhas}
        className="w-full text-xs text-slate-700 leading-relaxed bg-white rounded-lg border border-slate-200 p-2.5 font-mono whitespace-pre-wrap" />
      <button type="button" onClick={() => { fire(texto); onUsado && onUsado(); }}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700">
        {ok ? <><Check size={16} /> Copiado!</> : <><Copy size={16} /> Copiar para o prontuário</>}
      </button>
    </div>
  );
}

export function Imprimir({ label = "Gerar PDF / imprimir", onClick, desab }) {
  return (
    <button type="button" disabled={desab} onClick={() => { onClick && onClick(); setTimeout(() => window.print(), 50); }}
      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-40">
      <Printer size={16} /> {label}
    </button>
  );
}

/* ---------- peças das fichas impressas (padrão SESAB) ---------- */
export function CabecalhoSESAB() {
  return (
    <div className="border-y border-black py-2 mb-4 flex items-center gap-4">
      <img src={brasao} alt="" className="w-[64px] h-[66px] object-contain ml-8" />
      <div className="text-[10.5px] leading-[1.25]">
        <div className="font-bold text-[12px]">GOVERNO DO ESTADO DA BAHIA</div>
        <div>Secretaria da Saúde do Estado da Bahia - SESAB</div>
        <div>Superintendência de Assistência Farmacêutica, Ciência e Tecnologia em Saúde - SAFTEC</div>
        <div>Diretoria de Assistência Farmacêutica – DASF</div>
        <div>Coordenação de Assistência Farmacêutica na Atenção Especializada - COAFE</div>
      </div>
    </div>
  );
}

/* lacuna sublinhada já preenchida */
export function Lacuna({ v, w = "200px" }) {
  return (
    <span className="inline-block border-b border-black px-1 align-baseline font-semibold" style={{ minWidth: w }}>
      {v || " "}
    </span>
  );
}

export const X = ({ on }) => <span className="font-mono">({on ? "X" : "  "})</span>;

export const fmt = (iso) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("/") : iso || "");
export const dataExtenso = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
};
