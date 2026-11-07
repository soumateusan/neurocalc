import { useState } from "react";
import { FileDown, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { Txt, Escolha, Marca, Cartao, Aviso, TextoPronto, Imprimir, Faltando, CabecalhoSESAB, Lacuna, X, fmt } from "../comum.jsx";
import { apresentacoes, familias, acessoTxt, PORTARIA } from "./dados.js";
import { anamneseLME, textoRelatorio, cidDesc } from "./textos.js";
import { abrirPDF, LME_URL } from "../lme-util.js";

/* ================= LME ================= */
export function LME({ pac, d, up, der, med, irPerfil }) {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const auto = anamneseLME(pac, d, der);
  const anamnese = d.lme.anamneseEditada ? d.lme.anamnese : auto;
  const linhas = der.itens.map((i) => ({ lme: apresentacoes[i.ap].lme, meses: i.meses }));

  const gerar = async (baixar) => {
    setGerando(true); setErro("");
    try {
      const { gerarLME } = await import("../lme.js");
      const bytes = await gerarLME({
        cnes: med.cnes, estabelecimento: med.estabelecimento,
        nome: pac.nome, mae: pac.mae, peso: pac.peso, altura: pac.altura,
        meds: linhas, cid: d.cid, diagnostico: cidDesc(d.cid), anamnese,
        tratPrevio: d.hist.tratPrevio, tratTexto: d.hist.tratTexto,
        incapaz: pac.incapaz, responsavel: pac.responsavel,
        medico: med.nome, cnsMedico: med.cns, data: fmt(d.lme.data),
        preenchidoPor: d.lme.preenchidoPor, outroNome: d.lme.outroNome, outroCPF: d.lme.outroCPF,
        raca: pac.raca, etnia: pac.etnia, tel1: pac.tel1, tel2: pac.tel2,
        docTipo: d.lme.docTipo, docNumero: d.lme.docTipo === "CNS" ? pac.cns : pac.cpf, email: pac.email,
      });
      abrirPDF(bytes, `LME - ${pac.nome || "paciente"}.pdf`, baixar);
      up("lme.geradoEm", new Date().toISOString());
    } catch (e) {
      setErro(String(e.message || e));
    }
    setGerando(false);
  };

  const semPerfil = !med.nome || !med.cnes || !med.cns;
  return (
    <div className="space-y-4">
      <Faltando itens={der.faltaLME} ok="Todos os campos obrigatórios do LME estão preenchidos." />
      {semPerfil && <Aviso tom="slate">CNES, estabelecimento, nome e CNS do médico vêm do <button onClick={irPerfil} className="font-semibold text-teal-700 underline">perfil do médico</button> — preencha uma vez e vale para todos os pacientes.</Aviso>}

      <Cartao titulo="Medicamentos e quantidades" sub="Vêm da prescrição.">
        {linhas.length ? (
          <table className="w-full text-xs">
            <thead><tr className="text-slate-400"><th className="text-left font-medium pb-1">Medicamento</th>{[1, 2, 3, 4, 5, 6].map((m) => <th key={m} className="font-medium w-9">{m}º</th>)}</tr></thead>
            <tbody>
              {linhas.map((l, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="py-1.5 text-slate-700 pr-2">{l.lme}</td>
                  {l.meses.map((q, j) => <td key={j} className="text-center text-slate-600">{q || ""}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-slate-400">Nenhum medicamento escolhido ainda.</p>}
      </Cartao>

      <Cartao titulo="11 — Anamnese" direita={d.lme.anamneseEditada && (
        <button onClick={() => { up("lme.anamneseEditada", false); up("lme.anamnese", ""); }} className="flex items-center gap-1 text-xs text-teal-700 font-semibold"><RefreshCw size={12} /> refazer automática</button>
      )} sub={d.lme.anamneseEditada ? "Editada manualmente." : "Gerada automaticamente da história, MEEM, CDR e neuroimagem. Edite se quiser."}>
        <textarea rows={6} value={anamnese} onChange={(e) => { up("lme.anamnese", e.target.value); up("lme.anamneseEditada", true); }}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 leading-relaxed" />
        <p className={"text-[11px] mt-1 " + (anamnese.length > 900 ? "text-amber-600" : "text-slate-400")}>{anamnese.length} caracteres{anamnese.length > 900 ? " — texto longo, a fonte ficará pequena no PDF" : ""}</p>
      </Cartao>

      <Cartao titulo="Campos complementares">
        <div className="space-y-3">
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">18 — Campos abaixo preenchidos por</span>
            <Escolha valor={d.lme.preenchidoPor} onChange={(x) => up("lme.preenchidoPor", x || "medico")}
              opcoes={[["paciente", "Paciente"], ["mae", "Mãe"], ["responsavel", "Responsável"], ["medico", "Médico solicitante"], ["outro", "Outro"]]} />
          </div>
          {d.lme.preenchidoPor === "outro" && (
            <div className="grid sm:grid-cols-2 gap-3">
              <Txt rot="Nome" valor={d.lme.outroNome} onChange={(x) => up("lme.outroNome", x)} />
              <Txt rot="CPF" valor={d.lme.outroCPF} onChange={(x) => up("lme.outroCPF", x)} />
            </div>
          )}
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">21 — Documento do paciente informado</span>
            <Escolha valor={d.lme.docTipo} onChange={(x) => up("lme.docTipo", x || "CPF")} opcoes={[["CPF", `CPF ${pac.cpf ? `(${pac.cpf})` : "(não informado)"}`], ["CNS", `CNS ${pac.cns ? `(${pac.cns})` : "(não informado)"}`]]} />
          </div>
          <Txt rot="16 — Data da solicitação" tipo="date" valor={d.lme.data} onChange={(x) => up("lme.data", x)} className="max-w-[12rem]" />
          <p className="text-xs text-slate-400">Raça/cor, telefones e e-mail vêm da identificação do paciente; capacidade e responsável, do item "Capacidade".</p>
        </div>
      </Cartao>

      {erro && <Aviso tom="rose">{erro}</Aviso>}
      <div className="grid sm:grid-cols-2 gap-2">
        <button onClick={() => gerar(false)} disabled={gerando}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 disabled:opacity-50">
          {gerando ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />} Abrir LME preenchido
        </button>
        <button onClick={() => gerar(true)} disabled={gerando}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50">
          <FileDown size={16} /> Baixar PDF
        </button>
      </div>
      <p className="text-[11px] text-slate-400 text-center">
        O PDF gerado continua editável. {d.lme.geradoEm && `Último gerado em ${new Date(d.lme.geradoEm).toLocaleString("pt-BR")}. `}
        <a href={LME_URL} target="_blank" rel="noreferrer" className="underline">LME em branco</a>
      </p>
    </div>
  );
}

/* ================= TERMO DE ESCLARECIMENTO E RESPONSABILIDADE ================= */
export function Termo({ pac, d, up, der, med }) {
  const local = d.termo.local || med.cidade || "";
  const [ano, mes, dia] = (d.termo.data || "").split("-");
  const tem = (f) => der.fams.includes(f);
  return (
    <>
    <div className="space-y-4 print:hidden">
      <Faltando itens={der.faltaTER} ok="Termo pronto para imprimir e assinar (em duas vias)." />
      <Cartao titulo="Lacunas do termo" sub="Nome do paciente, médico, CRM e medicamento já vêm preenchidos.">
        <div className="space-y-3">
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">Autoriza o Ministério da Saúde e as Secretarias de Saúde a usarem informações do tratamento, assegurado o anonimato? <span className="text-rose-500">*</span></span>
            <Escolha valor={d.termo.autoriza} onChange={(x) => up("termo.autoriza", x)} opcoes={[["sim", "Sim"], ["nao", "Não"]]} />
          </div>
          <div>
            <span className="block text-[11px] text-slate-500 mb-1">Medicamento(s) do tratamento — da prescrição</span>
            <div className="flex flex-wrap gap-1.5 text-sm">
              {["don", "gal", "riv", "mem"].map((f) => (
                <span key={f} className={"px-2.5 py-1 rounded-lg border " + (tem(f) ? "bg-teal-50 border-teal-300 text-teal-800 font-semibold" : "border-slate-200 text-slate-400")}>{familias[f].termo}</span>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Txt rot="Local" ph={med.cidade || "cidade"} valor={d.termo.local} onChange={(x) => up("termo.local", x)} />
            <Txt rot="Data" tipo="date" valor={d.termo.data} onChange={(x) => up("termo.data", x)} />
          </div>
          {pac.incapaz && <p className="text-xs text-slate-500">Responsável legal: <b>{pac.responsavel || "—"}</b>{pac.respDoc && ` · doc. ${pac.respDoc}`} (editar em Paciente).</p>}
        </div>
      </Cartao>
      <Imprimir label="Gerar PDF / imprimir termo" />
    </div>

    <div className="hidden print:block text-black text-[11.5px] leading-[1.35]">
      <CabecalhoSESAB />
      <div className="text-center font-bold text-[12.5px] space-y-1 mb-3">
        <div>TERMO DE ESCLARECIMENTO E RESPONSABILIDADE</div>
        <div>DOENÇA DE ALZHEIMER</div>
        <div>Donepezila, Galantamina, Memantina, Rivastigmina</div>
      </div>
      <div className="text-justify space-y-0">
        <p>
          Eu, <Lacuna v={pac.nome} w="300px" /> (nome do [a] paciente), declaro ter sido informado(a) sobre benefícios, riscos,
          contraindicações e principais eventos adversos relacionados ao uso de donepezila, galantamina, memantina e rivastigmina indicados
          para o tratamento da <b>Doença de Alzheimer.</b> Os termos médicos foram explicados e todas as dúvidas foram esclarecidas pelo(a)
          médico(a) <Lacuna v={med.nome} w="280px" /> (nome do(a) médico(a) que prescreve). Assim, declaro que fui claramente informado(a) de que o
          medicamento que passo a receber pode trazer os seguintes benefícios: Redução na velocidade de progressão da doença. Melhora da
          memória e da atenção. Fui também informado(a) a respeito das seguintes contraindicações, potenciais efeitos adversos e riscos:
        </p>
        <p>
          Donepezila – insônia, náusea, vômitos, diarreia, anorexia, dispepsia, cãibras musculares e fadiga. Efeitos menos frequentes incluem
          cefaleia, sonolência, tontura, depressão, perda de peso, sonhos anormais, aumento da frequência urinária, síncope, bradicardia,
          artrite e equimoses. A donepezila deve ser usada com cautela em indivíduos com anormalidades supraventriculares da condução cardíaca,
          bloqueio de ramo ou naqueles em uso de fármacos que reduzam significativamente a frequência cardíaca, ou com história de convulsão,
          asma ou DPOC e com risco de úlcera péptica. Galantamina - náusea, vômitos, diarreia, anorexia, perda de peso, dor abdominal,
          dispepsia, flatulência, tontura, cefaleia, depressão, fadiga, insônia e sonolência. Efeitos menos frequentes: infecção do trato
          urinário, hematúria, incontinência, anemia, tremor, rinite e aumento da fosfatase alcalina.
        </p>
        <p>
          Memantina - cefaleia, cansaço e tontura. Efeitos menos frequentes incluem alucinações, alterações de marcha, anorexia, ansiedade,
          artralgia, bronquite, cistite, constipação, diarreia, confusão, dor lombar, edema periférico, hipertensão, hipertonia, infecção de
          trato respiratório, insônia, aumento da libido, náusea, queda, sonolência e vômitos.
        </p>
        <p>
          Rivastigmina - tontura, cefaleia, náusea, vômitos, diarreia, anorexia, fadiga, insônia, confusão e dor abdominal. Efeitos menos
          frequentes: depressão, ansiedade, sonolência, alucinações, síncope, hipertensão, dispepsia, constipação, flatulência, perda de peso,
          infecção do trato urinário, fraqueza, tremor, angina, úlcera gástrica ou duodenal e erupções cutâneas. Estou ciente de que este
          medicamento somente pode ser utilizado por mim, comprometendo-me a devolvê-lo caso não queira ou não possa utilizá-lo ou se o
          tratamento for interrompido. Sei também que continuarei a ser atendido (a), inclusive em caso de desistência do uso do medicamento.
        </p>
        <p>
          Autorizo o Ministério da Saúde e as Secretarias de Saúde a fazerem uso de informações relativas ao meu tratamento, desde que
          assegurado o anonimato. <X on={d.termo.autoriza === "sim"} /> sim <X on={d.termo.autoriza === "nao"} /> não
        </p>
        <p>Meu tratamento constará do seguinte medicamento:</p>
        <p><X on={tem("don")} /> Donepezila <X on={tem("gal")} /> Galantamina <X on={tem("riv")} /> Rivastigmina <X on={tem("mem")} /> Memantina</p>
      </div>

      <table className="w-full border-collapse border border-black mt-4 text-[11.5px]">
        <tbody>
          <tr><td className="border border-black px-2 py-1.5" colSpan={2}>Local: <b>{local}</b></td>
            <td className="border border-black px-2 py-1.5 w-56">Data: <b>{dia || "   "} / {mes || "   "} / {ano || "     "}</b></td></tr>
          <tr><td className="border border-black px-2 py-1.5" colSpan={3}>Nome do paciente: <b>{pac.nome}</b></td></tr>
          <tr><td className="border border-black px-2 py-1.5" colSpan={2}>Nome do responsável legal: <b>{pac.incapaz || pac.responsavel ? pac.responsavel : ""}</b></td>
            <td className="border border-black px-2 py-1.5">Doc. Ident.: <b>{pac.incapaz || pac.responsavel ? pac.respDoc : ""}</b></td></tr>
          <tr><td className="border border-black px-2 pt-12 pb-1 text-center" colSpan={3}>
            <div className="w-80 mx-auto border-t border-black pt-1">Assinatura do paciente ou do responsável legal</div></td></tr>
          <tr><td className="border border-black px-2 py-1.5">Médico Responsável: <b>{med.nome}</b></td>
            <td className="border border-black px-2 py-1.5 w-40">CRM: <b>{med.crm}</b></td>
            <td className="border border-black px-2 py-1.5">UF: <b>{med.uf}</b></td></tr>
          <tr><td className="border border-black px-2 pt-12 pb-2" colSpan={3}>Assinatura e carimbo do médico: <span className="inline-block w-96 border-b border-black" /></td></tr>
        </tbody>
      </table>
      <p className="mt-1 text-[8.5px] font-bold">
        Observação: Este Termo é obrigatório ao se solicitar o fornecimento de medicamento do Componente Especializado da Assistência
        Farmacêutica e deverá ser preenchido em duas vias: uma será arquivada na farmácia, e a outra, entregue ao usuário ou ao seu responsável legal.
      </p>
    </div>
    </>
  );
}

/* ================= FORMULÁRIO DE ACESSO ================= */
function Lista({ itens, marcados, onToggle, tom }) {
  return (
    <div className="space-y-1.5">
      {itens.map((t, i) => <Marca key={i} tom={tom} checked={!!marcados[i]} onToggle={() => onToggle(i)}>{t}</Marca>)}
    </div>
  );
}

export function Acesso({ pac, d, up, der, med }) {
  const a = d.acesso;
  const tog = (campo, i) => up(`acesso.${campo}`, a[campo].map((x, k) => (k === i ? !x : x)));
  const [ano, mes, dia] = (a.data || "").split("-");
  const temIAChE = der.fams.some((f) => familias[f].classe === "iache");
  const tudoA = () => up("acesso.a", [true, true, true]);
  return (
    <>
    <div className="space-y-4 print:hidden">
      <Faltando itens={der.faltaAcesso} ok="Formulário completo — gere o PDF para imprimir e assinar." />
      {der.contraind && <Aviso tom="rose">Há critério de exclusão ou contraindicação marcado — a solicitação não deve ser feita para esse medicamento.</Aviso>}

      <Cartao titulo="1. Critérios para demência devida à doença de Alzheimer"
        direita={!a.a.every(Boolean) && <button onClick={tudoA} className="text-xs font-semibold text-teal-700">marcar todos de A</button>}>
        <p className="text-xs font-semibold text-slate-600 mb-1.5">A. Critérios obrigatórios — sintomas cognitivos ou comportamentais que:</p>
        <Lista itens={acessoTxt.a} marcados={a.a} onToggle={(i) => tog("a", i)} />
        <p className="text-xs font-semibold text-slate-600 mt-3 mb-1.5">B. Características clínicas (uma ou mais):</p>
        <Lista itens={acessoTxt.b} marcados={a.b} onToggle={(i) => tog("b", i)} />
        {der.meemAplicado && !a.b[2] && <button onClick={() => tog("b", 2)} className="mt-1.5 text-xs text-teal-700 font-semibold">MEEM aplicado ({der.meem.total}/30) — marcar o item do déficit cognitivo →</button>}
      </Cartao>

      <Cartao titulo="2. Critérios de exclusão" sub="Assinalar os presentes.">
        <Lista tom="rose" itens={acessoTxt.excl} marcados={a.excl} onToggle={(i) => { tog("excl", i); up("acesso.exclNenhuma", false); }} />
        <div className="mt-1.5">
          <Marca checked={a.exclNenhuma} onToggle={() => { up("acesso.exclNenhuma", !a.exclNenhuma); if (!a.exclNenhuma) up("acesso.excl", a.excl.map(() => false)); }}>
            Paciente não apresenta nenhuma das condições citadas acima.
          </Marca>
        </div>
      </Cartao>

      <Cartao titulo="3. Tratamento medicamentoso — critérios de exclusão">
        <p className="text-xs font-semibold text-slate-600 mb-1.5">Para donepezila, galantamina, rivastigmina e memantina:</p>
        <Escolha valor={a.adesao} onChange={(x) => up("acesso.adesao", x)} opcoes={[["incapaz", "Incapacidade de adesão ao tratamento"], ["na", "Não se aplica"]]} />
        <p className="text-xs font-semibold text-slate-600 mt-3 mb-1.5">Para donepezila, galantamina e rivastigmina{!temIAChE && der.fams.length ? " (não prescritos — pode marcar \"nenhuma\")" : ""}:</p>
        <Lista tom="rose" itens={acessoTxt.iache} marcados={a.iache} onToggle={(i) => { tog("iache", i); up("acesso.iacheNenhuma", false); }} />
        <div className="mt-1.5">
          <Marca checked={a.iacheNenhuma} onToggle={() => { up("acesso.iacheNenhuma", !a.iacheNenhuma); if (!a.iacheNenhuma) up("acesso.iache", a.iache.map(() => false)); }}>
            Paciente não apresenta nenhuma das condições citadas acima.
          </Marca>
        </div>
        <p className="text-xs font-semibold text-slate-600 mt-3 mb-1.5">Para galantamina:</p>
        <Escolha valor={a.gal} onChange={(x) => up("acesso.gal", x)} opcoes={[["sim", "Insuficiência hepática ou renal graves"], ["na", "Não se aplica"]]} />
        <p className="text-xs font-semibold text-slate-600 mt-3 mb-1.5">Para memantina:</p>
        <Escolha valor={a.mem} onChange={(x) => up("acesso.mem", x)} opcoes={[["sim", "Clearance de creatinina < 5 mL/min/1,73 m²"], ["na", "Não se aplica"]]} />
      </Cartao>

      <Cartao titulo="5. Informações complementares">
        <span className="block text-[11px] text-slate-500 mb-1">Em caso de continuidade do tratamento, houve estabilização ou melhora clínica?</span>
        <Escolha valor={d.hist.estab} onChange={(x) => up("hist.estab", x)} opcoes={[["sim", "Sim"], ["nao", "Não"], ["na", "Não se aplica – início do tratamento"]]} />
        <Txt className="mt-3" area linhas={3} rot="Observações / justificativa clínica, quando necessárias" valor={a.obs} onChange={(x) => up("acesso.obs", x)} />
        <Txt className="mt-3 max-w-[12rem]" rot="Data do preenchimento" tipo="date" valor={a.data} onChange={(x) => up("acesso.data", x)} />
      </Cartao>
      <Imprimir label="Gerar PDF / imprimir formulário" />
    </div>

    {/* impressão — 2 páginas, como o formulário oficial */}
    <div className="hidden print:block text-black text-[11.5px] leading-[1.35]">
      <CabecalhoSESAB />
      <div className="text-center font-bold text-[12.5px]">FORMULÁRIO DE ACESSO - DOENÇA DE ALZHEIMER</div>
      <div className="text-center font-bold text-[10.5px] mb-4">{PORTARIA}</div>
      <div className="space-y-1.5 mb-4">
        <div>Nome do Paciente: <Lacuna v={pac.nome} w="440px" /></div>
        <div>Médico Responsável: <Lacuna v={med.nome} w="250px" /> CRM: <Lacuna v={med.crm} w="80px" /> UF: <Lacuna v={med.uf} w="35px" /></div>
        <div>CID-10: <Lacuna v={d.cid} w="90px" /> Data do preenchimento: <b>{dia || "  "} / {mes || "  "} / {ano || "    "}</b></div>
      </div>
      <p className="font-bold mt-3">1. CRITÉRIOS PARA DEMÊNCIA DEVIDA À DOENÇA DE ALZHEIMER:</p>
      <p className="font-bold mt-1.5">A. Critérios obrigatórios:</p>
      <p>O(a) paciente apresenta sintomas cognitivos ou comportamentais (neuropsiquiátricos) que:</p>
      {acessoTxt.a.map((t, i) => <p key={i}><X on={a.a[i]} /> {t}</p>)}
      <p className="font-bold mt-1.5">B. Características clínicas:</p>
      <p>Adicionalmente aos critérios anteriores, o(a) paciente apresenta uma ou mais das seguintes características:</p>
      {acessoTxt.b.map((t, i) => <p key={i}><X on={a.b[i]} /> {t}</p>)}
      <p className="font-bold mt-3">2. CRITÉRIOS DE EXCLUSÃO</p>
      <p>Assinalar os critérios presentes:</p>
      {acessoTxt.excl.map((t, i) => <p key={i}><X on={a.excl[i]} /> {t}</p>)}
      <p><X on={a.exclNenhuma} /> Paciente não apresenta nenhuma das condições citadas acima.</p>
      <p className="font-bold mt-3">3. TRATAMENTO MEDICAMENTOSO</p>
      <p className="font-bold">Critérios de exclusão:</p>
      <p>Para donepezila, galantamina, rivastigmina e memantina:</p>
      <p><X on={a.adesao === "incapaz"} /> Identificação de incapacidade de adesão ao tratamento.</p>
      <p><X on={a.adesao === "na"} /> Não se aplica.</p>

      <div style={{ breakBefore: "page" }} />
      <CabecalhoSESAB />
      <p>Para donepezila, galantamina e rivastigmina:</p>
      {acessoTxt.iache.map((t, i) => <p key={i}><X on={a.iache[i]} /> {t}</p>)}
      <p><X on={a.iacheNenhuma} /> Paciente não apresenta nenhuma das condições citadas acima.</p>
      <p className="mt-2">Para galantamina:</p>
      <p><X on={a.gal === "sim"} /> Insuficiência hepática ou renal graves.</p>
      <p><X on={a.gal === "na"} /> Não se aplica.</p>
      <p className="mt-2">Para memantina:</p>
      <p><X on={a.mem === "sim"} /> Clearance de creatinina inferior a 5 mL/minuto/1,73 m².</p>
      <p><X on={a.mem === "na"} /> Não se aplica</p>
      <p className="font-bold mt-4">5. INFORMAÇÕES COMPLEMENTARES</p>
      <p>Em caso de continuidade do tratamento, houve estabilização ou melhora clínica?</p>
      <p><X on={d.hist.estab === "sim"} /> Sim</p>
      <p><X on={d.hist.estab === "nao"} /> Não</p>
      <p><X on={d.hist.estab === "na"} /> Não se aplica – início do tratamento</p>
      <p className="mt-4">Observações/justificativa clínica, quando necessárias:</p>
      <div className="min-h-[90px] border-b border-black whitespace-pre-wrap leading-[1.9]" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 21px, #000 21px, #000 22px)" }}>{a.obs}</div>
      <p className="mt-8 text-justify">
        Declaro, para os devidos fins, que o(a) paciente não apresenta critérios de exclusão, não apresenta contraindicações ao uso do
        medicamento solicitado e satisfaz os critérios de inclusão, conforme {PORTARIA}.
      </p>
      <div className="mt-20 w-80 mx-auto border-t border-black text-center pt-1">Carimbo e assinatura do médico</div>
    </div>
    </>
  );
}

/* ================= RELATÓRIO MÉDICO ================= */
export function Relatorio({ pac, d, up, der, med }) {
  const texto = textoRelatorio(pac, d, der, med);
  const usado = () => up("rel.usadoEm", new Date().toISOString());
  return (
    <>
    <div className="space-y-4 print:hidden">
      <Aviso tom="slate">O relatório substitui o formulário de acesso. Ele reúne CID-10, história clínica, tratamento realizado, critérios de inclusão e ausência de exclusão e contraindicação — puxados das outras abas (inclusive dos itens marcados no formulário de acesso).</Aviso>
      <Faltando itens={der.faltaRel.filter((f) => !f.startsWith("copiar"))} ok="Relatório com todos os elementos exigidos." />
      <Txt area linhas={3} rot="Texto adicional (opcional, entra antes da assinatura)" valor={d.rel.extra} onChange={(x) => up("rel.extra", x)} />
      <TextoPronto texto={texto} linhas={22} onUsado={usado} />
      <Imprimir label="Imprimir relatório" onClick={usado} />
      {d.rel.usadoEm && <p className="text-[11px] text-slate-400 text-center">Usado em {new Date(d.rel.usadoEm).toLocaleString("pt-BR")}.</p>}
    </div>
    <div className="hidden print:block text-black text-[12px]">
      {(med.estabelecimento || med.endereco) && (
        <div className="text-center border-b border-black pb-2 mb-4">
          <div className="font-bold text-[13px]">{med.estabelecimento}</div>
          {med.endereco && <div className="text-[10px]">{med.endereco}</div>}
        </div>
      )}
      <pre className="whitespace-pre-wrap font-sans leading-relaxed">{texto}</pre>
      <div className="mt-16 w-80 mx-auto border-t border-black text-center text-[10px] pt-1">Carimbo e assinatura do médico</div>
    </div>
    </>
  );
}
