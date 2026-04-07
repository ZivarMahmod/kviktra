import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  return new Anthropic({ apiKey });
};

router.post('/generate-description', async (req: Request, res: Response) => {
  try {
    const { trade, companyName, jobNotes, customerName, address, items } = req.body;

    const itemList = items
      .map((item: { type: string; desc: string; qty: number; unit: number }) =>
        `- ${item.type}: ${item.desc} (${item.qty} st x ${item.unit} kr)`
      )
      .join('\n');

    const prompt = `Du är en professionell offertskrivare för svenska hantverkare inom ${trade}.

Skriv en professionell arbetsbeskrivning för en offert baserat på följande information:

Företag: ${companyName}
Kund: ${customerName}
Adress: ${address}

Hantverkarens anteckningar:
${jobNotes}

Arbetsrader:
${itemList}

Regler:
- Skriv professionellt men inte stelt
- Var specifik och teknisk om arbetet
- Inkludera INTE priser i beskrivningen
- Skriv på svenska
- Max 200 ord
- Beskriv arbetet som ska utföras, material som ingår, och eventuella förberedelser`;

    const client = getClient();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    const description = textBlock ? textBlock.text : '';

    res.json({ description });
  } catch (error) {
    console.error('Error generating description:', error);
    res.status(500).json({ error: 'Failed to generate description' });
  }
});

router.post('/generate-emails', async (req: Request, res: Response) => {
  try {
    const { trade, companyName, customerName, jobNotes, amount, phone, rotEnabled } = req.body;

    const rotText = rotEnabled ? 'ROT-avdrag är inkluderat i offerten.' : '';

    const prompt = `Du är en professionell uppföljningsexpert för svenska hantverkare inom ${trade}.

Skapa 3 uppföljningsmejl för en offert som skickats till en kund.

Information:
- Företag: ${companyName}
- Kund: ${customerName}
- Jobb: ${jobNotes}
- Offertbelopp: ${amount} kr
- Telefon: ${phone}
${rotText}

Skapa exakt 3 mejl:
1. Dag 3: Vänlig uppföljning, fråga om kunden har frågor
2. Dag 7: Påminnelse, nämn giltighetstid, erbjud att ringa för att diskutera
3. Dag 14: Sista uppföljning, professionell men med viss brådska

Regler:
- Skriv på svenska
- Professionellt men personligt
- Signera med ${companyName}
- Varje mejl max 120 ord
- Inkludera ämnesrad för varje mejl

Svara i exakt detta JSON-format (inget annat):
[
  {"day": 3, "subject": "...", "body": "..."},
  {"day": 7, "subject": "...", "body": "..."},
  {"day": 14, "subject": "...", "body": "..."}
]`;

    const client = getClient();
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    const text = textBlock ? textBlock.text : '[]';

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const emails = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    res.json({ emails });
  } catch (error) {
    console.error('Error generating emails:', error);
    res.status(500).json({ error: 'Failed to generate emails' });
  }
});

export { router as generateRouter };
