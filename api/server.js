import express from 'express';
import bodyParser from 'body-parser';
import odbc from 'odbc';

const app = express();
app.use(bodyParser.json());

app.post('/api/save-decision', async (req, res) => {
    const { processName, status, parecer, score, evaluator } = req.body;

    try {
        const connection = await odbc.connect('DSN=PostgreSQL30');
        await connection.query(`
            INSERT INTO public.processos_automacao 
            (nome_processo, status, avaliador, pontuacao_final, dados_respostas_qualitativas)
            VALUES (?, ?, ?, ?, ?)
        `, [
            processName,
            status,
            evaluator,
            score,
            JSON.stringify({ parecer })
        ]);
        await connection.close();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
});

app.listen(3000, () => console.log('API rodando na porta 3000'));
