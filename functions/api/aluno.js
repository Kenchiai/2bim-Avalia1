export async function onRequest(context) {
  const nome = "teste";

  if (!context?.env?.DB) {
    return new Response("Banco de dados não configurado.", { status: 500 });
  }

  const dados = await context.env.DB.prepare("SELECT * FROM notas WHERE aluno = ?").bind(nome).all();
  return new Response(JSON.stringify(dados));
}
