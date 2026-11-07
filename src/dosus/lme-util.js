export const LME_URL = "/docs/lme-2026.pdf";

export function abrirPDF(bytes, nomeArquivo, baixar) {
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  if (baixar) {
    const a = document.createElement("a");
    a.href = url; a.download = nomeArquivo; a.click();
  } else {
    window.open(url, "_blank");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
