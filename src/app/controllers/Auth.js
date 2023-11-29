import { Router } from 'express';
import bcrypt from 'bcryptjs';
import authConfig from '@/config/auth';
import crypto from 'crypto';
import Jwt from 'jsonwebtoken';
import Mailer from '@/module/Mailer';
import User from '@/app/schemas/User';
import { error } from 'console';

const router = new Router();
const generateToken = (params) => {
  return Jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
};

router.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  let isAdmin = false;
  if (email == 'adm@adm.com') {
    isAdmin = true;
  }

  User.findOne({ email })
    .then((userData) => {
      if (userData) {
        return res.status(400).send({ error: 'User already exists' });
      } else {
        User.create({
          name,
          email,
          password,
          administrador: isAdmin,
        })
          .then((user) => {
            user.password = undefined;
            return res.send(`Cadastro realizado com sucesso com os dados:\n
Nome: ${user.name}
Email: ${user.email}`);
          })
          .catch((error) => {
            console.error('Erro ao salvar usuário', error);
            return res.status(400).send({ error: 'Registration failed' });
          });
      }
    })
    .catch((error) => {
      console.error('Erro ao consultar usuário no banco de dados', error);
      return res.status(500).send({ error: 'Registration failed' });
    });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (user) {
        bcrypt
          .compare(password, user.password)
          .then((result) => {
            if (result) {
              const tokenData = {
                curso: user.Curso,
                uid: user.id,
                administrador: user.administrador,
              };
              const token = generateToken(tokenData);
              if (user.administrador === false) {
                return res.send({
                  nome: user.name,
                  curso: user.Curso,
                  id: user.id,
                  token: token,
                });
              } else {
                return res.send({
                  token: token,
                  id: user.id,
                  nome: user.name,
                  email: user.email,
                  administrador: user.administrador,
                });
              }
            } else {
              return res.status(400).send({ error: 'Invalid password' });
            }
          })
          .catch((error) => {
            console.error('Erro ao verificar senha', error);
            return res.status(500).send({ error: 'Internal server error' });
          });
      } else {
        return res.status(404).send({ error: 'User not found' });
      }
    })
    .catch((error) => {
      console.error('Erro ao logar', error);
      return res.status(500).send({ error: 'Internal server error' });
    });
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        const token = crypto.randomBytes(20).toString('hex');
        const expiration = new Date();
        expiration.setHours(new Date().getHours() + 3);

        User.findByIdAndUpdate(user.id, {
          $set: {
            passwordResetToken: token,
            passwordResetTokenExpiration: expiration,
          },
        })
          .then(() => {
            Mailer.sendMail(
              {
                to: email,
                from: 'Webmaster@testexpress.com',
                template: 'auth/forgot_password',
                context: { token },
              },
              (error) => {
                if (error) {
                  console.error('Erro ao enviar email', error);
                  return res
                    .status(400)
                    .send({ error: 'Fail sending recover password mail' });
                } else {
                  return res.send();
                }
              },
            );
          })
          .catch((error) => {
            console.error(
              'Erro ao salvar o token de recuperção de senha',
              error,
            );
            return res.status(500).send({ erorr: 'Internal server error' });
          });
      } else {
        return res.status(404).send({ error: 'User not found' });
      }
    })
    .catch((error) => {
      console.error('Erro no forgot password', error);
    });
});

router.post('/reset-password', (req, res) => {
  const { email, token, newPassword } = req.body;

  User.findOne({ email })
    .select('+passwordResetToken passwordResetTokenExpiration')
    .then((user) => {
      if (user) {
        if (
          token != user.passwordResetToken ||
          new Date().now > user.passwordResetTokenExpiration
        ) {
          return res.status(400).send({ error: 'Invalid token' });
        } else {
          user.passwordResetToken = undefined;
          user.passwordResetTokenExpiration = undefined;
          user.password = newPassword;

          user
            .save()
            .then(() => {
              return res.send({ message: 'Senha trocada com sucesso' });
            })
            .catch((error) => {
              console.error('Erro ao salvar nova senha do usuário', error);
              return res.status(500).send({ error: 'Internal server error' });
            });
        }
      } else {
        return res.status(404).send({ error: 'User not found' });
      }
    })
    .catch((error) => {
      console.error('Erro no forgot password', error);
      return res.status(500).send({ error: 'Internal server erro' });
    });
});

export default router;
