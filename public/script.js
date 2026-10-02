// public/script.js

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let svgAtual = "";
let idTokenGoogle = ""; // Variável para guardar o ID Token retornado pelo Google

// Função de callback chamada pelo botão de login do Google
function handleCredentialResponse(response) {
  idTokenGoogle = response.credential;
  mensagem.textContent = "Autenticado com sucesso! Agora você pode gerar o desenho.";
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";

  const numero = Number(campoNumero.value);

  // Validação simples no frontend antes de enviar
  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    mensagem.textContent = "Digite um inteiro entre 1 e 100.";
    return;
  }

  if (!idTokenGoogle) {
    mensagem.textContent = "Por favor, faça login com o Google primeiro.";
    return;
  }

  try {
    // Chamada POST para a Pages Function (API)
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idTokenGoogle}`
      },
      body: JSON.stringify({ numero: numero })
    });

    if (resposta.ok) {
      // Recebe o SVG gerado pelo servidor
      svgAtual = await resposta.text();
      area.innerHTML = svgAtual;
      botaoBaixar.hidden = false;
      mensagem.textContent = "";
    } else {
      // Trata erros 400 ou 401 devolvidos pelo servidor
      const erro = await resposta.text();
      mensagem.textContent = `Erro (${resposta.status}): ${erro}`;
      area.innerHTML = "";
      botaoBaixar.hidden = true;
    }
  } catch (err) {
    mensagem.textContent = "Erro ao conectar com o servidor.";
  }
});