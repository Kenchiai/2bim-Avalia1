const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let svgAtual = "";
let idTokenGoogle = "";

window.handleCredentialResponse = (response) => {
  if (!response || typeof response.credential !== "string" || !response.credential) {
    idTokenGoogle = "";
    mensagem.textContent = "Não foi possível obter o token do Google. Tente entrar novamente.";
    return;
  }

  idTokenGoogle = response.credential;
  mensagem.style.color = "green";
  mensagem.textContent = "Autenticado com sucesso com o Google!";
};

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";
  mensagem.style.color = "red";
  area.innerHTML = "";
  botaoBaixar.hidden = true;

  const numero = Number(campoNumero.value);

  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = "Erro (400): Digite um inteiro entre 1 e 100.";
    return;
  }

  if (!idTokenGoogle) {
    mensagem.textContent = "Erro (401): Faça login com o Google primeiro.";
    return;
  }

  try {
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idTokenGoogle}`
      },
      body: JSON.stringify({ numero: numero })
    });

    if (resposta.ok) {
      svgAtual = await resposta.text();
      area.innerHTML = svgAtual;
      botaoBaixar.hidden = false;
      mensagem.textContent = "";
    } else {
      const textoErro = await resposta.text();
      
      if (resposta.status === 400) {
        mensagem.textContent = `Erro 400 (Requisição inválida): ${textoErro}`;
      } else if (resposta.status === 401) {
        mensagem.textContent = `Erro 401 (Não autorizado): ${textoErro}`;
      } else {
        mensagem.textContent = `Erro ${resposta.status}: ${textoErro}`;
      }
    }
  } catch {
    mensagem.textContent = "Erro de rede ao tentar conectar com o servidor.";
  }
});

botaoBaixar.addEventListener("click", () => {
  if (!svgAtual) return;
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});