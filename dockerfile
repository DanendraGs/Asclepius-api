# Gunakan image resmi Node.js
FROM node:18

# Set direktori kerja di dalam container
WORKDIR /usr/src/app

# Salin package.json dan install dependencies
COPY package*.json ./
RUN npm install

# Salin sisa aplikasi ke dalam container
COPY . .

# Expose port 3000 (sesuaikan dengan port aplikasi Anda)
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "app.js"]