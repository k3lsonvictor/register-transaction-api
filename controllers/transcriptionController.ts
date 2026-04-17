import fs from 'fs';
import { RequestHandler } from 'express';
import { assemblyAiClient } from '../services/assemblyAiClient';
import { convertToMp3 } from '../services/audioConversion';
import { createTransaction } from '../repositories/transactionsRepository';

export const transcribeAudio: RequestHandler = async (req, res) => {
  console.log('[transcribe-audio] request', {
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
  });
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    console.log('[transcribe-audio] sem arquivo (campo esperado: audio)');
    res.status(400).json({ error: 'Arquivo de áudio não enviado' });
    return;
  }

  const audioPath = file.path;
  const mp3Path = `${audioPath}.mp3`;
  console.log('[transcribe-audio] arquivo recebido', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    audioPath,
    mp3Path,
  });

  try {
    console.log('[transcribe-audio] convertendo para mp3...');
    await convertToMp3(audioPath, mp3Path);
    console.log('[transcribe-audio] conversão ok, transcrevendo...');

    const transcript = await assemblyAiClient.transcripts.transcribe({
      audio: fs.createReadStream(mp3Path),
      language_code: 'pt',
    });
    console.log('[transcribe-audio] assemblyai resposta', {
      status: transcript.status,
      id: (transcript as any).id,
      error: (transcript as any).error,
    });

    if (transcript.status === 'error') {
      console.log('[transcribe-audio] transcrição com erro', (transcript as any).error);
      res.status(500).json({ error: 'Erro ao transcrever o áudio' });
      return;
    }

    if (!transcript.text || transcript.text.trim() === '') {
      console.log('[transcribe-audio] texto vazio');
      res
        .status(400)
        .json({ error: 'A transcrição retornou vazia. Verifique o áudio enviado.' });
      return;
    }

    console.log('[transcribe-audio] texto transcrito', transcript.text);
    const transcription = transcript.text.replace(
      /(\d+)\s+e\s+(\d+)/gi,
      '$1,$2'
    );
    console.log('[transcribe-audio] texto normalizado', transcription);

    const regex =
      /^\s*([\p{L}\p{M}]+).*?(?:R\$)?\s*(\d+(?:[.,]\d+)?)(?:\s*reais)?\s.*?(?:banco|cartão)\s+([\p{L}\p{M}\s]+)\.?\s*$/iu;
    const match = transcription.match(regex);
    console.log('[transcribe-audio] regex match', match);

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

    console.log('[transcribe-audio] transaction criada', newTransaction);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('[transcribe-audio] erro', error);
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

