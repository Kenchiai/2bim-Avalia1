export async function onRequest(context) {
  const nome = "teste";
  // Consulta segura usando .bind()
  const dados = await context.env.DB.prepare("SELECT \* FROM notas WHERE aluno = ?").bind(nome).all();
  return new Response(JSON.stringify(dados));
}