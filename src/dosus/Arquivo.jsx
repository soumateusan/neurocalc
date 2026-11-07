import { useEffect, useRef, useState } from "react";
import { Search, FolderOpen, RefreshCw, Trash2, Download, Upload, Plus, ShieldCheck } from "lucide-react";
import { db, apagarPaciente, exportarBackup, importarBackup } from "./db.js";
import { Aviso } from "./comum.jsx";
import { idadeDe } from "./alzheimer/processo.js";

const nomePat = { alzheimer: "Doença de Alzheimer" };
const tipoTxt = { inicio: "início", continuidade: "renovação", troca: "troca/aumento" };
const semAcento = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function Arquivo({ versao, onAbrir, onRenovar, onNovo, atualId }) {
  const [pacs, setPacs] = useState([]);
  const [procs, setProcs] = useState([]);
  const [busca, setBusca] = useState("");
  const [msg, setMsg] = useState("");
  const [recarga, setRecarga] = useState(0);
  const arq = useRef();

  useEffect(() => {
    let vivo = true;
    Promise.all([db.todos("pacientes"), db.todos("processos")]).then(([p, r]) => { if (vivo) { setPacs(p); setProcs(r); } });
    return () => { vivo = false; };
  }, [versao, recarga]);

  const q = semAcento(busca).trim();
  const digitos = busca.replace(/\D/g, "");
  const lista = pacs
    .filter((p) => !q || semAcento(p.nome).includes(q) || semAcento(p.mae).includes(q) || (digitos.length >= 3 && (String(p.cpf).replace(/\D/g, "").includes(digitos) || String(p.cns).replace(/\D/g, "").includes(digitos))))
    .map((p) => ({ p, ps: procs.filter((r) => r.pacienteId === p.id).sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || "")) }))
    .sort((a, b) => (b.p.atualizadoEm || "").localeCompare(a.p.atualizadoEm || ""));

  const apagar = async (p) => {
    if (!window.confirm(`Apagar ${p.nome} e todos os processos dele(a) deste aparelho? Não dá para desfazer (a não ser por um backup).`)) return;
    await apagarPaciente(p.id);
    setRecarga((r) => r + 1);
  };
  const apagarProc = async (r) => {
    if (!window.confirm("Apagar este processo? Não dá para desfazer (a não ser por um backup).")) return;
    await db.apagar("processos", r.id);
    setRecarga((x) => x + 1);
  };
  const importar = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try { const n = await importarBackup(f); setMsg(`Backup importado: ${n} registro(s) atualizados.`); setRecarga((r) => r + 1); }
    catch (err) { setMsg(`Erro ao importar: ${err.message}`); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pacientes</h2>
          <p className="text-xs text-slate-500">{pacs.length} paciente(s) · {procs.length} processo(s) salvos neste aparelho</p>
        </div>
        <button onClick={() => onNovo()} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700">
          <Plus size={15} /> Novo paciente — Alzheimer
        </button>
      </div>

      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-teal-400">
        <Search size={17} className="text-slate-400" />
        <input autoFocus value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, nome da mãe, CPF ou CNS"
          className="flex-1 outline-none text-sm bg-transparent" />
      </label>

      {lista.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          {pacs.length ? "Nenhum paciente encontrado." : "Nenhum paciente ainda. Comece em “Novo paciente”: tudo o que você preencher fica guardado aqui."}
        </div>
      )}

      <div className="space-y-2">
        {lista.map(({ p, ps }) => (
          <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 truncate">{p.nome}</div>
                <div className="text-xs text-slate-500">
                  {[idadeDe(p) && `${idadeDe(p)} anos`, p.cpf && `CPF ${p.cpf}`, p.cns && `CNS ${p.cns}`, p.tel1].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button title="Novo processo para este paciente" onClick={() => { const { id, atualizadoEm: _a, ...pac } = p; void _a; onNovo(pac, id); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50"><Plus size={16} /></button>
                <button title="Apagar paciente" onClick={() => apagar(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 size={16} /></button>
              </div>
            </div>
            {ps.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {ps.map((r) => {
                  const res = r.resumo || {};
                  return (
                    <div key={r.id} className={"flex items-center gap-2 rounded-lg border px-2.5 py-2 " + (r.id === atualId ? "border-teal-300 bg-teal-50" : "border-slate-100 bg-slate-50")}>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-slate-700 truncate">
                          {nomePat[r.patologia] || r.patologia} <span className="font-normal text-slate-500">· {tipoTxt[res.tipo] || "início"} · {new Date(r.criadoEm).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {[res.cid, (res.meds || []).join(" + ")].filter(Boolean).join(" · ") || "sem medicamento"}
                          {res.total ? ` · checklist ${res.feitos}/${res.total}` : ""}
                        </div>
                      </div>
                      <button onClick={() => onAbrir(p, r)} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-teal-400">
                        <FolderOpen size={13} /> Abrir
                      </button>
                      <button onClick={() => onRenovar(p, r)} title="Renovação: copia história, prescrição e exames; zera MEEM, CDR e datas"
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-teal-400">
                        <RefreshCw size={13} /> Renovar
                      </button>
                      <button onClick={() => apagarProc(r)} className="p-1 text-slate-300 hover:text-rose-600"><Trash2 size={14} /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><ShieldCheck size={16} className="text-teal-600" /> Cópia de segurança</div>
        <p className="text-xs text-slate-500">Os dados ficam só neste navegador, sem internet e sem servidor. Se limpar os dados do navegador ou trocar de computador, eles se perdem — exporte um backup com frequência e guarde em local seguro (contém dados de saúde).</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportarBackup} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800"><Download size={14} /> Exportar backup (.json)</button>
          <button onClick={() => arq.current.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:border-teal-400"><Upload size={14} /> Importar backup</button>
          <input ref={arq} type="file" accept="application/json,.json" className="hidden" onChange={importar} />
        </div>
        {msg && <Aviso tom="teal" icone={false}>{msg}</Aviso>}
      </div>
    </div>
  );
}
