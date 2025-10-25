import db from '../config/database.js';

class Resource {
  static async create(resourceData) {
    const { title, description, fileUrl, publicId, fileType, fileSize, uploadedBy } = resourceData;
    
    await db.query(
      `INSERT INTO resources (title, description, file_url, public_id, file_type, file_size, uploaded_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [title, description, fileUrl, publicId, fileType, fileSize, uploadedBy]
    );
    
    // Return the created resource by finding the most recent one for this user
    const [rows] = await db.query(
      'SELECT * FROM resources WHERE uploaded_by = ? AND file_url = ? ORDER BY uploaded_at DESC LIMIT 1',
      [uploadedBy, fileUrl]
    );
    
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM resources WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM resources ORDER BY uploaded_at DESC');
    return rows;
  }

  static async findByStatus(status) {
    const [rows] = await db.query('SELECT * FROM resources WHERE status = ? ORDER BY uploaded_at DESC', [status]);
    return rows;
  }

  static async findByUser(userId) {
    const [rows] = await db.query('SELECT * FROM resources WHERE uploaded_by = ? ORDER BY uploaded_at DESC', [userId]);
    return rows;
  }

  static async findApproved() {
    const [rows] = await db.query('SELECT * FROM resources WHERE status = "approved" ORDER BY uploaded_at DESC');
    return rows;
  }

  static async updateStatus(id, status, reviewedBy) {
    const [result] = await db.query(
      `UPDATE resources 
       SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ? 
       WHERE id = ?`,
      [status, reviewedBy, id]
    );
    return result.affectedRows > 0;
  }

  static async update(id, updateData) {
    const { title, description } = updateData;
    const [result] = await db.query(
      'UPDATE resources SET title = ?, description = ? WHERE id = ?',
      [title, description, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM resources WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async searchResources(searchQuery, fileType = null) {
    let query = `SELECT * FROM resources WHERE status = 'approved' AND (title LIKE ? OR description LIKE ?)`;
    let params = [`%${searchQuery}%`, `%${searchQuery}%`];

    if (fileType && fileType !== 'all') {
      query += ' AND file_type = ?';
      params.push(fileType);
    }

    query += ' ORDER BY uploaded_at DESC';

    const [rows] = await db.query(query, params);
    return rows;
  }
}

export default Resource;
