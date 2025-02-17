# AMBISIS SYNC SERVICE

Serviço que contém toda a lógica do sync do mobile

## Como rodar

Antes de tudo, preencha as envs corretamente, caso tenha alguma dúvida olhe o `.env.example`

> 📌 Para rodar o serviço você precisar ter o `make`, `bun` e `docker` instalados

Rode os seguintes comandos, após instalar as dependências:

```bash
$ bun i

$ make
```

## Nix

Gerenciador de pacotes

Para iniciar, instale o [Nix](https://nixos.org/download/) em sua máquina

Comandos utéis para o nix

```bash
$ nix-shell

$ sudo nix-collect-garbage -d # docker system prune -a
```
