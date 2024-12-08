// Mengimpor firestore dari file firebase.js
const { firestore } = require('./firebase'); // Pastikan Anda sudah mengonfigurasi firebase.js dengan benar

// Fungsi untuk menyimpan data prediksi ke Firestore
async function storeData(id, data) {
  try {
    // Menyimpan data prediksi ke koleksi 'predictions'
    await firestore.collection('predictions').doc(id).set(data);
    console.log('Data berhasil disimpan ke Firestore');
  } catch (error) {
    console.error('Terjadi kesalahan saat menyimpan data ke Firestore:', error);
    throw error; // Meneruskan error agar bisa ditangani oleh pemanggil fungsi
  }
}

// Fungsi untuk mengambil data riwayat prediksi dari Firestore
async function getData() {
  try {
    const snapshot = await firestore.collection('predictions').get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return data;
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil data dari Firestore:', error);
    throw error; // Meneruskan error agar bisa ditangani oleh pemanggil fungsi
  }
}

module.exports = { storeData, getData };
