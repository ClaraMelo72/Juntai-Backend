# Estrutura de moderacao

As migrations de feedback precedem `ModeracaoIa1794873600000`. Esta entrega prepara persistencia; nao implementa denuncias, ocultacao nas respostas, sancoes, autorizacao, captura de evidencias ou chamadas de IA.

- `denuncias`: alvo polimorfico (`tipo_alvo`, `alvo_id`, `campo_alvo`). O service deve validar alvo, titularidade e acesso; nao existe FK polimorfica. Motivos e campos permitidos devem ser definidos pela equipe. O indice parcial impede denuncias abertas duplicadas pelo mesmo usuario e campo.
- `analises_moderacao_ia`: historico N:1; resultado concluido exige categoria, prioridade, justificativa, modelo, versao, evidencia e data. `score_risco` e numeric (retornado como string pelo pg). A decisao pode referenciar uma analise da mesma denuncia e registrar concordancia.
- `sancoes`: datas e revogacao registradas, com justificativa e administrador. A aplicacao devera verificar vigencia nos servicos.
- `campos_perfil_ocultados`: cada linha registra uma ocultacao e sua eventual restauracao. `tipo_alvo`/`alvo_id` sao polimorficos e devem ser validados pelo service. Um indice impede ocultacoes ativas duplicadas. O controle nao filtra automaticamente respostas ou URLs publicas; o tratamento de midia precisa ser projetado no servico.
- Mensagens e comentarios de avaliacoes possuem indicador de ocultacao inicialmente falso. O service precisara respeita-lo.
- `evidencia_ref` e `evidencia_referencia` sao identificadores privados, nao snapshots; a equipe deve definir armazenamento seguro, integridade, acesso e retencao antes do uso. Conteudo de IA nao deve ir para logs.
- `log_auditoria.entidade_id` aceita UUID ou bigint como texto; a migration preserva os IDs antigos. Novas acoes sao adicionadas ao enum.

A migration e aditiva quanto aos dados, exceto pela conversao segura da coluna de auditoria de UUID para texto. Sua reversao automatica e bloqueada para preservar registros. Categorias de IA sao as propostas pelo documento e poderao exigir migration se forem alteradas. `StatusModeracao` preexistente permanece inalterado.
