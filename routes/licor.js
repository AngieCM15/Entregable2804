const express = require('express'); 
const router = express.Router(); 
const db = require('../config/database'); 

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT
        L.idlicor,
        M.marca,
        L.nombre,
        L.dni,
        L.cantidad,
        L.condicion
      FROM licores L
      INNER JOIN marcas M ON L.idmarca = M.idmarca
    `;
    const [licores] = await db.query(query);
    res.render('index', { licores });
  } catch (error) {
    console.error(error);
    res.status(500).send('Hubo un error al obtener los licores.');
  }
});

router.get('/create', async (req, res) => {
  try {
    const [datos] = await db.query('SELECT * FROM marcas');
    res.render('create', { marcas: datos });
  } catch (error) {
    console.error(error);
    res.status(500).send('Hubo un error al cargar los datos para crear el licor.');
  }
});

router.get('/edit/:id', async (req, res) => {
  try {
    const [datos] = await db.query('SELECT * FROM marcas');
    const [registro] = await db.query('SELECT * FROM licores WHERE idlicor = ?', [req.params.id]);
    res.render('edit', { marcas: datos, licor: registro[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send('Hubo un error al cargar el licor para editar.');
  }
});

router.post('/create', async (req, res) => {
  try {
    const { marcas, nombre, dni, cantidad, condicion } = req.body;

    if (!marcas || !nombre || !dni || !cantidad || !condicion) {
      return res.status(400).send('Todos los campos son requeridos');
    }

    await db.query(
      'INSERT INTO licores (idmarca, nombre, dni, cantidad, condicion) VALUES (?,?,?,?,?)',
      [marcas, nombre, dni, cantidad, condicion]
    );
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Hubo un error al guardar el licor.');
  }
});

router.post('/delete/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM licores WHERE idlicor = ?', [req.params.id]);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Hubo un error al eliminar el licor.');
  }
});

router.post('/edit/:id', async (req, res) => {
  try {
    const { marcas, nombre, dni, cantidad, condicion } = req.body;

    if (!marcas || !nombre || !dni || !cantidad || !condicion) {
      return res.status(400).send('Todos los campos son requeridos');
    }

    await db.query(
      'UPDATE licores SET idmarca = ?, nombre = ?, dni = ?, cantidad = ?, condicion = ? WHERE idlicor = ?',
      [marcas, nombre, dni, cantidad, condicion, req.params.id]
    );
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Hubo un error al actualizar el licor.');
  }
});

module.exports = router;
