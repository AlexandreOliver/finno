# BDD Specs

## Narrativa 1

```

Dado um visitante
Qaundo entrar na pagina de login
Quero criar um novo usuario no sistema

```

### Cenarios

```
Dado que o visitante nao esta registrado
Quando entrar na pagina login
    E inserir dados ficticios
    E clicar em login
Entao o sistema emite um erro pedindo para se registrar

Dado que o visitante nao esta registrado
Quando clicar em se registrar
Entao receber um formulario para inserir seus dados

Dado que o visitante nao esta registrado
Quando prencher seus dados de registro
    E os dados estao corretos
Entao o sistema deve criar uma session autenticado
    E uma wallet padrao
    E redirecionar para a pagina login
```
