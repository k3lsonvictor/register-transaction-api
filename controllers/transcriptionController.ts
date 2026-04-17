import fs from 'fs';
import { RequestHandler } from 'express';
import { assemblyAiClient } from '../services/assemblyAiClient';
import { convertToMp3 } from '../services/audioConversion';
import { createTransaction } from '../repositories/transactionsRepository';

export const transcribeAudio: RequestHandler = async (req, res) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    res.status(400).json({ error: 'Arquivo de áudio não enviado' });
    return;
  }

  const audioPath = file.path;
  const mp3Path = `${audioPath}.mp3`;

  try {
    await convertToMp3(audioPath, mp3Path);

    const transcript = await assemblyAiClient.transcripts.transcribe({
      audio: fs.createReadStream(mp3Path),
      language_code: 'pt',
    });

    if (transcript.status === 'error') {
      res.status(500).json({ error: 'Erro ao transcrever o áudio' });
      return;
    }

    if (!transcript.text || transcript.text.trim() === '') {
      res
        .status(400)
        .json({ error: 'A transcrição retornou vazia. Verifique o áudio enviado.' });
      return;
    }

    const transcription = transcript.text.replace(
      /(\d+)\s+e\s+(\d+)/gi,
      '$1,$2'
    );

    const regex =
      /^\s*([\p{L}\p{M}]+).*?(?:R\$)?\s*(\d+(?:[.,]\d+)?)(?:\s*reais)?\s.*?(?:banco|cartão)\s+([\p{L}\p{M}\s]+)\.?\s*$/iu;
    const match = transcription.match(regex);

    if (!match) {
      res.status(400).json({ error: 'Formato de transcrição inválido' });
      return;
    }

    const [, title, amount, bank] = match;
    const formattedAmount = Number.parseFloat(amount.replace(',', '.'));

    const newTransaction = createTransaction({
      title,
      amount: formattedAmount,
      bank: bank.trim(),
      date: new Date().toISOString(),
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar o áudio' });
  } finally {
    try {
      fs.unlinkSync(audioPath);
    } catch {}
    try {
      if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
    } catch {}
  }
};

