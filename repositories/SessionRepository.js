const SessionDAO = require('../DAO/SessionDAO');

class SessionRepository {
  async loginUser(email, password) {
    return await SessionDAO.loginUser(email, password);
  }

  async getUserById(userId) {
    return await SessionDAO.getUserById(userId);
  }
  
  async registerUser(first_name, last_name, email, age, password, cart) {
    return await SessionDAO.registerUser(first_name, last_name, email, age, password, cart);
  }
}

module.exports = new SessionRepository();