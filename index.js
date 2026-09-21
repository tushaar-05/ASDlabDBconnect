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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});