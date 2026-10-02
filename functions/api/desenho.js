// functions/api/desenho.js

import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

function parseJwtSection(sectionBase64) {
  const bytes = base64UrlDecode(sectionBase64);
  const jsonStr = new TextDecoder().decode(bytes);
  return JSON.parse(jsonStr);
}

async function verificarIdTokenLocal(idToken, clientIDEsperado) {
  const partes = idToken.split(".");
  if (partes.length !== 3) {
    throw new Error("Formato do token JWT inválido.");
  }

  const [headerB64, payloadB64, signatureB64] = partes;

  const header = parseJwtSection(headerB64);
  const payload = parseJwtSection(payloadB64);

  const emissorValido =
    payload.iss === "https://accounts.google.com" ||
    payload.iss === "accounts.google.com";

  if (!emissorValido) {
    throw new Error("Emissor do token (iss) inválido.");
  }

  if (payload.aud !== clientIDEsperado) {
    throw new Error("Client ID (aud) divergente.");
  }

  const agoraEmSegundos = Math.floor(Date.now() / 1000);
  if (payload.exp && agoraEmSegundos >= payload.exp) {
    throw new Error("Token expirado (exp).");
  }

  if (payload.email_verified !== "true" && payload.email_verified !== true) {
    throw new Error("E-mail não verificado pelo Google.");
  }

  const jwksRes = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  if (!jwksRes.ok) {
    throw new Error("Não foi possível obter as chaves públicas do Google.");
  }

  const jwks = await jwksRes.json();
  const chavePublicaJwk = jwks.keys.find((key) => key.kid === header.kid);

  if (!chavePublicaJwk) {
    throw new Error("Chave correspondente ao 'kid' não encontrada no JWKS.");
  }

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    chavePublicaJwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" }
    },
    false,
    ["verify"]
  );

  const dadosAssinados = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const assinaturaBytes = base64UrlDecode(signatureB64);

  const assinaturaValida = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    assinaturaBytes,
    dadosAssinados
  );

  if (!assinaturaValida) {
    throw new Error("Assinatura criptográfica do token é inválida.");
  }

  return payload;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return new Response("Método não permitido.", {
      status: 405,
      headers: { "Allow": "POST" }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("JSON malformado.", { status: 400 });
  }

  if (!body || typeof body.numero === "undefined") {
    return new Response("Campo 'numero' ausente.", { status: 400 });
  }

  const { numero } = body;
  if (!numeroValido(numero)) {
    return new Response("Número deve ser um inteiro entre 1 e 100.", { status: 400 });
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Cabeçalho Authorization ausente ou malformado.", { status: 401 });
  }

  const idToken = authHeader.substring(7).trim();

  try {
    const clientIDEsperado = env.GOOGLE_CLIENT_ID;
    const payload = await verificarIdTokenLocal(idToken, clientIDEsperado);

    const emailAutenticado = payload.email;

    const svgContent = gerarDesenho(numero, emailAutenticado);

    return new Response(svgContent, {
      status: 200,
      headers: { "Content-Type": "image/svg+xml; charset=utf-8" }
    });
  } catch {
    return new Response(`Falha na autenticação local: ${erro.message}`, { status: 401 });
  }
}