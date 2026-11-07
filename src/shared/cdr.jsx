import { Badge, ScoredItem, CopyBlock, ResultBar, BotaoImprimir, FichaCabecalho, FichaRodape, Campo, useCopyOk, useEstado } from "./ui.jsx";

/* ================= CDR ================= */
export const cdrBoxes = [
  { key: "mem", label: "Memória", primary: true, opts: [0, 0.5, 1, 2, 3],
    como: "Pergunte ao informante sobre esquecimentos recentes: repetir as mesmas perguntas, esquecer conversas, compromissos e onde guardou objetos. Compare com fatos antigos, que costumam resistir mais.",
    desc: [
    "Sem perda de memória ou esquecimento leve inconsistente",
    "Esquecimento leve e consistente; lembrança parcial dos eventos",
    "Perda moderada, mais marcada para fatos recentes; interfere nas atividades diárias",
    "Perda grave; retém só material muito aprendido; o novo se perde rápido",
    "Perda grave; restam apenas fragmentos"] },
  { key: "ori", label: "Orientação", opts: [0, 0.5, 1, 2, 3],
    como: "Verifique dia, mês, ano e horário aproximado, e pergunte ao informante se o paciente se perde — primeiro em lugares desconhecidos, depois em trajetos e ambientes familiares.",
    desc: [
    "Totalmente orientado",
    "Orientado, com leve dificuldade nas relações de tempo",
    "Dificuldade moderada com tempo; orientado ao local no exame",
    "Grave dificuldade com tempo; em geral desorientado no tempo, às vezes no espaço",
    "Orientado apenas quanto à própria pessoa"] },
  { key: "jul", label: "Julgamento e solução de problemas", opts: [0, 0.5, 1, 2, 3],
    como: "Explore o manejo de dinheiro e contas, como lida com imprevistos (um vazamento, um remédio que acabou) e a compreensão de semelhanças, diferenças e provérbios.",
    desc: [
    "Resolve bem os problemas do dia a dia; bom julgamento",
    "Leve prejuízo na solução de problemas, semelhanças e diferenças",
    "Dificuldade moderada; julgamento social geralmente mantido",
    "Grave prejuízo; julgamento social geralmente comprometido",
    "Incapaz de fazer julgamentos ou resolver problemas"] },
  { key: "com", label: "Relações comunitárias", opts: [0, 0.5, 1, 2, 3],
    como: "Pergunte sobre trabalho, compras, banco, dirigir e compromissos fora de casa — e se alguém de fora da família perceberia algo errado num encontro casual.",
    desc: [
    "Independente no trabalho, compras e finanças",
    "Leve dificuldade nessas atividades",
    "Sem independência, mas participa de algumas; normal à inspeção casual",
    "Sem independência fora de casa; aparenta bem para ser levado a atividades",
    "Sem independência; aparenta doente demais para sair de casa"] },
  { key: "lar", label: "Lar e passatempos", opts: [0, 0.5, 1, 2, 3],
    como: "Pergunte sobre tarefas domésticas, cozinhar, uso de aparelhos, leitura e hobbies: o que ainda faz sozinho, o que simplificou e o que abandonou.",
    desc: [
    "Vida no lar, hobbies e interesses bem mantidos",
    "Vida no lar e interesses levemente comprometidos",
    "Comprometimento leve mas definido; hobbies/tarefas difíceis abandonados",
    "Só tarefas simples preservadas; interesses muito restritos",
    "Nenhuma função significativa no lar"] },
  { key: "cui", label: "Cuidados pessoais", opts: [0, 1, 2, 3],
    como: "Verifique vestir-se, higiene, banho e alimentação: se precisa ser lembrado, se precisa de ajuda e se há incontinência. Único domínio sem a opção 0,5.",
    desc: [
    "Totalmente capaz de se cuidar",
    "Precisa ser estimulado",
    "Precisa de ajuda para vestir-se, higiene e cuidados pessoais",
    "Necessita muita ajuda; frequentemente incontinente"] },
];
export function mode(arr, m) {
  const c = {}; arr.forEach((v) => (c[v] = (c[v] || 0) + 1));
  let best = arr[0], bc = 0;
  Object.keys(c).forEach((k) => { const v = parseFloat(k); if (c[k] > bc || (c[k] === bc && Math.abs(v - m) < Math.abs(best - m))) { best = v; bc = c[k]; } });
  return best;
}
export function globalCDR(m, sec) {
  const cnt = (p) => sec.filter(p).length;
  if (m === 0) return cnt((x) => x >= 0.5) >= 2 ? 0.5 : 0;
  if (m === 0.5) return cnt((x) => x >= 1) >= 3 ? 1 : 0.5;
  if (cnt((x) => x === m) >= 3) return m;
  const gr = sec.filter((x) => x > m), le = sec.filter((x) => x < m);
  if (gr.length >= 3 && gr.length > le.length) return mode(gr, m);
  if (le.length >= 3 && le.length > gr.length) return mode(le, m);
  return m;
}
export const cdrInterp = { 0: ["Sem demência", "teal"], 0.5: ["Demência questionável / CCL", "amber"], 1: ["Demência leve", "amber"], 2: ["Demência moderada", "red"], 3: ["Demência grave", "red"] };

export const cdrInicial = Object.fromEntries(cdrBoxes.map((b) => [b.key, 0]));

/* cálculo puro, reaproveitado pelo DOSUS */
export function cdrCalc(st) {
  const s = { ...cdrInicial, ...(st || {}) };
  const sec = ["ori", "jul", "com", "lar", "cui"].map((k) => s[k]);
  const global = globalCDR(s.mem, sec);
  const sob = cdrBoxes.reduce((a, b) => a + s[b.key], 0);
  const [label, tone] = cdrInterp[global] || ["—", "slate"];
  return { s, global, sob, label, tone };
}

export function CDR({ estado, setEstado }) {
  const init = cdrInicial;
  const [st, setS] = useEstado(init, estado, setEstado);
  const [ok, fire] = useCopyOk();
  const set = (k, v) => setS((p) => ({ ...init, ...p, [k]: v }));
  const { s, global, sob, label, tone } = cdrCalc(st);
  const text = `CDR (Clinical Dementia Rating): CDR Global ${global} — ${label}. Soma das caixas (CDR-SOB) ${sob}/18. ` +
    cdrBoxes.map((b) => `${b.label.toLowerCase()} ${s[b.key]}`).join(", ") + ".";
  return (
    <>
    <div className="space-y-4 print:hidden">
      <div className="grid grid-cols-2 gap-3">
        <ResultBar title="CDR Global" value={`${global}`} tone={tone} note={label} compact />
        <ResultBar title="CDR-SOB" value={`${sob}`} suffix="/18" tone="slate" note="Soma das caixas" compact />
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-700 mb-1">Escala geral:</p>
        <p>0 — sem demência · 0,5 — questionável/CCL · 1 — leve · 2 — moderada · 3 — grave. Toque em ⓘ para o significado de cada nota por domínio.</p>
      </div>
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs text-teal-900 space-y-1">
        <p className="font-semibold">Como aplicar</p>
        <p>Baseie-se na entrevista com o paciente <b>e com um informante confiável</b>, cada um em separado quando possível.</p>
        <p>Pontue cada domínio pela <b>mudança em relação ao nível prévio do próprio paciente</b>, não comparando com outras pessoas — e apenas o que for perda cognitiva: limitação por problema físico, visual ou motor não conta.</p>
        <p>Os seis domínios são pontuados de forma independente; a memória é a categoria primária no cálculo do CDR global.</p>
      </div>
      <div className="space-y-2">
        {cdrBoxes.map((b) => (
          <div key={b.key}>
            {b.primary && <div className="mb-1"><Badge>categoria primária</Badge></div>}
            <ScoredItem label={b.label} bold value={s[b.key]} options={b.opts} desc={b.desc} hint={b.como} onChange={(v) => set(b.key, v)} />
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">CDR Global calculado pelo algoritmo da Washington University. Confira conforme seu julgamento clínico.</p>
      <CopyBlock text={text} ok={ok} onCopy={() => fire(text)} onReset={() => setS(init)} />
      <BotaoImprimir />
    </div>

    {/* ficha para impressão / PDF */}
    <div className="hidden print:block text-black">
      <FichaCabecalho titulo="Escala CDR (Clinical Dementia Rating)"
        extra={<div><Campo rot="Escore final categórico" valor={`CDR ${String(global).replace(".", ",")} — ${label}`} w="230px" /></div>} />
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr>
            <th className="border border-black px-1 py-1 text-left w-36">Domínio</th>
            {[0, 0.5, 1, 2, 3].map((n) => (
              <th key={n} className="border border-black px-1 py-1 text-center">CDR {String(n).replace(".", ",")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cdrBoxes.map((b) => (
            <tr key={b.key}>
              <td className="border border-black px-1 py-1 font-bold align-middle">{b.label}</td>
              {[0, 0.5, 1, 2, 3].map((n) => {
                const i = b.opts.indexOf(n);
                const vazio = i === -1;
                const sel = s[b.key] === n;
                return (
                  <td key={n} className={"border border-black px-1 py-1 align-top " + (vazio ? "bg-neutral-200" : sel ? "bg-neutral-300 font-bold" : "")}>
                    {vazio ? "" : <><span className="mr-1">{sel ? "■" : "□"}</span>{b.desc[i]}</>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px]">
        <b>CDR Global:</b> {String(global).replace(".", ",")} — {label}. <b>Soma das caixas (CDR-SOB):</b> {String(sob).replace(".", ",")}/18.
      </p>
      <p className="mt-1 text-[10px]">
        Pontuação por domínio: {cdrBoxes.map((b) => `${b.label.toLowerCase()} ${String(s[b.key]).replace(".", ",")}`).join(", ")}.
        CDR global pelo algoritmo da Washington University.
      </p>
      <FichaRodape />
    </div>
    </>
  );
}
