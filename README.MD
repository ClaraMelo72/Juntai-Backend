# Juntaí! Backend

API do projeto acadêmico Juntaí!, que aproxima startups, investidores anjo e mentores e oferece perfis, descoberta, recomendações e comunicação. O backend autentica usuários, aplica regras de acesso, armazena informações no PostgreSQL e consulta um serviço de matchmaking. A plataforma está em beta; uma recomendação não garante contato ou investimento.

**Demonstração na Azure:** https://delightful-beach-0c45f1a10.4.azurestaticapps.net/

Repositórios: [frontend](https://github.com/renatodelgado/Juntai-Frontend), [backend](https://github.com/renatodelgado/Juntai-Backend) e [motor de matchmaking](https://github.com/renatodelgado/Juntai-matchmaking-IA).

## Arquitetura

A aplicação React chama a API Express por HTTP. Rotas e middlewares encaminham as requisições para serviços e repositórios; o TypeORM acessa o PostgreSQL. Para recomendar, o backend envia uma projeção dos perfis ao FastAPI e valida a resposta. Arquivos podem ser enviados ao Cloudinary. O navegador não acessa o banco ou o motor diretamente. O desenho dos componentes e fluxos está em [docs/arquitetura.md](docs/arquitetura.md).

## Stack e organização

Node.js, TypeScript, Express, TypeORM, PostgreSQL, JWT e bcrypt. A integração de mídia usa Cloudinary. As versões são mantidas em `package.json` e `package-lock.json`; o workflow usa Node 24.

`src/modules` reúne rotas, controladores, serviços, entidades e repositórios por domínio. `src/shared` contém middlewares, erros, configuração e migrations. `src/App.ts` configura a aplicação; `src/Server.ts` conecta o banco e inicia o servidor. `tests` contém testes automatizados e `docs` descreve integrações e migrations específicas.

## Instalação e execução

Requisitos: Git, Node.js 24 com npm e PostgreSQL 16 ou Docker. O motor Python é necessário para usar recomendações. Em uma pasta de trabalho:

```sh
git clone https://github.com/renatodelgado/Juntai-Backend.git
cd Juntai-Backend
npm ci
```

Copie `.env.example` para `.env` (`Copy-Item .env.example .env` no PowerShell ou `cp .env.example .env` no macOS/Linux). Defina um `JWT_SECRET` aleatório próprio; por exemplo, gere um valor com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` e coloque-o no arquivo local. Nunca publique `.env` ou segredos. Os valores do PostgreSQL no exemplo são exclusivamente locais e correspondem ao `docker-compose.yml`.

Com Docker disponível, `docker compose up -d postgres` sobe o PostgreSQL na porta **5433** do computador. Sem Docker, configure no `.env` o host, porta, usuário, senha e banco de uma instância local de testes. O comando não prepara o esquema inicial.

**Limitação para banco vazio:** o repositório contém migrations incrementais que pressupõem tabelas anteriores, mas não uma migration inicial completa. `synchronize` está desativado e o servidor não executa migrations automaticamente. Por isso, criar um PostgreSQL vazio e iniciar a API não produz um banco funcional. É necessário um esquema de teste compatível, sem dados pessoais, preparado e validado pela equipe; não restaure backups de produção ou arquivos de origem desconhecida. Revise e aplique as migrations necessárias somente no banco de teste e com um procedimento apropriado. Não execute migrations indiscriminadamente em um banco existente.

Com um banco de teste compatível configurado:

```sh
npm run dev
```

A API inicia na porta `3333`; `GET http://localhost:3333/health` verifica se o processo respondeu, mas não comprova que todas as tabelas e fluxos estejam prontos. O frontend deve apontar `VITE_API_URL` para essa origem. Para recomendações, inicie também o [motor](https://github.com/renatodelgado/Juntai-matchmaking-IA) e configure `MATCHMAKING_API_URL`, normalmente `http://127.0.0.1:8000`. `MATCHMAKING_STRATEGY=rules` é o padrão; `supervised` exige modelo e dependências experimentais.

No beta, o serviço de matchmaking utiliza `MATCHMAKING_API_KEY` compartilhada entre API e motor e a opção de autenticação obrigatória do motor. Não coloque a chave no frontend. Configure Cloudinary para uploads e Azure Communication Services para recuperação de senha por e-mail; sem esses serviços, os fluxos correspondentes ficam indisponíveis. Consulte `.env.example` e [recuperação de senha](docs/recuperacao-senha.md).

## Testes e regras automáticas

```sh
npm test
npm run build
```

Os testes de integração com PostgreSQL possuem instruções e sinalizadores próprios em `docs/`; não os aponte para produção. Parte dos testes usa repositórios ou respostas simuladas.

## Rotas principais

| Método e rota | Uso |
| --- | --- |
| `GET /health` | Verifica a resposta do processo da API |
| `POST /startups` | Cadastra startup e conta correspondente |
| `POST /investidores` | Cadastra investidor ou mentor e conta correspondente |
| `POST /auth/login` | Autentica com e-mail e senha |
| `GET /auth/me` | Consulta a conta autenticada |
| `/startups`, `/investidores`, `/mensagens`, `/reunioes`, `/avaliacoes` | Recursos conforme autenticação e permissões |
| `/admin` | Operações administrativas autorizadas |

As rotas protegidas recebem `Authorization: Bearer <token>`. Credenciais ou permissões inválidas recebem respostas de erro; a autorização é aplicada no servidor.

**ECA — interesse:** evento: investidor confirma interesse; condição: investidor e startup estão ativos e aprovados; ação: o backend registra o interesse apenas se ele ainda não existir. Implementação: `src/modules/startups/services/StartupInterestService.ts`. O teste `interesse continua idempotente e preserva a primeira data` está em `tests/matchmaking.test.cjs` e pode ser executado com `node --test tests/matchmaking.test.cjs`.

**ECA — reunião:** evento: verificação periódica do backend; condição: reunião agendada há pelo menos 24 horas após seu horário; ação: alterar o estado para realizada. Implementação: `src/modules/reunioes/services/conclusaoAutomatica.ts` e `src/modules/reunioes/repositories/ReuniaoRepository.ts`. O teste correspondente está em `tests/feedback.test.cjs`.

## Segurança, dados e limites

JWT e autorização por perfil protegem rotas; senhas são armazenadas com hash bcrypt. Os dados de demonstração devem ser fictícios. A existência de entidades de consentimento não comprova que os aceites do frontend sejam registrados no servidor. Canal de direitos do titular, exclusão integral, retenção, restauração e homologação de segurança ainda exigem definição ou implementação. A disponibilidade e o custo dependem de Azure e serviços externos.

## Equipe, publicação e uso de IA

O contexto acadêmico e os integrantes estão no [frontend](https://github.com/renatodelgado/Juntai-Frontend/blob/main/docs/projeto-integrador.md). Os históricos de commits mostram as contribuições que puderam ser atribuídas no Git; trabalho fora do Git não deve ser apresentado como commit. O Codex foi usado para revisar esta documentação; a equipe deve completar a declaração de usos anteriores e as verificações realizadas. O projeto é acadêmico; não há licença de distribuição explícita neste repositório.
