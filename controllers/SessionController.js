const passport = require('passport');
const UserDTO = require('../DTO/UserDTO');
const SessionRepository = require('../repositories/SessionRepository');
const SessionDAO = require('../DAO/mongodb/SessionDAO');
const { verifyToken } = require('../services/utils');

class SessionController {
  async register(req, res) {
    const { first_name, last_name, email, age, password } = req.body;

    try {
      await SessionRepository.registerUser(first_name, last_name, email, age, password);

      res.redirect('/login')
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      res.status(400).json({ error: 'Error al registrar el usuario' });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    try {
      const result = await SessionRepository.loginUser(email, password);

      if (!result) {
        return res.status(401).json({ success: false, error: 'Incorrect credentials' });
      }

      const { user, token } = result;

      res.cookie('jwt', token, { httpOnly: true });

      req.session.user = user;
      await SessionDAO.updateLastConnection(user._id, new Date());

      let redirectUrl;
      if (req.session.user.admin || req.session.user.premium) {
        redirectUrl = '/realtimeproducts';
      } else {
        redirectUrl = '/products';
      }

      res.status(200).json({ success: true, redirectUrl });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error logging in' });
    }
  }

  async getCurrentUser(req, res) {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "No autorizado" });
    }

    try {
      const decodedToken = await verifyToken(token);

      if (!decodedToken) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const user = await SessionRepository.getUserById(decodedToken.id);

      if (!user) {
        return res.status(401).json({ error: "No autorizado" });
      }

      // Crear un DTO del usuario
      const userDTO = new UserDTO(user);

      // Devuelve el DTO del usuario
      res.status(200).json(userDTO);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los datos del usuario" });
    }
  }

  async requestPasswordReset(req, res) {
    const { email } = req.body;

    try {
      const message = await SessionRepository.requestPasswordReset(email);
      res.json({ message });
    } catch (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      res.status(500).json({ error: 'Error al solicitar restablecimiento de contraseña' });
    }
  }

  async resetPassword(req, res) {
    const { token } = req.query;
    const { newPassword } = req.body;

    try {
      const message = await SessionRepository.resetPassword(token, newPassword);
      res.json({ message });
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
      res.status(500).json({ error: 'Error al restablecer la contraseña' });
    }
  }

  async updateUserDocuments(req, res) {
    const { uid } = req.params;
    const { documents } = req.body;

    try {
      await SessionRepository.updateUserDocuments(uid, documents);
      res.json({ status: 200, response: 'User documents updated successfully.' });
    } catch (error) {
      res.status(500).json({ status: 500, response: 'Error updating user documents.' });
    }
  }

  logout(req, res) {
    const userId = req.session.user._id;

    res.clearCookie('jwt');
    req.session.destroy();
    SessionRepository.updateLastConnection(userId, new Date()).then(() => {
      res.redirect('/login');
    });
  }

  githubLogin(req, res) {
    passport.authenticate('github', { scope: ['user:email'] });
  }

  githubCallback(req, res) {
    passport.authenticate('github', { failureRedirect: '/login' });
  }

  githubCallbackSuccess(req, res) {
    req.session.user = req.user;
    res.redirect('/products');
  }
}

module.exports = new SessionController();