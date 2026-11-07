# NeuroCalc + DOSUS Neuro

Dois apps no mesmo projeto (React + Vite + Tailwind), que funcionam **offline** depois da primeira visita:

- **NeuroCalc** (`/`) — escalas neurológicas (MEEM, CDR, BBRC, UPDRS, PHQ-9…).
- **DOSUS Neuro** (`/dosus.html`) — preenchimento automatizado de documentos do SUS para neurologia.

```bash
npm install
npm run dev      # desenvolvimento: http://localhost:5173 e /dosus.html
npm run build    # gera dist/ (com service worker para uso offline)
npm run preview  # testa o build
```

## DOSUS Neuro

Menu lateral com as patologias; cada uma abre suas etapas. Começamos pela **Doença de Alzheimer**
(PCDT — Portaria Conjunta SAES/SCTIE nº 27/2025, orientações da SESAB/BA):

- **O que pedir / elegibilidade** — documentos, exames com validade, critérios de MEEM/CDR por medicamento, monitoramento, renovação e unidades de referência.
- **Paciente e história** — identificação, CID-10, capacidade/responsável e história clínica (alimentam todos os documentos).
- **MEEM** e **CDR** — os mesmos do NeuroCalc, com impressão.
- **Exames** — obrigatórios conforme o medicamento, com alerta de validade vencida.
- **Prescrição** — esquemas clicáveis (titulação/manutenção) → texto para a prescrição eletrônica e quantidades do LME.
- **LME** — preenche o PDF oficial (`public/docs/lme-2026.pdf`) no próprio navegador; o PDF gerado continua editável.
- **Termo de esclarecimento**, **Formulário de acesso** — modelos da SESAB com cabeçalho e brasão, impressos já preenchidos.
- **Relatório médico** — alternativa ao formulário de acesso, texto pronto para o prontuário.
- **Checklist em tempo real** — mostra o que falta em cada documento.

**Pacientes (arquivo):** tudo fica salvo no IndexedDB do navegador (sem servidor). Busca por nome, mãe, CPF ou CNS;
reabrir, renovar (copia o processo anterior e zera MEEM/CDR/datas) e backup/importação em `.json`.

**Perfil do médico:** nome, CRM, CNS, CNES e estabelecimento — preenchido uma vez, usado em todos os documentos.

### Para adicionar uma patologia

1. `src/dosus/<patologia>/dados.js` — CIDs, medicamentos (texto exato da lista do LME), exames, critérios.
2. `processo.js` — modelo de dados e `derivar()` (o que falta em cada documento → checklist).
3. Telas e documentos impressos; registrar em `patologias` e nas seções em `src/dosus/DosusApp.jsx`.
