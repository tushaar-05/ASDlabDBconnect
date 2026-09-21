import { Pool } from 'pg';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'localhost',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT, 10),
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assignments');

    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/assignments', async (req, res) => {
  try {
    const { title, deadline } = req.body;

    console.log(title, deadline);

    await pool.query(
      `INSERT INTO assignments (title, deadline) VALUES ($1, $2)`,
      [title, deadline]
    );

    console.log('Assignment created successfully');

    res.status(201).send('Assignment created successfully');
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.patch('/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE assignments
      SET submitted = true
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Assignment not found');
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM assignments
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Assignment not found'
      });
    }

    res.json({
      message: 'Assignment deleted successfully',
      assignment: result.rows[0]
    });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});