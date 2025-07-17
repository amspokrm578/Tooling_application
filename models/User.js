const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbUtils } = require('../config/database');

class User {
  constructor(id, name, email, password, createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static async findByEmail(email) {
    try {
      const row = await dbUtils.get(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return row ? new User(row.id, row.name, row.email, row.password, row.created_at, row.updated_at) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const row = await dbUtils.get(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return row ? new User(row.id, row.name, row.email, row.password, row.created_at, row.updated_at) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const rows = await dbUtils.query(
        'SELECT id, name, email, created_at, updated_at FROM users ORDER BY created_at DESC'
      );
      return rows.map(row => new User(row.id, row.name, row.email, null, row.created_at, row.updated_at));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const hashedPassword = bcrypt.hashSync(userData.password, 10);
      
      const result = await dbUtils.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [userData.name, userData.email, hashedPassword]
      );
      
      // Return the created user (without password)
      return new User(result.lastID, userData.name, userData.email, null, new Date(), new Date());
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async authenticate(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return null;
      }

      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  static async createSession(userId) {
    try {
      const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const result = await dbUtils.run(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt.toISOString()]
      );
      
      return { token, expiresAt };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  static async validateSession(token) {
    try {
      const row = await dbUtils.get(
        `SELECT s.*, u.id, u.name, u.email, u.created_at, u.updated_at 
         FROM sessions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.token = ? AND s.expires_at > datetime('now')`,
        [token]
      );
      
      if (row) {
        return new User(row.id, row.name, row.email, null, row.created_at, row.updated_at);
      }
      return null;
    } catch (error) {
      console.error('Error validating session:', error);
      throw error;
    }
  }

  static async logout(token) {
    try {
      await dbUtils.run('DELETE FROM sessions WHERE token = ?', [token]);
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  static async update(userId, updateData) {
    try {
      const updates = [];
      const params = [];
      
      if (updateData.name) {
        updates.push('name = ?');
        params.push(updateData.name);
      }
      
      if (updateData.email) {
        updates.push('email = ?');
        params.push(updateData.email);
      }
      
      if (updateData.password) {
        updates.push('password = ?');
        params.push(bcrypt.hashSync(updateData.password, 10));
      }
      
      if (updates.length === 0) {
        throw new Error('No fields to update');
      }
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(userId);
      
      await dbUtils.run(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      
      return await this.findById(userId);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async delete(userId) {
    try {
      // First delete related sessions
      await dbUtils.run('DELETE FROM sessions WHERE user_id = ?', [userId]);
      
      // Then delete the user
      await dbUtils.run('DELETE FROM users WHERE id = ?', [userId]);
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async refreshToken(oldToken) {
    try {
      const user = await this.validateSession(oldToken);
      if (!user) {
        return null;
      }

      // Create new session
      const session = await this.createSession(user.id);
      
      // Remove old session
      await this.logout(oldToken);
      
      return { token: session.token, expiresAt: session.expiresAt };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User; 