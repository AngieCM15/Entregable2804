const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const rutaLicor = require('./routes/licor')
// const rutaMarca = require('./routes/marca')

const app = express();
const PORT = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Configuración de rutas
app.use('/', rutaLicor)         
// app.use('/api/marcas', rutaMarca)  

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:3000`)
});
