const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Configuración de la base de datos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'entregable'
});

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Para servir imágenes
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Verificar conexión
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('Conexión MySQL exitosa');
    conn.release();
  } catch (error) {
    console.error('Error de conexión:', error);
  }
}
testConnection();

// =================== RUTAS ===================

// Página principal - Lista de licores
app.get('/', async (req, res) => {
  const [licores] = await pool.query(`
    SELECT l.*, m.marca 
    FROM licores l 
    JOIN marcas m ON l.idmarca = m.idmarca
  `);
  res.render('index', { licores });
});

// Mostrar formulario para crear nuevo licor
app.get('/create', async (req, res) => {
  const [marcas] = await pool.query('SELECT * FROM marcas');
  res.render('create', { marcas });
});

// Registrar nuevo licor
app.post('/create', upload.single('imagen'), async (req, res) => {
  const { marcas, licor, dni, cantidad, condicion } = req.body;
  const imagen = req.file ? req.file.filename : null;

  if (!marcas || !licor || !dni || !cantidad || !condicion) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
  }

  try {
    await pool.query(
      'INSERT INTO licores (idmarca, nombre, dni, cantidad, condicion, imagen) VALUES (?, ?, ?, ?, ?, ?)',
      [marcas, licor, dni, cantidad, condicion, imagen]
    );
    res.json({ success: true, message: 'Licor registrado con éxito.' });
  } catch (error) {
    console.error('Error al guardar el licor:', error);
    res.json({ success: false, message: 'Hubo un error al guardar el licor.' });
  }
});

// Mostrar formulario para editar un licor
app.get('/edit/:id', async (req, res) => {
  const [bebida] = await pool.query('SELECT * FROM licores WHERE idlicor = ?', [req.params.id]);
  const [marcas] = await pool.query('SELECT * FROM marcas');
  if (bebida.length === 0) return res.status(404).send('Licor no encontrado');
  res.render('edit', { bebida: bebida[0], marcas });
});

// Actualizar licor existente
app.post('/edit/:id', upload.single('imagen'), async (req, res) => {
  const { marcas, licor, dni, cantidad, condicion } = req.body;
  const imagen = req.file ? req.file.filename : null;

  if (!marcas || !licor || !dni || !cantidad || !condicion) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
  }

  try {
    // Obtener imagen anterior (si existe) para borrarla si se actualiza
    const [old] = await pool.query('SELECT imagen FROM licores WHERE idlicor = ?', [req.params.id]);
    const oldImage = old[0]?.imagen;

    let query, params;
    if (imagen) {
      // Borrar imagen anterior
      if (oldImage) {
        const oldPath = path.join(__dirname, 'uploads', oldImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      query = `UPDATE licores SET idmarca = ?, nombre = ?, dni = ?, cantidad = ?, condicion = ?, imagen = ? WHERE idlicor = ?`;
      params = [marcas, licor, dni, cantidad, condicion, imagen, req.params.id];
    } else {
      query = `UPDATE licores SET idmarca = ?, nombre = ?, dni = ?, cantidad = ?, condicion = ? WHERE idlicor = ?`;
      params = [marcas, licor, dni, cantidad, condicion, req.params.id];
    }

    await pool.query(query, params);
    res.json({ success: true, message: 'Licor actualizado con éxito.' });
  } catch (error) {
    console.error('Error al actualizar el licor:', error);
    res.json({ success: false, message: 'Hubo un error al actualizar el licor.' });
  }
});

// Eliminar licor
app.get('/delete/:id', async (req, res) => {
  try {
    // Eliminar imagen del disco si existe
    const [registro] = await pool.query('SELECT imagen FROM licores WHERE idlicor = ?', [req.params.id]);
    const imagen = registro[0]?.imagen;
    if (imagen) {
      const filePath = path.join(__dirname, 'uploads', imagen);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM licores WHERE idlicor = ?', [req.params.id]);
    res.redirect('/');
  } catch (error) {
    console.error('Error al eliminar el licor:', error);
    res.redirect('/');
  }
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
