export async function onRequest(context) {
  const nome = "teste";
// Linha vulnerável concatenada com +
  const dados = await context.env.DB.prepare("SELECT \* FROM notas WHERE aluno = '" + nome + "'").all();
  return new Response(JSON.stringify(dados));
}