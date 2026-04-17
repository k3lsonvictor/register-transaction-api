import { AssemblyAI } from 'assemblyai';

const apiKey = process.env.ASSEMBLYAI_API_KEY ?? 'f5b763360f0540da87b64640d8b790f6';

export const assemblyAiClient = new AssemblyAI({ apiKey });

