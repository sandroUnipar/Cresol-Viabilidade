import express from 'express';
import pkg from 'pg';
import cors from 'cors'; // 1. IMPORTAR o pacote cors

const { Pool } = pkg;
const app = express();

// 2. USAR O CORS
// Esta linha adiciona os cabeçalhos de permissão à sua API
app.use(cors());

app.use(express.json());

// O resto do seu código permanece igual...
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Endpoint para salvar a decisão
app.post('/api/save-decision', async (req, res) => {
    const { processName, status, parecer, score, evaluator } = req.body;

    if (!processName || !status || !evaluator || score === undefined) {
        return res.status(400).json({ success: false, error: "Dados incompletos." });
    }

    const query = `
        INSERT INTO public.processos_automacao 
        (nome_processo, status, avaliador, pontuacao_final, dados_respostas_qualitativas, data_avaliacao)
        VALUES ($1, $2, $3, $4, $5, NOW())
    `;
    const values = [processName, status, evaluator, score, JSON.stringify({ parecer })];

    try {
        const client = await pool.connect();
        await client.query(query, values);
        client.release();
        res.status(200).json({ success: true, message: "Decisão salva com sucesso!" });
    } catch (err) {
        console.error("Erro ao inserir na base de dados:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Endpoint para buscar o histórico
app.get('/api/history', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM public.processos_automacao ORDER BY data_avaliacao DESC');
        client.release();
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API a rodar na porta ${PORT}`));