import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import axios from 'axios';
import multer from 'multer';
const app = express()
const PORT = 4000
import ffmpeg from 'fluent-ffmpeg';
import FormData from 'form-data'; 
import { AssemblyAI } from 'assemblyai';

const convertToMp3 = (inputPath: string, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
};

const client = new AssemblyAI({
  apiKey: 'f5b763360f0540da87b64640d8b790f6',
});

app.use(cors({ origin: '*' }));
app.use(express.json());

const DB_FILE = './transactions.json';
const upload = multer({ dest: 'uploads/' });

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDB = (data: any) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

interface TransactionInput {
  title: string;
  amount: number;
  bank: string;
  date?: Date;
}

// Listar transações
app.get('/transactions', (req, res) => {
  const data = readDB();
  res.json(data);
});

// Criar transação
app.post('/transactions', (req: Request<{}, {}, TransactionInput>, res) => {
  console.log(req.body);
  const data = readDB();
  const newTransaction = { 
    id: Date.now(), 
    date: req.body.date ? new Date(req.body.date).toISOString() : new Date().toISOString(), 
    ...req.body 
  };
  data.push(newTransaction);
  writeDB(data);
  res.status(201).json(newTransaction);
});

// Atualizar transação
app.patch('/transactions/:id', (req: Request<{ id: string }, {}, TransactionInput>, res: Response): any => {
  const data = readDB();
  const id = parseInt(req.params.id);
  const index = data.findIndex((t: any) => t.id === id);

  if (index === -1) return res.status(404).json({ error: 'Transação não encontrada' });

  data[index] = { ...data[index], ...req.body };
  writeDB(data);
  res.json(data[index]);
});

// Deletar transação
app.delete('/transactions/:id', (req: Request<{ id: string }>, res: Response): any => {
  let data = readDB();
  const id = parseInt(req.params.id);
  const initialLength = data.length;

  data = data.filter((t: any) => t.id !== id);

  if (data.length === initialLength) return res.status(404).json({ error: 'Transação não encontrada' });

  writeDB(data);
  res.status(204).end();
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

app.post('/transcribe-audio', upload.single('audio'), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'Arquivo de áudio não enviado' });
    return;
  }

  const audioPath = req.file.path;
  const mp3Path = `${audioPath}.mp3`;

  try {
    // Converte o áudio para MP3
    console.log('Convertendo áudio para MP3...');
    await convertToMp3(audioPath, mp3Path);

    // Enviando o arquivo para AssemblyAI
    console.log('Enviando arquivo de áudio para transcrição...');
    const params = {
      audio: fs.createReadStream(mp3Path), // Envia o arquivo convertido
      language_code: 'pt', // Define o idioma como português
    };

    const transcript = await client.transcripts.transcribe(params);
    console.log('Resposta do AssemblyAI:', transcript);

    if (transcript.status === 'error') {
      console.error(`Transcription failed: ${transcript.error}`);
      res.status(500).json({ error: 'Erro ao transcrever o áudio' });
      return;
    }

    if (!transcript.text || transcript.text.trim() === '') {
      console.error('A transcrição retornou vazia.');
      res.status(400).json({ error: 'A transcrição retornou vazia. Verifique o áudio enviado.' });
      return;
    }

    console.log('Transcrição recebida:', transcript.text);

    // Processando a transcrição com regex
    const transcription = transcript.text
  .replace(/(\d+)\s+e\s+(\d+)/gi, '$1,$2'); // substitui "11 e 73" por "11,73"

  const regex = /^\s*([\p{L}\p{M}]+).*?(?:R\$)?\s*(\d+(?:[.,]\d+)?)(?:\s*reais)?\s.*?(?:banco|cartão)\s+([\p{L}\p{M}\s]+)\.?\s*$/iu;
  const match = transcription.match(regex);

    console.log('match', match);

    if (!match) {
      res.status(400).json({ error: 'Formato de transcrição inválido' });
      return;
    }

    const [_, title, amount, bank] = match;

    // Substitui vírgula por ponto no valor capturado
    const formattedAmount = parseFloat(amount.replace(',', '.')); // Converte para número

    // Criando a nova transação
    const newTransaction = {
      id: Date.now(),
      title,
      amount: formattedAmount, // Usa o valor formatado
      bank: bank.trim(), // Remove espaços extras
      date: new Date().toISOString(),
    };

    // Lendo o arquivo transactions.json
    const data = readDB();
    data.push(newTransaction); // Adicionando a nova transação
    writeDB(data); // Salvando no arquivo

    console.log('Nova transação criada:', newTransaction);

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar o áudio' });
  } finally {
    // Limpeza dos arquivos temporários
    fs.unlinkSync(audioPath);
    if (fs.existsSync(mp3Path)) {
      fs.unlinkSync(mp3Path);
    }
  }
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
