const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destinationPath(file));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.body);
  console.log(req.file);
  res.status(200).json({ message: 'Archivo cargado exitosamente' });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

function destinationPath(file) {
  try {
    const extname = path.extname(file.originalname).toLowerCase();
    const destination = ['jpg', '.jpeg', '.png', '.gif'].includes(extname)
      ? "./src/assets/images/bills"
      : "./src/assets/documents";
    
    console.log('Destination:', destination);
    return destination;
  } catch (error) {
    console.error('Error constructing destination path:', error);
    return "./src/assets/documents";
  }
}