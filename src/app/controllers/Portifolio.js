import { Router } from 'express';
import Project from '@/app/schemas/Project';
import Requisition from '@/app/schemas/Requisition';
import Slugify from '@/utils/Slugify';
import auth from '@/app/middlewares/auth';
import Multer from '@/app/middlewares/Multer';
import User from '@/app/schemas/User';
import authAdmin from '../middlewares/authAdmin';

const router = new Router();

// ROTAS PARA ADM

// Retorna os dados de forma resumida - todos projetos
router.get('/', [auth, authAdmin], (req, res) => {
  Project.find()
    .then((data) => {
      const projects = data.map((project) => {
        return {
          Materia: project.Materia,
          Professores: project.Professores,
          Cursos: project.Cursos,
          featuredImage: project.featuredImage,
        };
      });
      res.send(projects);
    })
    .catch((error) => {
      console.error('Erro ao retornar o projeto do banco de dados.', error);
      res.status(400).send({
        error:
          'Não foi possível obter os dados do seu projeto. Tente novamente',
      });
    });
});

// Achar o projeto pela ID - dados completos
router.get('/id/:projectId', [auth, authAdmin], (req, res) => {
  Project.findById(req.params.projectId)
    .then((project) => {
      res.send(project);
    })
    .catch((error) => {
      console.error('Erro ao obter projeto no banco de dados.', error);
      res.status(400).send({
        error:
          'Não foi possível obter os dados do seu projeto. Tente novamente',
      });
    });
});

// Achar o projeto pela Slug - dados completos
router.get('/:projectSlug', [auth, authAdmin], (req, res) => {
  Project.findOne({ slug: req.params.projectSlug })
    .then((project) => {
      res.send(project);
    })
    .catch((error) => {
      console.error('Erro ao obter projeto no banco de dados.', error);
      res.status(400).send({
        error:
          'Não foi possível obter os dados do seu projeto. Tente novamente',
      });
    });
});

// Novo projeto pro DB
router.post('/', [auth, authAdmin], (req, res) => {
  const { Materia, Professores, Cursos } = req.body;
  Project.create({ Materia, Professores, Cursos })
    .then((project) => {
      res.status(200).send(project);
    })
    .catch((error) => {
      console.error('Erro ao salvar novo projeto no banco de dados.', error);
      res.status(400).send({
        error:
          'Não foi possível salvar seu projeto. Verifique os dados e tente novamente',
      });
    });
});

// Atualiza os dados por comparação no mongoDB
router.put('/:projectId', [auth, authAdmin], (req, res) => {
  const { Materia, Professores, Cursos } = req.body;
  let slug = undefined;
  if (Materia) {
    slug = Slugify(Materia);
  }

  Project.findByIdAndUpdate(
    req.params.projectId,
    { Materia, slug, Professores, Cursos },
    { new: true },
  )
    .then((project) => {
      res.status(200).send(project);
    })
    .catch((error) => {
      console.error('Erro ao salvar projeto no banco de dados.', error);
      res.status(400).send({
        error:
          'Não foi possível atualizar seu projeto. Verifique os dados e tente novamente',
      });
    });
});

// Acha um projeto pela ID e remove do DB
router.delete('/:projectId', [auth, authAdmin], (req, res) => {
  Project.findByIdAndRemove(req.params.projectId)
    .then(() => {
      res.send({ message: 'Projeto removido com sucesso' });
    })
    .catch((error) => {
      console.error('Erro ao remover projeto do banco de dados', error);
      res
        .status(400)
        .send({ message: 'Erro ao remover projeto, tente novamente' });
    });
});
// Cadastrar curso para User
router.put('/curso/:userId', [auth, authAdmin], (req, res) => {
  const { Curso } = req.body;

  User.findByIdAndUpdate(req.params.userId, { Curso }, { new: true })
    .then((User) => {
      res
        .status(200)
        .send(`Usuário cadastrado com sucesso no Curso: ${User.Curso}`);
    })
    .catch((error) => {
      console.error('Erro ao salvar projeto no banco de dados.', error);
      res.status(400).send({
        error:
          'Não foi possível atualizar o curso do user. Verifique os dados e tente novamente',
      });
    });
});

// Obter todos os usuários e seus cursos
router.get('/relations/users', [auth, authAdmin], (req, res) => {
  // Encontra todos os usuários no banco de dados
  User.find({}, 'name Curso')
    .then((users) => {
      res.send(users);
    })
    .catch((error) => {
      console.error('Erro ao obter usuários do banco de dados.', error);
      res.status(500).send({ error: 'Erro interno do servidor' });
    });
});

// ROTAS PARA USUÁRIOS

// Rota para obter todos os projetos com uma categoria específica / obter matérias que abrajam um curso
router.get('/subjects/user', auth, (req, res) => {
  const Cursos = req.user.curso;
  Project.find({ Cursos })
    .then((projects) => {
      const simplifiedProjects = projects.map((project) => ({
        Materia: project.Materia,
        Professores: project.Professores,
        featuredImage: project.featuredImage,
      }));

      res.send(simplifiedProjects);
    })
    .catch((error) => {
      console.error('Erro ao obter projetos no banco de dados.', error);
      res.status(400).send({
        error: 'Não foi possível obter os dados dos projetos. Tente novamente',
      });
    });
});

// Rota de requerimento para inserção em X curso
router.post('/request', auth, (req, res) => {
  const { requisitor, email, description } = req.body;
  const newRequisition = new Requisition();
  Requisition.create({ requisitor, email, description })
    .then((Requisition) => {
      res.status(200).send(Requisition);
    })
    .catch((error) => {
      console.error('Erro ao salvar a requisição no banco de dados.', error);
      res.status(400).send({
        error:
          'Não foi possível salvar sua requisição. Verifique os dados e tente novamente',
      });
    });
});

// TRATAMENTO DE IMAGENS
router.post(
  '/featured-image/:projectId',
  [auth, Multer.single('featuredImage')],
  (req, res) => {
    const { file } = req;
    if (file) {
      Project.findByIdAndUpdate(
        req.params.projectId,
        {
          $set: {
            featuredImage: file.path,
          },
        },
        { new: true },
      )
        .then((project) => {
          return res.send({ project });
        })
        .catch((error) => {
          console.error('Erro associar imagem ao projeto', error);
          res.status(500).send({ error: 'Ocorreu um erro, tente novamente' });
        });
    } else {
      return res.status(400).send({ error: 'Nenhuma imagem enviada' });
    }
  },
);

router.post('/images/:projectId', auth, Multer.array('images'), (req, res) => {
  const { files } = req;

  if (files && files.length > 0) {
    const images = [];
    files.forEach((file) => {
      images.push(file.path);
    });
    Project.findByIdAndUpdate(
      req.params.projectId,
      {
        $set: { images },
      },
      { new: true },
    )
      .then((project) => {
        return res.send({ project });
      })
      .catch((error) => {
        console.error('Erro associar imagens ao projeto', error);
        res.status(500).send({ error: 'Ocorreu um erro, tente novamente' });
      });
  } else {
    return res.status(400).send({ error: 'Nenhuma imagem enviada' });
  }
});

export default router;
