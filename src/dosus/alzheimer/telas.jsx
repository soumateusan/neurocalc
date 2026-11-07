import { useState } from "react";
import { Plus, Trash2, ExternalLink, CheckCircle2, Circle, AlertTriangle, MapPin } from "lucide-react";
import { Txt, Escolha, Marca, Cartao, TextoPronto, Imprimir, Faltando, fmt } from "../comum.jsx";
import { cids, apresentacoes, familias, esquemas, exames, examesComplementares, criterios, avaliaCriterio, documentos, unidades, LINK_SESAB, situacaoExame } from "./dados.js";
import { idadeDe, anosParaEscIdx } from "./processo.js";
import { textoReceita } from "./textos.js";
import { meemCutoffs } from "../../shared/meem.jsx";

const v = (n) => String(n).replace(".", ",");

/* ================= VISÃO GERAL: o que pedir + elegibilidade ================= */
export function Visao({ pac, d, der, ir }) {
  return (
    <div className="space-y-4">
      <Cartao titulo="Elegibilidade pelos escores (PCDT)"
        sub={der.meemAplicado && d.cdrAplicado && der.escBaixa != null
          ? `MEEM ${der.meem.total}/30 · CDR ${v(der.cdr.global)} · escolaridade ${der.escBaixa ? "≤ 4 anos" : "> 4 anos"}`
          : "Aplique o MEEM e o CDR e informe a escolaridade para conferir automaticamente."}>
        <div className="space-y-2">
          {criterios.map((c) => {
            const pronto = der.meemAplicado && d.cdrAplicado && der.escBaixa != null;
            const r = pronto ? avaliaCriterio(c, der.meem.total, der.escBaixa, der.cdr.global) : null;
            const escolhido = der.crit === c.id;
            return (
              <div key={c.id} className={"rounded-lg border p-3 text-sm " + (r?.ok ? "border-teal-300 bg-teal-50" : escolhido && r ? "border-amber-300 bg-amber-50" : "border-slate-200")}>
                <div className="flex items-start gap-2">
                  {r ? (r.ok ? <CheckCircle2 size={17} className="text-teal-600 shrink-0 mt-0.5" /> : <AlertTriangle size={17} className="text-amber-500 shrink-0 mt-0.5" />)
                     : <Circle size={17} className="text-slate-300 shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800">{c.nome}{escolhido && <span className="ml-2 text-[11px] font-semibold text-teal-700 bg-white border border-teal-200 rounded-full px-2 py-0.5">prescrito</span>}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      MEEM {c.alto[0]}–{c.alto[1]} (&gt; 4 anos de estudo) ou {c.baixo[0]}–{c.baixo[1]} (≤ 4 anos) · CDR {c.cdr.join(" ou ")}
                    </div>
                    {r && !r.ok && (
                      <div className="text-xs text-amber-700 mt-1">
                        {!r.meemOk && `MEEM ${der.meem.total} fora de ${r.faixa[0]}–${r.faixa[1]}. `}
                        {!r.cdrOk && `CDR ${v(der.cdr.global)} não é ${c.cdr.join(" ou ")}.`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Cartao>

      <Cartao titulo="Documentos necessários" sub="Marcados em tempo real conforme você preenche. Toque para ir ao documento.">
        <div className="space-y-1.5">
          {documentos.map((doc) => {
            const c = der.checklist.find((x) => x.id === doc.id) || der.checklist.find((x) => doc.id === "meem" && x.id === "meem");
            return (
              <button key={doc.id} onClick={() => c?.sec && ir(c.sec)}
                className="w-full flex items-start gap-2 text-left rounded-lg px-2 py-1.5 hover:bg-slate-50">
                {c?.ok ? <CheckCircle2 size={16} className="text-teal-600 shrink-0 mt-0.5" /> : <Circle size={16} className="text-slate-300 shrink-0 mt-0.5" />}
                <span className="text-sm text-slate-700">{doc.nome}{doc.nota && <span className="block text-xs text-slate-400">{doc.nota}</span>}</span>
              </button>
            );
          })}
        </div>
      </Cartao>

      <Cartao titulo="Exames para abertura do processo">
        <div className="text-sm text-slate-700 space-y-2">
          <p><b>Todos os medicamentos:</b> laudo de TC ou RM de encéfalo (validade indeterminada).</p>
          <p><b>Galantamina, também:</b> creatinina, ALT/TGP e AST/TGO (validade 3 meses).</p>
          <p><b>Memantina, também:</b> creatinina ou TFG (validade 3 meses).</p>
          <p className="text-xs text-slate-500">Complementares, a critério médico (PCDT): hemograma, sódio, potássio, cálcio, glicose, creatinina, ureia, TSH, B12 e ácido fólico, AST/TGO, ALT/TGP (3 meses); sífilis e HIV (12 meses).</p>
          <button onClick={() => ir("exames")} className="text-xs font-semibold text-teal-700 hover:underline">Registrar exames e datas →</button>
        </div>
      </Cartao>

      <Cartao titulo="Monitoramento e renovação">
        <div className="text-sm text-slate-700 space-y-2">
          <p><b>MEEM e CDR:</b> ao final de 3–4 meses do início e depois a cada 6 meses. <b>Galantamina:</b> creatinina, TGO e TGP a critério médico.</p>
          <p><b>LME:</b> renovar semestralmente.</p>
          <p><b>Troca de medicamento ou aumento de dose:</b> avaliação na unidade responsável pela avaliação inicial, por médico especialista se previsto.</p>
          <p><b>Continuidade sem troca nem aumento de dose:</b> avaliação na unidade de cadastro.</p>
        </div>
      </Cartao>

      <Cartao titulo="Unidades de referência (Bahia)">
        <div className="space-y-3">
          {unidades.map((u) => (
            <div key={u.nome} className="text-sm text-slate-700 flex gap-2">
              <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{u.regiao}</div>
                <div className="font-semibold">{u.nome}</div>
                {u.end && <div className="text-xs text-slate-500">{u.end}</div>}
                {u.tel && <div className="text-xs text-slate-500">Tel.: {u.tel} · {u.horario}</div>}
                {u.email && <div className="text-xs text-slate-500">{u.email}</div>}
              </div>
            </div>
          ))}
        </div>
      </Cartao>

      <a href={LINK_SESAB} target="_blank" rel="noreferrer"
        className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-teal-700">
        <ExternalLink size={13} /> Página da SESAB — Doença de Alzheimer (PCDT, fluxo de acesso, SIGTAP)
      </a>
      {pac.nome === "" && <p className="text-center text-xs text-slate-400">Comece pela aba <button className="font-semibold text-teal-700" onClick={() => ir("paciente")}>Paciente e história</button>.</p>}
    </div>
  );
}

/* ================= PACIENTE E HISTÓRIA CLÍNICA ================= */
export function Paciente({ pac, upP, d, up }) {
  const idade = idadeDe(pac);
  const setEsc = (val) => {
    upP("escolaridade", val);
    up("meem", { ...d.meem, escIdx: anosParaEscIdx(val) });
  };
  return (
    <div className="space-y-4">
      <Cartao titulo="Solicitação">
        <div className="space-y-3">
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">Tipo de solicitação</span>
            <Escolha valor={d.tipo} onChange={(x) => up("tipo", x || "inicio")} opcoes={[["inicio", "Início de tratamento"], ["continuidade", "Continuidade (renovação)"], ["troca", "Troca de medicamento / aumento de dose"]]} />
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">CID-10 <span className="text-rose-500">*</span></span>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {cids.map((c) => (
                <Marca key={c.cod} checked={d.cid === c.cod} onToggle={() => up("cid", d.cid === c.cod ? "" : c.cod)}>
                  <b>{c.cod}</b> {c.desc}
                </Marca>
              ))}
            </div>
          </div>
        </div>
      </Cartao>

      <Cartao titulo="Identificação do paciente" sub="Fica salva no arquivo e preenche automaticamente todos os documentos.">
        <div className="grid gap-3 sm:grid-cols-6">
          <Txt className="sm:col-span-6" rot="Nome completo" obrig valor={pac.nome} onChange={(x) => upP("nome", x)} />
          <Txt className="sm:col-span-6" rot="Nome da mãe" obrig valor={pac.mae} onChange={(x) => upP("mae", x)} />
          <Txt className="sm:col-span-2" rot="Nascimento" tipo="date" valor={pac.nascimento} onChange={(x) => upP("nascimento", x)} dica={idade ? `${idade} anos` : ""} />
          {!pac.nascimento && <Txt className="sm:col-span-1" rot="Idade" tipo="number" valor={pac.idade} onChange={(x) => upP("idade", x)} />}
          <div className={pac.nascimento ? "sm:col-span-4" : "sm:col-span-3"}>
            <span className="block text-[11px] text-slate-500 mb-1">Sexo</span>
            <Escolha valor={pac.sexo} onChange={(x) => upP("sexo", x || "")} opcoes={[["F", "Feminino"], ["M", "Masculino"]]} />
          </div>
          <Txt className="sm:col-span-3" rot="CPF" valor={pac.cpf} onChange={(x) => upP("cpf", x)} />
          <Txt className="sm:col-span-3" rot="Cartão SUS (CNS)" valor={pac.cns} onChange={(x) => upP("cns", x)} />
          <Txt className="sm:col-span-2" rot="Peso (kg)" obrig tipo="number" valor={pac.peso} onChange={(x) => upP("peso", x)} />
          <Txt className="sm:col-span-2" rot="Altura (cm)" obrig tipo="number" valor={pac.altura} onChange={(x) => upP("altura", x)} />
          <Txt className="sm:col-span-2" rot="Escolaridade (anos de estudo)" obrig tipo="number" min={0} valor={pac.escolaridade} onChange={setEsc}
            dica={pac.escolaridade !== "" ? (Number(pac.escolaridade) <= 4 ? "≤ 4 anos — faixas de baixa escolaridade" : "> 4 anos") + ` · corte MEEM ${meemCutoffs[anosParaEscIdx(pac.escolaridade)][1]}` : ""} />
          <Txt className="sm:col-span-3" rot="Telefone 1" valor={pac.tel1} onChange={(x) => upP("tel1", x)} />
          <Txt className="sm:col-span-3" rot="Telefone 2" valor={pac.tel2} onChange={(x) => upP("tel2", x)} />
          <Txt className="sm:col-span-6" rot="E-mail" tipo="email" valor={pac.email} onChange={(x) => upP("email", x)} />
          <div className="sm:col-span-6">
            <span className="block text-[11px] text-slate-500 mb-1">Raça/cor (autodeclarada)</span>
            <Escolha valor={pac.raca} onChange={(x) => upP("raca", x || "")} opcoes={[["branca", "Branca"], ["preta", "Preta"], ["parda", "Parda"], ["amarela", "Amarela"], ["indigena", "Indígena"]]} />
          </div>
          {pac.raca === "indigena" && <Txt className="sm:col-span-6" rot="Etnia" valor={pac.etnia} onChange={(x) => upP("etnia", x)} />}
        </div>
      </Cartao>

      <Cartao titulo="Capacidade e responsável legal" sub="LME (campo 13) e Termo de Esclarecimento.">
        <div className="space-y-3">
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">Paciente considerado incapaz (arts. 3º e 4º do Código Civil)?</span>
            <Escolha valor={pac.incapaz} onChange={(x) => upP("incapaz", !!x)} opcoes={[[false, "Não"], [true, "Sim"]]} />
          </div>
          <div className="grid gap-3 sm:grid-cols-6">
            <Txt className="sm:col-span-3" rot={`Responsável legal${pac.incapaz ? " *" : ""}`} valor={pac.responsavel} onChange={(x) => upP("responsavel", x)} />
            <Txt className="sm:col-span-2" rot="Doc. de identidade do responsável" valor={pac.respDoc} onChange={(x) => upP("respDoc", x)} />
            <Txt className="sm:col-span-1" rot="Parentesco" valor={pac.respParentesco} onChange={(x) => upP("respParentesco", x)} />
          </div>
        </div>
      </Cartao>

      <Cartao titulo="História clínica" sub="Alimenta a anamnese do LME e o relatório médico.">
        <div className="grid gap-3">
          <Txt rot="Início dos sintomas" ph="ex.: há cerca de 3 anos" valor={d.hist.inicio} onChange={(x) => up("hist.inicio", x)} />
          <Txt area linhas={3} rot="Sintomas / queixas cognitivas" ph="ex.: esquecimento de fatos recentes, repetição de perguntas, desorientação em trajetos conhecidos"
            valor={d.hist.queixas} onChange={(x) => up("hist.queixas", x)} />
          <Txt area linhas={2} rot="Repercussão funcional" ph="ex.: deixou de administrar as finanças e precisa de supervisão para medicações"
            valor={d.hist.funcional} onChange={(x) => up("hist.funcional", x)} />
          <div className="grid gap-3 sm:grid-cols-[auto_10rem_1fr] items-end">
            <div>
              <span className="block text-[11px] text-slate-500 mb-1">Neuroimagem</span>
              <Escolha valor={d.hist.neuroTipo} onChange={(x) => up("hist.neuroTipo", x || "RM")} opcoes={[["RM", "RM"], ["TC", "TC"]]} />
            </div>
            <Txt rot="Data do exame" tipo="date" valor={d.hist.neuroData} onChange={(x) => up("hist.neuroData", x)} />
            <Txt rot="Achados" ph="ex.: atrofia hipocampal bilateral, sem lesões vasculares significativas" valor={d.hist.neuroLaudo} onChange={(x) => up("hist.neuroLaudo", x)} />
          </div>
          <Txt area linhas={2} rot="Comorbidades" valor={d.hist.comorbidades} onChange={(x) => up("hist.comorbidades", x)} />
          <Txt area linhas={2} rot="Medicamentos em uso" valor={d.hist.medicamentos} onChange={(x) => up("hist.medicamentos", x)} />
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">Realizou tratamento prévio ou está em tratamento da doença? <span className="text-rose-500">*</span></span>
            <Escolha valor={d.hist.tratPrevio} onChange={(x) => up("hist.tratPrevio", x)} opcoes={[[false, "Não"], [true, "Sim"]]} />
          </div>
          {d.hist.tratPrevio && <Txt rot="Relatar o tratamento" ph="ex.: donepezila 10 mg/dia desde 2024" valor={d.hist.tratTexto} onChange={(x) => up("hist.tratTexto", x)} />}
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">Em caso de continuidade, houve estabilização ou melhora clínica?</span>
            <Escolha valor={d.hist.estab} onChange={(x) => up("hist.estab", x)} opcoes={[["sim", "Sim"], ["nao", "Não"], ["na", "Não se aplica — início"]]} />
          </div>
        </div>
      </Cartao>
    </div>
  );
}

/* ================= EXAMES ================= */
function LinhaExame({ ex, reg, set, destaque }) {
  const sit = situacaoExame(ex, reg);
  const r = reg || {};
  return (
    <div className={"rounded-lg border p-2.5 " + (destaque ? (sit.ok ? "border-teal-200 bg-teal-50/40" : "border-amber-200 bg-amber-50/40") : "border-slate-200")}>
      <div className="flex items-start gap-2">
        <div className="w-6 pt-1"><input type="checkbox" checked={!!r.feito} onChange={(e) => set({ ...r, feito: e.target.checked })} className="w-4 h-4 accent-teal-600" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="text-sm font-semibold text-slate-700">{ex.nome}</span>
            <span className={"text-[11px] " + (sit.ok ? "text-teal-700" : r.feito ? "text-amber-700" : "text-slate-400")}>
              {ex.val ? `validade ${ex.val} meses · ` : ""}{sit.txt}
            </span>
          </div>
          {ex.nota && <div className="text-[11px] text-slate-400">{ex.nota}</div>}
          {r.feito && (
            <div className="mt-2 grid grid-cols-[9.5rem_1fr] gap-2">
              <input type="date" value={r.data || ""} onChange={(e) => set({ ...r, data: e.target.value })}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
              {ex.id !== "img" && <input placeholder="resultado (opcional)" value={r.resultado || ""} onChange={(e) => set({ ...r, resultado: e.target.value })}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Exames({ d, up, der }) {
  const set = (id) => (val) => up(`exames.${id}`, val);
  const obrig = exames.filter((e) => e.para === "todos" || e.para.some((f) => der.fams.includes(f)));
  const outros = exames.filter((e) => !obrig.includes(e));
  return (
    <div className="space-y-4">
      <Cartao titulo="Obrigatórios para o que foi prescrito" sub={der.fams.length ? `Medicamento(s): ${der.nomesFam.join(" + ")}` : "Escolha o medicamento na prescrição para ver os exames específicos."}>
        <div className="space-y-2">
          {obrig.map((e) => <LinhaExame key={e.id} ex={e} reg={d.exames[e.id]} set={set(e.id)} destaque />)}
        </div>
        {d.hist.neuroData && !d.exames.img?.feito && (
          <button onClick={() => up("exames.img", { feito: true, data: d.hist.neuroData })} className="mt-2 text-xs font-semibold text-teal-700 hover:underline">
            Usar a {d.hist.neuroTipo} de {fmt(d.hist.neuroData)} informada na história →
          </button>
        )}
      </Cartao>
      {outros.length > 0 && (
        <Cartao titulo="Específicos de outros medicamentos">
          <div className="space-y-2">{outros.map((e) => <LinhaExame key={e.id} ex={e} reg={d.exames[e.id]} set={set(e.id)} />)}</div>
        </Cartao>
      )}
      <Cartao titulo="Complementares (não obrigatórios)" sub="Podem ser solicitados conforme critério médico, de acordo com o PCDT.">
        <div className="space-y-2">{examesComplementares.map((e) => <LinhaExame key={e.id} ex={e} reg={d.exames[e.id]} set={set(e.id)} />)}</div>
      </Cartao>
    </div>
  );
}

/* ================= PRESCRIÇÃO ================= */
export function Prescricao({ pac, d, up, der, med }) {
  const [fam, setFam] = useState(null);
  const itens = d.presc.itens;
  const setItens = (n) => up("presc.itens", n);
  const addEsquema = (e) => {
    const outros = itens.filter((i) => apresentacoes[i.ap].fam !== e.fam);
    setItens([...outros, ...e.itens.map((i) => ({ ...i, meses: [...i.meses] }))].slice(0, 6));
    setFam(null);
  };
  const setItem = (k, campo, val) => setItens(itens.map((it, i) => (i === k ? { ...it, [campo]: val } : it)));
  const texto = textoReceita(pac, d, der, med);
  const temIAChE = der.fams.some((f) => familias[f].classe === "iache");
  return (
    <div className="space-y-4">
      <Cartao titulo="Escolher o tratamento" sub="Clique na droga e no esquema. Memantina pode ser associada a um inibidor da acetilcolinesterase.">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(familias).map(([k, f]) => (
            <button key={k} onClick={() => setFam(fam === k ? null : k)}
              className={"px-3 py-1.5 rounded-lg text-sm font-semibold border " + (fam === k ? "bg-teal-600 border-teal-600 text-white" : der.fams.includes(k) ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-white border-slate-200 text-slate-600 hover:border-teal-400")}>
              {f.nome}
            </button>
          ))}
        </div>
        {fam && (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {esquemas.filter((e) => e.fam === fam).map((e) => (
              <button key={e.id} onClick={() => addEsquema(e)}
                className="text-left rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-teal-400 hover:bg-teal-50">
                <Plus size={13} className="inline mr-1 text-teal-600" />{e.nome}
              </button>
            ))}
          </div>
        )}
        {fam === "mem" && !temIAChE && <p className="text-xs text-slate-400 mt-2">Sem inibidor associado = memantina em monoterapia (MEEM 5–11 / 3–7 e CDR 3).</p>}
        {fam && fam !== "mem" && temIAChE && !der.fams.includes(fam) && <p className="text-xs text-amber-600 mt-2">Ao escolher, o inibidor anterior será mantido — remova-o abaixo se for troca.</p>}
      </Cartao>

      {itens.length > 0 && (
        <Cartao titulo="Itens da prescrição e do LME" sub="Quantidade por mês = colunas do LME (renovação semestral). Edite se precisar.">
          <div className="space-y-3">
            {itens.map((it, k) => (
              <div key={k} className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <select value={it.ap} onChange={(e) => setItem(k, "ap", e.target.value)}
                    className="flex-1 min-w-0 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-semibold text-slate-800 bg-white">
                    {Object.entries(apresentacoes).map(([id, a]) => <option key={id} value={id}>{a.nome} — grupo {a.grupo}</option>)}
                  </select>
                  <button onClick={() => setItens(itens.filter((_, i) => i !== k))} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 size={16} /></button>
                </div>
                <textarea rows={2} value={it.pos} onChange={(e) => setItem(k, "pos", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700" />
                <div className="grid grid-cols-6 gap-1.5">
                  {it.meses.map((q, j) => (
                    <label key={j} className="block">
                      <span className="block text-[10px] text-slate-400 text-center">{j + 1}º mês</span>
                      <input type="number" min={0} value={q} onChange={(e) => setItem(k, "meses", it.meses.map((x, i) => (i === j ? Math.max(0, parseInt(e.target.value || "0", 10) || 0) : x)))}
                        className="w-full rounded-lg border border-slate-200 px-1 py-1 text-sm text-center" />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      )}

      <Cartao titulo="Prescrição pronta" direita={<input type="date" value={d.presc.data} onChange={(e) => up("presc.data", e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs" />}>
        <Faltando itens={der.faltaPresc} ok="Prescrição completa — copie para a prescrição eletrônica ou imprima." />
        <div className="mt-3 space-y-2">
          <TextoPronto texto={texto} linhas={12} />
          <Imprimir label="Imprimir receita" desab={!itens.length} />
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Confira a forma de receituário exigida pela legislação sanitária vigente (Lei 13.732/2018; Portaria SVS/MS 344/1998).</p>
      </Cartao>

      {/* receita impressa */}
      <div className="hidden print:block text-black text-[12px]">
        <div className="text-center border-b border-black pb-2 mb-4">
          <div className="font-bold text-[14px]">{med.estabelecimento || "RECEITUÁRIO"}</div>
          {med.endereco && <div className="text-[10px]">{med.endereco}</div>}
        </div>
        <pre className="whitespace-pre-wrap font-sans leading-relaxed">{texto}</pre>
        <div className="mt-16 w-72 mx-auto border-t border-black text-center text-[10px] pt-1">Assinatura e carimbo</div>
      </div>
    </div>
  );
}
