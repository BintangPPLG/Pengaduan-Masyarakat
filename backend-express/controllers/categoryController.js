const db = require('../config/db');

const getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createCategory = async (req, res) => {
  const { category_name } = req.body;

  if (!category_name) {
    return res.status(400).json({ message: 'Nama kategori wajib diisi' });
  }

  try {
    const [result] = await db.query('INSERT INTO categories (category_name) VALUES (?)', [category_name]);
    res.status(201).json({ message: 'Kategori berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { category_name } = req.body;

  if (!category_name) {
    return res.status(400).json({ message: 'Nama kategori wajib diisi' });
  }

  try {
    const [rows] = await db.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    await db.query('UPDATE categories SET category_name = ? WHERE id = ?', [category_name, id]);
    res.json({ message: 'Kategori berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
