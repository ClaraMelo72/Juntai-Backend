# Juntai Backend

Backend da plataforma **Juntai**, uma solução de matchmaking desenvolvida para conectar startups, investidores anjo e mentores do ecossistema de inovação do Nordeste.

O projeto faz parte do **Projeto Integrador do 5º período de Análise e Desenvolvimento de Sistemas (ADS)**, com foco no ecossistema de startups e economia criativa, tendo como contexto o Porto Digital, no Bairro do Recife.

---

## 📌 Sobre o projeto

O Juntai é uma plataforma SaaS voltada à conexão entre startups em estágio inicial e investidores anjo e mentores.

A plataforma busca facilitar a descoberta de oportunidades, a apresentação de startups, o matchmaking entre os participantes e a comunicação após uma conexão.

O backend é responsável por disponibilizar a API, implementar as regras de negócio, realizar a persistência dos dados, autenticar usuários e fornecer os serviços necessários para o funcionamento da plataforma.

---

## 🎯 Objetivo

Desenvolver uma API escalável e segura capaz de:

- Gerenciar usuários e seus perfis;
- Cadastrar e gerenciar startups;
- Cadastrar investidores anjo e mentores;
- Realizar matchmaking entre startups e investidores/mentores;
- Gerenciar interações entre os usuários;
- Disponibilizar recursos de autenticação e autorização;
- Armazenar e gerenciar imagens e arquivos de mídia;
- Registrar informações necessárias para métricas e governança;
- Atender aos requisitos de segurança e conformidade com a LGPD.

---

## 👥 Atores

### Startup / Empreendedor

Responsável por cadastrar sua startup, apresentar seu modelo de negócio, informar necessidades e buscar investidores ou mentores compatíveis.

### Investidor Anjo / Mentor

Responsável por cadastrar seu perfil de interesse, avaliar startups compatíveis e interagir com oportunidades disponíveis na plataforma.

### Administrador

Responsável pela administração da plataforma, incluindo moderação de cadastros e conteúdos, acompanhamento de métricas e ações administrativas.

---

## 🚀 Funcionalidades

O backend contempla o desenvolvimento das seguintes funcionalidades:

- Cadastro de usuários;
- Autenticação e autorização;
- Gerenciamento de perfis;
- Cadastro e gerenciamento de startups;
- Cadastro de investidores e mentores;
- Definição de interesses e critérios de compatibilidade;
- Sistema de matchmaking;
- Visualização de perfis compatíveis;
- Comunicação entre usuários;
- Agendamento de reuniões;
- Apresentação de pitch e modelo de negócio;
- Moderação administrativa;
- Geração de métricas da plataforma;
- Feedback e avaliação após interações;
- Controle de consentimento e informações relacionadas à LGPD;
- Registro de ações administrativas para auditoria.

---

## 🏗️ Arquitetura

O backend utiliza uma **arquitetura em camadas (Layered Architecture)**, separando as responsabilidades da aplicação.

A comunicação segue, de forma geral, o fluxo:

```text
Cliente
   ↓
Routes
   ↓
Middlewares
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
Entities / TypeORM
   ↓
PostgreSQL
```

### Camadas

#### Routes

Define os endpoints da API e direciona as requisições para os respectivos controllers.

#### Middlewares

Responsáveis por comportamentos intermediários da aplicação, como autenticação, autorização, validações e tratamento de requisições.

#### Controllers

Recebem as requisições HTTP, processam os parâmetros necessários e encaminham as operações para os services.

#### Services

Concentram as regras de negócio da aplicação.

#### Repositories

Responsáveis pelo acesso e manipulação dos dados persistidos no banco de dados.

#### Entities

Representam as entidades do domínio e o mapeamento das estruturas utilizadas pelo TypeORM.

#### Config

Centraliza configurações da aplicação, banco de dados e variáveis de ambiente.

#### Migrations

Responsáveis pelo versionamento e evolução da estrutura do banco de dados.

---

## 📂 Estrutura do projeto

```text
Juntai-Backend/
│
├── src/
│   ├── @types/
│   ├── config/
│   ├── controllers/
│   ├── entities/
│   ├── middlewares/
│   ├── migrations/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── App.ts
│   └── Server.ts
│
├── dist/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

### Principais arquivos e diretórios

| Diretório/Arquivo | Responsabilidade |
|---|---|
| `src/@types` | Tipagens personalizadas do projeto |
| `src/config` | Configurações da aplicação e banco |
| `src/controllers` | Controle das requisições HTTP |
| `src/entities` | Entidades e modelos do TypeORM |
| `src/middlewares` | Autenticação, autorização e outras funções intermediárias |
| `src/migrations` | Versionamento do banco de dados |
| `src/repositories` | Persistência e acesso aos dados |
| `src/routes` | Definição das rotas da API |
| `src/services` | Regras de negócio |
| `src/App.ts` | Configuração da aplicação Express |
| `src/Server.ts` | Inicialização do servidor |

---

## 🛠️ Stack

### Linguagem

- TypeScript

### Runtime

- Node.js

### Framework

- Express

### ORM

- TypeORM

### Banco de dados

- PostgreSQL

### Autenticação

- JSON Web Token (JWT)

### Armazenamento de mídia

- Cloudinary

### Segurança

- bcrypt para hash de senhas
- JWT para autenticação e autorização
- Variáveis de ambiente para configurações sensíveis

### Ferramentas de desenvolvimento

- ts-node
- ts-node-dev
- tsconfig-paths
- ESLint
- Prettier

---

## 🔐 Autenticação e autorização

A API utiliza **JWT (JSON Web Token)** para autenticação dos usuários.

Após o login, o usuário autenticado recebe um token que deve ser enviado nas requisições protegidas.

Os acessos da plataforma são organizados de acordo com o perfil do usuário, incluindo:

- Startup;
- Investidor/Mentor;
- Administrador.

O backend utiliza middlewares para validar a autenticação e restringir recursos de acordo com as permissões do usuário.

---

## ☁️ Armazenamento de mídia

O **Cloudinary** será utilizado para armazenamento e gerenciamento de imagens e outros recursos de mídia utilizados pela plataforma.

Entre os possíveis recursos estão:

- Logos de startups;
- Imagens de perfil;
- Imagens relacionadas às startups;
- Materiais utilizados na apresentação dos projetos.

As credenciais do Cloudinary não devem ser armazenadas diretamente no código-fonte.

---

## 🗄️ Banco de dados

O projeto utiliza **PostgreSQL** como sistema de gerenciamento de banco de dados.

A comunicação entre a aplicação e o banco é realizada utilizando:

```text
TypeScript
    ↓
TypeORM
    ↓
PostgreSQL
```

As alterações estruturais do banco devem ser controladas por meio de migrations.

---

## 🔑 Variáveis de ambiente

Informações sensíveis e configurações específicas do ambiente devem ser armazenadas no arquivo `.env`.

Exemplo:

```env
PORT=3000

DB_HOST=
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> **Nunca versionar o arquivo `.env` no GitHub.**

O arquivo `.env` deve estar incluído no `.gitignore`.

---

## ⚙️ Instalação

### Pré-requisitos

Antes de executar o projeto, é necessário possuir:

- Node.js;
- npm;
- PostgreSQL;
- Git.

### Clonar o repositório

```bash
git clone https://github.com/ClaraMelo72/Juntai-Backend.git
```

Entrar na pasta:

```bash
cd Juntai-Backend
```

### Instalar dependências

```bash
npm install
```

### Configurar variáveis de ambiente

Criar um arquivo `.env` na raiz do projeto:

```text
Juntai-Backend/
├── .env
├── package.json
└── src/
```

Preencher as variáveis de acordo com o ambiente utilizado.

---

## ▶️ Executando em desenvolvimento

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

O servidor será executado, por padrão, na porta:

```text
3000
```

---

## 🏗️ Build

Para gerar a versão compilada do projeto:

```bash
npm run build
```

Os arquivos compilados serão gerados no diretório:

```text
dist/
```

---

## ▶️ Executando produção

Após realizar o build:

```bash
npm start
```

O comando executará a versão compilada localizada em `dist/`.

---

## 🧪 Testes e validação

As funcionalidades críticas do sistema deverão ser cobertas por testes e validações antes do lançamento.

O processo de validação contempla:

- Testes funcionais;
- Testes de integração;
- Validação das regras de negócio;
- Testes de autenticação e autorização;
- Testes de endpoints;
- Validação com usuários beta;
- Verificação dos requisitos funcionais e não funcionais.

---

## 🔒 Segurança e LGPD

O backend considera requisitos de segurança e privacidade previstos para a plataforma.

Entre as medidas previstas estão:

- Autenticação baseada em JWT;
- Senhas armazenadas utilizando hash;
- Controle de acesso por perfil;
- Uso de variáveis de ambiente para dados sensíveis;
- Comunicação segura em produção;
- Controle de consentimento;
- Tratamento adequado de dados pessoais;
- Possibilidade de exclusão de dados conforme as regras aplicáveis;
- Registro de ações administrativas para auditoria.

---

## 📊 Métricas

A plataforma deverá disponibilizar informações para acompanhamento do ecossistema, incluindo métricas como:

- Número de startups cadastradas;
- Número de investidores e mentores cadastrados;
- Número de matches realizados;
- Conversas iniciadas;
- Reuniões agendadas;
- Interações realizadas;
- Avaliações após interações.

---

## ☁️ Deploy

O backend será preparado para implantação na **Microsoft Azure**.

A infraestrutura de produção deverá contemplar:

```text
Aplicação Backend
       ↓
Microsoft Azure
       ↓
PostgreSQL
       ↓
Serviços externos
   ├── Cloudinary
   └── Serviços de autenticação/comunicação
```

As configurações específicas de produção serão definidas durante a etapa de implantação e Go-to-Market do projeto.

---

## 📋 Requisitos do Sistema

O backend atende aos requisitos definidos para o Projeto Integrador:

### Requisitos funcionais

- **RF01:** Cadastro de startups;
- **RF02:** Cadastro de investidores e mentores;
- **RF03:** Matchmaking por critérios de afinidade;
- **RF04:** Visualização de perfis compatíveis;
- **RF05:** Comunicação e agendamento;
- **RF06:** Apresentação de pitch e modelo de negócio;
- **RF07:** Autenticação e controle de acesso;
- **RF08:** Moderação administrativa;
- **RF09:** Geração de métricas;
- **RF10:** Feedback e avaliação;
- **RF11:** Política de uso e consentimento conforme a LGPD.

### Requisitos não funcionais

- Disponibilidade;
- Segurança;
- Conformidade com a LGPD;
- Usabilidade;
- Escalabilidade;
- Governança;
- Confiabilidade;
- Portabilidade;
- Manutenibilidade;
- Auditabilidade.

---

## 🎓 Projeto Integrador

**Curso:** Análise e Desenvolvimento de Sistemas – ADS  
**Período:** 5º período  
**Projeto:** Startups e Economia Criativa  
**Contexto:** Porto Digital – Recife/PE  
**Produto:** Juntai

O projeto integra conhecimentos das disciplinas:

- Full Stack;
- Empreendedorismo;
- Governança em TI;
- Verificação e Validação.

---

## 📌 Status

🚧 **Em desenvolvimento**

O backend encontra-se em fase de desenvolvimento e estruturação das funcionalidades necessárias para o lançamento da plataforma.

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos como parte do Projeto Integrador do curso de Análise e Desenvolvimento de Sistemas.
