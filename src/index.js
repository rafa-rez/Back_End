import express, { Router } from 'express';
import bodyParser from 'body-parser';
import { Portifolio, Auth, Uploads } from '@/app/controllers';
import cors from 'cors';
const app = express();

// Declaração da porta a ser utilizada
const port = 3000;

// Toda a comunicação vais ser baseada em Json
app.use(cors());
app.use(bodyParser.json());

// Impossibilitar de que informaçõse complexas sejam mandadas para o back - segurança
app.use(bodyParser.urlencoded({ extended: false }));

// Declaração de Url bases para as requesições
app.use('/portifolio', Portifolio);
app.use('/auth', Auth);
app.use('/uploads', Uploads);

// Mensagem inicial quando rodar o comando 'npm run serve'
console.log(`Servidor rodando no link http://localhost:${port}`);
app.listen(port);
