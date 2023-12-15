const User = require('../../models/UserModel');

class UserDAO {
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      throw new Error("Error al obtener los datos del usuario");
    }
  }

  async getAllUsers() {
    try {
      const users = await User.find();

      const simplifiedUsers = users.map(user => ({
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        last_connection: user.last_connection
      }));

      return simplifiedUsers;
    } catch (error) {
      console.error('Error en getAllUsers:', error);
      throw new Error('Error al obtener todos los usuarios');
    }
  }

  async getInactiveUsers(minutes) {
    const cutoffTime = new Date(Date.now() - minutes * 60000); // Calcula la fecha límite en minutos
    try {
      const inactiveUsers = await User.find({ lastLogin: { $lt: cutoffTime } });
      return inactiveUsers;
    } catch (error) {
      throw new Error('Error al obtener usuarios inactivos');
    }
  }

  async deleteUserById(userId) {
    try {
      await User.findByIdAndDelete(userId);
    } catch (error) {
      throw new Error('Error al eliminar usuario por ID');
    }
  }

  async updateUserDocuments(userId, documents) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.documents = documents;
        await user.save();
      }
    } catch (error) {
      console.error('Error updating user documents:', error);
      throw new Error('Error updating user documents');
    }
  }
}

module.exports = new UserDAO();