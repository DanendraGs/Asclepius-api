const express = require('express');
const multer = require('multer');
const tf = require('@tensorflow/tfjs-node');
const uuidv4 = require('uuid').v4;
const { storeData } = require('./storeData'); // Impor fungsi Firestore
const app = express();
const port = 3000;

// Setup multer untuk upload gambar
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
}).single('image');

// Load model TensorFlow.js dari Google Cloud Storage
let model;
async function loadModel() {
    model = await tf.loadGraphModel('https://storage.googleapis.com/asclepius-bucket-dgs/model/model.json');
    console.log('Model loaded successfully');
}
loadModel();

// Endpoint predict (POST)
app.post('/predict', (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000',
            });
        }

        if (err) {
            return res.status(400).json({
                status: 'fail',
                message: 'Terjadi kesalahan dalam mengunggah gambar',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                message: 'Gambar tidak ditemukan dalam permintaan',
            });
        }

        try {
            const imageBuffer = req.file.buffer;
            const imageTensor = tf.node.decodeImage(imageBuffer)
                .resizeBilinear([224, 224])
                .expandDims(0)
                .toFloat();

            const prediction = await model.predict(imageTensor).data();
            const predictionValue = prediction[0];

            const threshold = 0.5;
            const isCancer = predictionValue > threshold;

            const id = uuidv4();
            const result = isCancer ? 'Cancer' : 'Non-cancer';
            const suggestion = isCancer ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.';
            const createdAt = new Date().toISOString();

            // Simpan data ke Firestore
            await storeData(id, { id, result, suggestion, createdAt });

            return res.status(201).json({
                status: 'success',
                message: 'Model is predicted successfully',
                data: { id, result, suggestion, createdAt },
            });
        } catch (error) {
            console.error('Prediction error:', error);
            return res.status(400).json({
                status: 'fail',
                message: 'Terjadi kesalahan dalam melakukan prediksi',
            });
        }
    });
});

// Endpoint GET untuk pengecekan server
app.get('/', (req, res) => {
    res.send('Server berjalan dengan baik!');
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
