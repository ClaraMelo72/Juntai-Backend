export enum TipoPerfil {
  STARTUP = 'startup',
  INVESTIDOR = 'investidor',
  ADMIN = 'admin',
}

export enum StatusModeracao {
  PENDENTE = 'pendente',
  APROVADO = 'aprovado',
  REJEITADO = 'rejeitado',
  SUSPENSO = 'suspenso',
}

export enum TipoInvestidor {
  ANJO = 'anjo',
  MENTOR = 'mentor',
  ANJO_MENTOR = 'anjo_mentor',
}

export enum PerfilRisco {
  CONSERVADOR = 'conservador',
  MODERADO = 'moderado',
  ARROJADO = 'arrojado',
}

export enum Segmento {
  FINTECH = 'fintech',
  HEALTHTECH = 'healthtech',
  EDTECH = 'edtech',
  AGTECH = 'agtech',
  SAAS_B2B = 'saas_b2b',
  MARKETPLACE = 'marketplace',
  ECOMMERCE = 'ecommerce',
  ECONOMIA_CRIATIVA = 'economia_criativa',
}

export enum Estagio {
  IDEACAO = 'ideacao',
  VALIDACAO = 'validacao',
  MVP = 'mvp',
  TRACAO = 'tracao',
  CRESCIMENTO = 'crescimento',
  ESCALA = 'escala',
}

export enum Regiao {
  RECIFE = 'recife',
  PORTO_DIGITAL = 'porto_digital',
  NORDESTE = 'nordeste',
  NACIONAL = 'nacional',
}

export enum ModeloNegocio {
  B2B = 'b2b',
  B2C = 'b2c',
  B2B2C = 'b2b2c',
  MARKETPLACE = 'marketplace',
  ASSINATURA_SAAS = 'assinatura_saas',
}

export enum StatusReuniao {
  AGENDADA = 'agendada',
  REALIZADA = 'realizada',
  CANCELADA = 'cancelada',
  NO_SHOW = 'no_show',
}

export enum TipoEventoFunil {
  VISUALIZACAO = 'visualizacao',
  INTERESSE_DEMONSTRADO = 'interesse_demonstrado',
  CONEXAO_ACEITA = 'conexao_aceita',
  REUNIAO_AGENDADA = 'reuniao_agendada',
  REUNIAO_REALIZADA = 'reuniao_realizada',
  PROPOSTA_ENVIADA = 'proposta_enviada',
  INVESTIMENTO_REALIZADO = 'investimento_realizado',
  RECUSADO = 'recusado',
}

export enum AcaoAuditoria {
  APROVACAO_CADASTRO = 'aprovacao_cadastro',
  REJEICAO_CADASTRO = 'rejeicao_cadastro',
  SUSPENSAO_USUARIO = 'suspensao_usuario',
  REMOCAO_CONTEUDO = 'remocao_conteudo',
  EDICAO_CONTEUDO = 'edicao_conteudo',
  REATIVACAO_USUARIO = 'reativacao_usuario',
}