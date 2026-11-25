# Acompanhamento de moderação

- `GET /avaliacoes/:tipo/:id` retorna `avaliacaoRecebida` apenas ao participante avaliado: identificador, nota, comentário visível e data de atualização. As demais métricas da avaliação permanecem privadas. Esta alteração também afeta avaliações existentes.
- `POST /denuncias` aceita uma avaliação recebida na própria interação, desde que ainda não tenha sido ocultada.
- `GET /minhas-denuncias` inclui `conteudoDenunciado`, com o snapshot textual capturado ao enviar a denúncia. Evidências de arquivo continuam restritas à administração; registros anteriores ou de mídia podem ter snapshot nulo.
- `GET /minhas-sancoes?historico=true` lista sanções do usuário, inclusive revogadas ou expiradas, com motivo, datas e revogação. Sem o filtro, a resposta continua mostrando somente sanções vigentes.
- As duas consultas pessoais exigem token válido, inclusive quando a conta está suspensa; criar denúncias continua sujeito à verificação de sanções.
