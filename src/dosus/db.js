/* Armazenamento local (IndexedDB) — os dados ficam só neste aparelho/navegador.
   pacientes: identificação, reaproveitada em todas as patologias
   processos: um por solicitação (patologia + data), com tudo o que foi preenchido
   config:    perfil do médico e preferências */

const NOME = "dosus-neuro";
const VERSAO = 1;
let dbp = null;

function abrir() {
  if (dbp) return dbp;
  dbp = new Promise((ok, erro) => {
    const req = indexedDB.open(NOME, VERSAO);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("pacientes")) db.createObjectStore("pacientes", { keyPath: "id" });
      if (!db.objectStoreNames.contains("processos")) {
        const s = db.createObjectStore("processos", { keyPath: "id" });
        s.createIndex("pacienteId", "pacienteId");
      }
      if (!db.objectStoreNames.contains("config")) db.createObjectStore("config", { keyPath: "chave" });
    };
    req.onsuccess = () => ok(req.result);
    req.onerror = () => erro(req.error);
  });
  return dbp;
}

async function tx(store, modo, fn) {
  const db = await abrir();
  return new Promise((ok, erro) => {
    const t = db.transaction(store, modo);
    const s = t.objectStore(store);
    const r = fn(s);
    t.oncomplete = () => ok(r && "result" in r ? r.result : undefined);
    t.onerror = () => erro(t.error);
    t.onabort = () => erro(t.error);
  });
}

export const novoId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

export const db = {
  todos: (store) => tx(store, "readonly", (s) => s.getAll()),
  pegar: (store, id) => tx(store, "readonly", (s) => s.get(id)),
  salvar: (store, obj) => tx(store, "readwrite", (s) => s.put(obj)),
  apagar: (store, id) => tx(store, "readwrite", (s) => s.delete(id)),
  limpar: (store) => tx(store, "readwrite", (s) => s.clear()),
};

export async function lerConfig(chave, padrao) {
  try {
    const r = await db.pegar("config", chave);
    return r ? r.valor : padrao;
  } catch {
    return padrao;
  }
}
export const gravarConfig = (chave, valor) => db.salvar("config", { chave, valor });

export async function apagarPaciente(id) {
  const procs = (await db.todos("processos")).filter((p) => p.pacienteId === id);
  for (const p of procs) await db.apagar("processos", p.id);
  await db.apagar("pacientes", id);
}

/* cópia de segurança: um arquivo .json com tudo */
export async function exportarBackup() {
  const dados = {
    app: "DOSUS Neuro",
    versao: 1,
    exportadoEm: new Date().toISOString(),
    pacientes: await db.todos("pacientes"),
    processos: await db.todos("processos"),
    config: await db.todos("config"),
  };
  const blob = new Blob([JSON.stringify(dados, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `dosus-neuro-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* importa mesclando: registros com o mesmo id são substituídos pela versão mais recente */
export async function importarBackup(arquivo) {
  const dados = JSON.parse(await arquivo.text());
  if (dados.app !== "DOSUS Neuro") throw new Error("Arquivo não é um backup do DOSUS Neuro.");
  let n = 0;
  for (const store of ["pacientes", "processos"]) {
    for (const obj of dados[store] || []) {
      const atual = await db.pegar(store, obj.id);
      if (!atual || (obj.atualizadoEm || "") >= (atual.atualizadoEm || "")) { await db.salvar(store, obj); n++; }
    }
  }
  for (const c of dados.config || []) await db.salvar("config", c);
  return n;
}
