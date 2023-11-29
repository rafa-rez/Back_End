# Projeto CompJúnior - Trilha de BackEnd

## Introdução ao Projeto

Este projeto foi desenvolvido como parte do Processo Seletivo da CompJúnior, na trilha de BackEnd. O objetivo principal foi criar um conjunto de rotas que permitiriam aos usuários simular um campus virtual básico, proporcionando acesso a suas matérias e algumas informações relevantes, além de um controle importante sobre o DB quando logado como administrador.

## Como Rodar

### Instalação de Dependências

```bash
-> npm install
```

### Comando de Desenvolvimento:

```bash
-> npm run serve
-> Espere a mensagem avisando que o server está rodando
```

### Tecnologias

```bash
Tecnologias:
-> Node
-> Insomnia
-> VsCode (de preferência)
-> MongoDB

```

### Peculiaridades

```bash
-> Apenas contas com email: "adm@adm.com" serão tratadas como administradores.
```

### Rotas

```bash

| Método HTTP | Rota                         | Descrição                                                                                         | Parâmetros                                                 | Middlewares                          |
| ----------- | ---------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------ |
| GET         | `/`                          | Retorna dados resumidos de todos os projetos.                                                     | N/A                                                        | auth, authAdmin                      |
| GET         | `/id/:projectId`             | Retorna dados completos de um projeto com base na ID.                                             | `projectId`: ID do projeto                                 | auth, authAdmin                      |
| GET         | `/:projectSlug`              | Retorna dados completos de um projeto com base no Slug.                                           | `projectSlug`: Slug do projeto                             | auth, authAdmin                      |
| POST        | `/`                          | Cria um novo projeto no banco de dados.                                                           | `Materia, Professores, Cursos`                             | auth, authAdmin                      |
| PUT         | `/:projectId`                | Atualiza os dados de um projeto no banco de dados por comparação.                                 | `projectId`: ID do projeto, `Materia, Professores, Cursos` | auth, authAdmin                      |
| DELETE      | `/:projectId`                | Remove um projeto do banco de dados com base na ID.                                               | `projectId`: ID do projeto                                 | auth, authAdmin                      |
| PUT         | `/curso/:userId`             | Cadastra um curso para um usuário.                                                                | `userId`: ID do usuário, `Curso`                           | auth, authAdmin                      |
| GET         | `/relations/users`           | Obtém todos os usuários e seus cursos.                                                            | N/A                                                        | auth, authAdmin                      |
| GET         | `/subjects/user`             | Obtém todos os projetos relacionados a uma categoria específica (matérias que abrangem um curso). | `Curso`                                                    | auth                                 |
| POST        | `/request`                   | Cria uma requisição para inserção em um curso.                                                    | `requisitor, email, description`                           | auth                                 |
| POST        | `/featured-image/:projectId` | Associa uma imagem destacada a um projeto.                                                        | `projectId`: ID do projeto, imagem (multipart form-data)   | auth, Multer.single('featuredImage') |
| POST        | `/images/:projectId`         | Associa imagens a um projeto.                                                                     | `projectId`: ID do projeto, imagens (multipart form-data)  | auth, Multer.array('images')         |

```

### Developer

```bash
-> Rafael Alves Silva Rezende
```
