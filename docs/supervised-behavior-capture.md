# Captura experimental de sinais supervisionados

A migration `SnapshotComportamental1795564800000` adiciona uma coluna nullable
à tabela de exposições. Ela não foi aplicada automaticamente. Com
`MATCHMAKING_BEHAVIOR_CAPTURE=true`, a estratégia supervisionada consulta os
eventos em uma única instrução PostgreSQL antes de chamar o modelo. A consulta
usa `statement_timestamp()` e a visão transacional da própria instrução; os
eventos são agregados por par em 90 dias. O snapshot `behavior-v1` acompanha o
contexto assinado e é persistido quando o card é confirmado. Não é persistido
para cards não confirmados. Contextos antigos continuam aceitos.

A captura não altera as features enviadas ao modelo nem o ranking. A opção fica
desligada por padrão e exige a migration antes de ser habilitada. Antes de
ativar, validar implantação, backup e configuração em ambiente adequado. A
configuração opcional `BEHAVIOR_HISTORY_COMPLETE_SINCE` só pode ser informada
se houver evidência operacional de coleta completa desde essa data. Sem essa
evidência os valores são nulos, inclusive para histórico vazio. Uma data antiga
não comprovada produziria dados incorretos. Tempo de perfil continua sujeito a
falha de envio do navegador mesmo quando a coleta no servidor é completa.

O contexto é assinado, não criptografado: seus dados podem ser lidos pelo
cliente autenticado. O snapshot contém somente IDs do par e contagens próprias.
O relógio capturado é anterior à chamada do modelo e identifica a visão da
consulta, não o horário do ACK. O modelo atual não recebe nem usa o snapshot;
é uma observação para um futuro experimento, não prova de melhoria.

Validação local: `node tests/behavior-postgres.cjs` usa tabelas temporárias e
rollback; `node --test tests/supervised-matchmaking.test.cjs` testa o fluxo.
