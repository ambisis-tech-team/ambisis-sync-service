# AMBISIS SYNC SERVICE

Serviço que contém toda a lógica do sync do mobile

## Como rodar

Antes de tudo, preencha as envs corretamente, caso tenha alguma dúvida olhe o `.env.example`

> 📌 Para rodar o serviço você precisar ter o `make`, `bun` e `docker` instalados

Rode os seguintes comandos, após instalar as dependências:

```bash
$ bun i

$ make

$ make logs # Caso você queira ver os logs do serviço
```

## Oque falta testar

Coisas testas e problemas pendentes SYNC 3.0

Coisas testadas:
Cada teste vai ser considerado criando todas as entidades possíveis e preenchendo todos os campos;

- [x] Empresas
- [x] Criar no mobile
- [x] Editar no mobile
- [x] Criar no web
- [x] Editar no web
- [x] Empreendimentos
  - [x] Criar no mobile
  - [x] Editar no mobile
  - [x] Criar no web
  - [x] Editar no web
- [x] Licenças
- [x] Editar no mobile
- [x] Criar no mobile
- [x] Criar no web
- [x] Editar no web
- [x] Fases
  - [x] Editar no mobile
  - [x] Criar no mobile
  - [x] Editar no web
  - [x] Criar no web
- [x] Vistorias:
- [x] Editar no mobile
- [x] Criar no mobile
- [x] Editar no web
- [x] Criar no web
- [x] Controles
  - [x] Criar no mobile
  - [x] Editar no mobile
  - [x] Criar no web
  - [x] Editar no web
- [x] Lista de controles
  - [x] Criar no mobile
  - [x] Editar no mobile
  - [x] Criar no web
  - [x] Editar no web
- [x] ESG
  - [x] Unidade de medida
    - [x] Criar no mobile
    - [x] Editar no mobile
    - [x] Criar no web
    - [x] Editar no web
  - [x] Metas
    - [x] Criar no mobile
    - [x] Editar no mobile
    - [x] Criar no web
    - [x] Editar no web
  - [x] Associar meta
    - [x] Associar no mobile
    - [x] Associar no web

Lista de fixes pendentes a serem feitos no SYNC 3.0:

-
