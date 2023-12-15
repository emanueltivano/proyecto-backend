const SessionDAO = require('../DAO/mongodb/SessionDAO');

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
  
  async requestPasswordReset(email) {
    return await SessionDAO.requestPasswordReset(email);
  }
  
  async resetPassword(token, newPassword) {
    return await SessionDAO.resetPassword(token, newPassword);
  }
  
  async updateLastConnection(userId, lastConnection) {
    return await SessionDAO.updateLastConnection(userId, lastConnection);
  }
}

module.exports = new SessionRepository();