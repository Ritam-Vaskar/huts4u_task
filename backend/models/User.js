import db from '../config/database.js';

class User {
  static async create(email, passwordHash, fullName, role = 'student') {
    await db.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, fullName, role]
    );
    // Return the created user by email since MySQL UUID() doesn't return insertId properly
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT id, email, full_name, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.query('SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC');
    return rows;
  }

  static async updateProfile(id, fullName) {
    const [result] = await db.query(
      'UPDATE users SET full_name = ? WHERE id = ?',
      [fullName, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default User;
