import express from 'express';
import cors from 'cors';
import { transactionsRoutes } from './routes/transactionsRoutes';
import { transcriptionRoutes } from './routes/transcriptionRoutes';

const app = express();
const PORT = 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use(transactionsRoutes);
app.use(transcriptionRoutes);

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});

// app.post('/transcribe-audio', upload.single('audio'), (req, res) => {
//   (async () => {
//     if (!req.file) {
//       return res.status(400).json({ error: 'Arquivo de áudio não enviado' });
//     }

//     const audioPath = req.file.path;

//     try {
//       // Criando o FormData para enviar o arquivo diretamente
//       const formData = new FormData();
//       formData.append('audio', fs.createReadStream(audioPath)); // Envia o arquivo como stream

//       console.log('Enviando arquivo de áudio para transcrição...');
//       const response = await axios.post('http://localhost:5001/transcribe', formData, {
//         headers: formData.getHeaders(), // Inclua os cabeçalhos gerados pelo FormData
//       });
//       console.log('Transcrição recebida:', response.data);

//       // Processando a transcrição com regex
//       const transcription = response.data.transcription; // Supondo que a transcrição vem no campo 'transcription'
//       const regex = /^\s*(\w+).*?(\d+)\s*reais.*?banco\s+(.+)$/i;
//       const match = transcription.match(regex);
//       console.log("match", match);

//       if (!match) {
//         return res.status(400).json({ error: 'Formato de transcrição inválido' });
//       }

//       const [_, title, amount, bank] = match;

//       // Criando a nova transação
//       const newTransaction = {
//         id: Date.now(),
//         title,
//         amount: parseFloat(amount), // Converte o valor para número
//         bank,
//         date: new Date().toISOString(),
//       };

//       // Lendo o arquivo transactions.json
//       const data = readDB();
//       data.push(newTransaction); // Adicionando a nova transação
//       writeDB(data); // Salvando no arquivo

//       console.log('Nova transação criada:', newTransaction);

//       res.status(201).json(newTransaction);

//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Erro ao processar o áudio' });
//     } finally {
//       // Limpeza do arquivo temporário
//       fs.unlinkSync(audioPath);
//     }
//   })();
// });

// app.post('/transcribe-audio', upload.single('audio'), async (req, res): Promise<void> => {
//   if (!req.file) {
//     res.status(400).json({ error: 'Arquivo de áudio não enviado' });
//     return;
//   }

//   const audioPath = req.file.path;

//   try {
//     // Enviando o arquivo para AssemblyAI
//     console.log('Enviando arquivo de áudio para transcrição...');
//     const params = {
//       audio: fs.createReadStream(audioPath), // Envia o arquivo como stream
//     };

//     const transcript = await client.transcripts.transcribe(params);
//     console.log(transcript)

//     if (transcript.status === 'error') {
//       console.error(`Transcription failed: ${transcript.error}`);
//       res.status(500).json({ error: 'Erro ao transcrever o áudio' });
//     }

//     console.log('Transcrição recebida:', transcript.text);

//     // Processando a transcrição com regex
//     const transcription = transcript.text; // Texto transcrito
//     const regex = /^\s*(\w+).*?(\d+)\s*reais.*?banco\s+(.+)$/i;
//     if (!transcription) {
//       res.status(400).json({ error: 'Transcrição não encontrada ou inválida' });
//       return;
//     }
//     const match = transcription.match(regex);

//     console.log('match', match);

//     if (!match) {
//       res.status(400).json({ error: 'Formato de transcrição inválido' });
//     }

//     if (!match) {
//       res.status(400).json({ error: 'Formato de transcrição inválido' });
//       return;
//     }
//     const [_, title, amount, bank] = match;

//     // Criando a nova transação
//     const newTransaction = {
//       id: Date.now(),
//       title,
//       amount: parseFloat(amount), // Converte o valor para número
//       bank: bank.trim(), // Remove espaços extras
//       date: new Date().toISOString(),
//     };

//     // Lendo o arquivo transactions.json
//     const data = readDB();
//     data.push(newTransaction); // Adicionando a nova transação
//     writeDB(data); // Salvando no arquivo

//     console.log('Nova transação criada:', newTransaction);

//     res.status(201).json(newTransaction);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Erro ao processar o áudio' });
//   } finally {
//     // Limpeza do arquivo temporário
//     fs.unlinkSync(audioPath);
//   }
// });
