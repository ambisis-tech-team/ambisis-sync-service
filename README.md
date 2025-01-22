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

- [ ] Empresas

  - [ ] Criar no mobile
  - [ ] Editar no mobile
  - [ ] Criar no web
  - [ ] Editar no web
  - [ ] Empreendimentos
    - [ ] Criar no mobile
    - [ ] Editar no mobile
    - [ ] Criar no web
    - [ ] Editar no web

- [ ] Licenças

  - [ ] Editar no mobile
  - [ ] Criar no mobile
  - [ ] Criar no web
  - [ ] Editar no web
  - [ ] Fases
    - [ ] Editar no mobile
    - [ ] Criar no mobile
    - [ ] Editar no web
    - [ ] Criar no web

- [ ] Vistorias:

  - [x] Editar no mobile
  - [x] Criar no mobile
  - [ ] Editar no web
  - [ ] Criar no web
  - [ ] Controles
    - [ ] Criar no mobile
    - [ ] Editar no mobile
    - [ ] Criar no web
    - [ ] Editar no web
  - [ ] Lista de controles
    - [ ] Criar no mobile
    - [ ] Editar no mobile
    - [ ] Criar no web
    - [ ] Editar no web

- [ ] ESG
  - [ ] Unidade de medida
    - [ ] Criar no mobile
    - [ ] Editar no mobile
    - [ ] Criar no web
    - [ ] Editar no web
  - [ ] Metas
    - [ ] Criar no mobile
    - [ ] Editar no mobile
    - [ ] Criar no web
    - [ ] Editar no web
  - [ ] Associar meta
    - Associar no mobile
    - Associar no web

Lista de fixes pendentes a serem feitos no SYNC 3.0:

-
