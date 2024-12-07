const { Firestore } = require('@google-cloud/firestore');

// Inisialisasi Firestore dengan Service Account
const db = new Firestore({
    projectId: 'peak-catbird-444004-j0', // Ganti dengan Project ID Firestore Anda
    keyFilename: './key-firestore.json', // Path ke Service Account Key
});

// Fungsi untuk menyimpan data ke Firestore
async function storeData(id, data) {
    const predictCollection = db.collection('predictions');
    return predictCollection.doc(id).set(data);
}

// Fungsi untuk mengambil semua data dari Firestore
const getData = async () => {
    const snapshotPredictions = await db.collection('predictions').get();
    const histories = snapshotPredictions.docs.map((doc) => ({
        id: doc.id,
        history: doc.data(),
    }));
    return histories;
};

module.exports = { storeData, getData };
