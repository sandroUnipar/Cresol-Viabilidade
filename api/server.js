import express from 'express';
import pkg from 'pg';

const { Pool } = pkg;
const app = express();
app.use(express.json());

// Configuração da ligação à base de dados a partir da variável de ambiente do Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Endpoint para salvar a decisão
app.post('/api/save-decision', async (req, res) => {
    const { processName, status, parecer, score, evaluator } = req.body;

    // Validação básica
    if (!processName || !status || !evaluator || score === undefined) {
        return res.status(400).json({ success: false, error: "Dados incompletos." });
    }

    const query = `
        INSERT INTO public.processos_automacao 
        (nome_processo, status, avaliador, pontuacao_final, dados_respostas_qualitativas, data_avaliacao)
        VALUES ($1, $2, $3, $4, $5, NOW())
    `;
    
    const values = [
        processName,
        status,
        evaluator,
        score,
        JSON.stringify({ parecer }) // Salva o parecer como um JSON
    ];

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

// Endpoint de "saúde" para verificar se a API está no ar
app.get('/api/health', (req, res) => {
    res.status(200).send('API está funcionando!');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API a rodar na porta ${PORT}`));