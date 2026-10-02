// functions/api/desenho.js
import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Método não permitido", { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Corpo da requisição inválido", { status: 400 });
  }

  const { numero } = body;

  if (!numeroValido(numero)) {
    return new Response("Número deve ser um inteiro entre 1 e 100", { status: 400 });
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Token de autorização ausente", { status: 401 });
  }

  const idToken = authHeader.split(" ")[1];
  const clientIDEsperado = env.GOOGLE_CLIENT_ID;
  if (!clientIDEsperado) {
    return new Response("Configuração GOOGLE_CLIENT_ID ausente no servidor", { status: 500 });
  }

  try {
    const tokenInfoURL = new URL("https://oauth2.googleapis.com/tokeninfo");
    tokenInfoURL.searchParams.set("id_token", idToken);
    const googleResponse = await fetch(tokenInfoURL);

    if (!googleResponse.ok) {
      return new Response("Token do Google inválido ou expirado", { status: 401 });
    }

    const payload = await googleResponse.json();

    if (payload.aud !== clientIDEsperado) {
      return new Response("Token emitido para um Client ID incorreto", { status: 401 });
    }

    if (payload.email_verified !== "true" && payload.email_verified !== true) {
      return new Response("E-mail não verificado na conta Google", { status: 401 });
    }

    const emailAutenticado = payload.email;

    const svgContent = gerarDesenho(numero, emailAutenticado);

    return new Response(svgContent, {
      status: 200,
      headers: { "Content-Type": "image/svg+xml" }
    });

  } catch {
    return new Response("Não foi possível validar o token junto ao Google", { status: 502 });
  }
}