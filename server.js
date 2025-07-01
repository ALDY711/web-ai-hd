import express from "express";
import Replicate from "replicate";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Inisialisasi
const app = express();
const port = 3000;
const replicate = new Replicate(); // Token diambil dari environment variable REPLICATE_API_TOKEN

// Konfigurasi untuk menangani __dirname di ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi Multer untuk menyimpan file sementara di memori
const upload = multer({ storage: multer.memoryStorage() });

// Menyajikan file statis (HTML, CSS) dari folder 'public'
app.use(express.static(path.join(__dirname, "public")));

// Route untuk menangani proses upscale gambar
app.post("/upscale", upload.single("image_file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("Tidak ada file yang diunggah.");
    }

    try {
        console.log("Mulai memproses gambar...");

        // Replicate API membutuhkan data gambar dalam format Base64.
        const base64image = req.file.buffer.toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${base64image}`;

        // Menjalankan model Real-ESRGAN di Replicate
        const output = await replicate.run(
            "xinntao/realesrgan:1b976a4d456ed9e4d1a846597b7614e79eadad3032e9124fa63859db0fd59b56",
            {
                input: {
                    img: dataURI,
                    version: "Anime - anime6B"
                }
            }
        );

        console.log("Proses selesai. URL output:", output);

        // Mengirimkan URL gambar hasil upscale kembali ke pengguna
        res.json({ imageUrl: output });

    } catch (error) {
        console.error("Error saat memproses di Replicate:", error);
        res.status(500).send("Terjadi kesalahan saat memproses gambar.");
    }
});
// TAMBAHKAN BARIS INI
export default app;
