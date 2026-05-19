## Visão Geral

Esse projeto tem como objetivo, ser uma ferrementa útil para aqueles que gostariam de controlar seus gastos financeiros, de um forma mais segura e inteligente.

Sinta-se a vontade para contribuir com o Desenvolvimento dela

## Para executar localmente:

1. Faça o clone do repositório

```bash
git clone git@github.com:AlexandreOliver/finno.git
```

2. Instale as dependências usando pnpm

```bash
pnpm i
```

3. Execute

```bash
pnpm dev
```

4. Entao acesse [http://localhost:3000](http://localhost:3000)
5. Utilize as credenciais padrões:

```
Email: coroa@itaca.ageu
Senha: rei-de-itaca
```

## Scripts

pnpm \<comand>

- dev - Inicia o Banco de Dados local, roda as migrações, semeia o banco e inicia a aplicação
- dev:web - Inicia somente a aplicação web
- test - Inicia o Banco de Dados Local e roda a bateria de testes
- test:watch - Roda os testes para desenvolvimento assistido,
- build - Gera o código para a Produção,
- lint - Verifica a estilização do código,
- service:db:up - Sobe o Banco de dados em container docker,
- service:db:down - Para e apaga o banco de dados,
- db:generate - Analisa as modificações no schema e gera as migrações,
- db:migrate - Aplica as migrações - Exige service:db:up,
- db:studio - Cria uma interface web para interagir com o Banco de dados - Exige service:db:up
- db:seed - Popula o Banco com dados - Exige service:db:up
- db:view - Gera uma vizualização do banco de dados
- db:push - Envia diretamente ao banco de dados todas os schemas
- wait-for-database - Script que espera até que o banco de dados esteja Online

## Esquema do Banco de Dados

![Schema do banco de dados](Finno-db.png)

### Tabelas

- users - Dedicada a registrar todos os usuarios cadastrados no sistema.
- sessions - Dedicada a regitrar todas as sessões ativas e inativas
- wallets - Dedicada a registrar todas as carteiras de um usuario
- categories - Dedicada a registrar todas as categorias de movementos
- transfers - Registra as transferencias entre carteiras
- movements - Registra todos as movimentações financeiras de entrada e saida
- template_reccurent - Registra as movimentações finaceiras recorrentes e planejadas

## Regras de Negócios

- Um usuario poderá ter múltiplas contas, mas cada conta terá apenas um dono
- Um usuario poderá criar novas categorias personalizadas, tendo acesso somente as que criou e as que são padrão.
- in progress...

## Tecnologias

- NextJs
- Drizzle ORM
- Docker
- Zod
- Shadcn UI
- PostgreSQL

## Rotas

```
/
auth/login/
auth/register/
dashboard/
dashboard/trasactions/
```

## Caracteristicas

- [x] Contará com logica de autenicação baseada em sessão
- [ ] Contará com lógica de autorização baseada em Atributos (ABAC)
- in progress..
