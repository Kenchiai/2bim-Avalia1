Relatório de Avaliação — GitHub Actions com IA
Repositório: https://github.com/Kenchiai/2bim-Avalia1

Integrante: Bruno Kenyu Ochiai (Matrícula: 2026005370)

Turma: 1ESAN

Tarefa 1: CI a cada commit
Execução com Sucesso (Verde):
https://github.com/Kenchiai/2bim-Avalia1/actions/runs/38009532716

Execução com Erro (Vermelho):
https://github.com/Kenchiai/2bim-Avalia1/actions/runs/38009808771/job/114086943753

Linha do Log com Erro:
Parse error near line 1: syntax error in CREATE TABLE
::error::Erro na validação do HTML ou execução do SQLite 

Por que testar em SQLite local antes do D1?:
O teste em SQLite local permite validar a sintaxe dos scripts SQL e detectar erros de estrutura rapidamente no ambiente de CI, antes de aplicar alterações irreversíveis na base de dados remota do D1 em produção

Tarefa 2: Proteger a main com o CI
Pull Request Bloqueado:
https://github.com/Kenchiai/2bim-Avalia1/pull/1

Pull Request Liberado:
https://github.com/Kenchiai/2bim-Avalia1/pull/1

Saída do git push recusado na main:
$ git push origin main
Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
Delta compression using up to 12 threads
Compressing objects: 100% (4/4), done.
Writing objects: 100% (4/4), 419 bytes | 419.00 KiB/s, done.
Total 4 (delta 2), reused 1 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: Review all repository rules at https://github.com/Kenchiai/2bim-Avalia1/rules?ref=refs%2Fheads%2Fmain
remote:
remote: - Changes must be made through a pull request.
remote:
remote: - Required status check "verificar" is expected.
remote:
To https://github.com/Kenchiai/2bim-Avalia1.git
 ! [remote rejected] main -> main (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/Kenchiai/2bim-Avalia1.git'

Tarefa 3: Revisão de PR por IA
Pull Request com as duas revisões da IA (Abertura e Synchronize):
https://github.com/Kenchiai/2bim-Avalia1/pull/3

Log da Execução com Erro de Permissão (403 / Sem pull-requests: write):
https://github.com/Kenchiai/2bim-Avalia1/actions/runs/38153015109/job/114510183430

Análise Crítica da Revisão da IA:
No primeiro comentário, a IA apontou corretamente a falta do parâmetro .bind() para evitar SQL Injection. Porém, em um dos itens, ela sugeriu refatorar a estrutura do arquivo wrangler.toml alegando falta de compatibilidade de versão, o que era um falso positivo e irrelevante para a alteração feita no PR.

Execução do Workflow de Migração no Merge:
https://github.com/Kenchiai/2bim-Avalia1/actions/runs/38146312300

Saída do Comando PRAGMA no D1 Remoto:

cid | name       | type | notnull | dflt_value | pk
0   | id         | INT  | 0       | NULL       | 1
1   | aluno      | TEXT | 0       | NULL       | 0
2   | nota       | REAL | 0       | NULL       | 0
3   | observacao | TEXT | 0       | NULL       | 0

Comprovação de Merge que NÃO disparou o workflow (sem alterações em migrations/):
https://github.com/Kenchiai/2bim-Avalia1/actions/runs/38146312350

Perguntas Teóricas

1. O ci.yml roda duas vezes quando você faz push numa ramificação com PR aberto. Por quê, e qual das duas execuções o status check da main considera?

Roda duas vezes porque o evento `push` é disparado ao atualizar a branch remota e o evento `pull_request` é disparado para simular o merge na branch de destino. O status check da regra de proteção considera a execução do evento `pull_request`, pois ele garante que o código mesclado com a `main` estará funcionando.

2. Por que um PR vindo de um fork não consegue usar `secrets.COPILOT_PAT`? Qual ataque essa regra impede?

Workflows acionados por forks não têm acesso aos segredos do repositório pai por padrão. Essa restrição impede ataques de exfiltração de segredos (*pwn request*), nos quais um contribuidor externo malicioso altera o workflow para expor credenciais sensíveis nos logs.

3. Por que o workflow da Tarefa 3 declara `permissions` explícitas em vez de usar as permissões padrão do `GITHUB_TOKEN`?

A declaração explícita de `permissions` segue o princípio do menor privilégio. Em vez de conceder permissões globais de escrita, ela restringe o token estritamente para leitura de conteúdo (`contents: read`) e criação de comentários (`pull-requests: write`), reduzindo a superfície de ataque.

4. A revisão da IA pode substituir o status check da Tarefa 2? Justifique com o que você observou no item 4 da Tarefa 3.

Não. A revisão da IA é probabilística, podendo gerar falsos positivos ou ignorar falhas críticas, além de não bloquear fisicamente o botão de `merge`. O status check é um mecanismo determinístico indispensável que garante que os testes e validações automatizados passaram com sucesso antes da integração do código.