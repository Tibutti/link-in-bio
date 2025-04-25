import fetch from 'node-fetch';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

export async function queryPerplexity(
  messages: PerplexityMessage[],
  options: {
    temperature?: number;
    max_tokens?: number;
  } = {}
): Promise<PerplexityResponse> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY environment variable is not set');
  }

  const { temperature = 0.2, max_tokens } = options;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages,
      temperature,
      max_tokens,
      frequency_penalty: 1,
      presence_penalty: 0,
      top_p: 0.9,
      top_k: 0,
      stream: false,
      return_images: false,
      return_related_questions: false
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
  }

  return await response.json() as PerplexityResponse;
}

// Funkcja do analizy usterki i sugerowania rozwiązań
export async function analyzeIssue(
  title: string,
  description?: string,
  severity?: string
): Promise<string> {
  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content: 
        'Jesteś asystentem AI, który analizuje zgłoszenia usterek w serwisie internetowym i ' +
        'sugeruje możliwe rozwiązania. Podaj szczegółową analizę problemu i konkretne ' +
        'kroki, które można podjąć, aby go rozwiązać. Twoja odpowiedź powinna być ' +
        'techniczna, ale zrozumiała dla osoby znającej podstawy programowania. Podziel ' +
        'odpowiedź na sekcje: "Analiza problemu", "Możliwe przyczyny" i "Sugerowane rozwiązania".'
    },
    {
      role: 'user',
      content: `Proszę o analizę następującej usterki:
Tytuł: ${title}
${description ? `Opis: ${description}` : ''}
${severity ? `Priorytet: ${severity}` : ''}
`
    }
  ];

  try {
    const result = await queryPerplexity(messages, { temperature: 0.2 });
    return result.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing issue with Perplexity:', error);
    return 'Wystąpił błąd podczas analizy usterki. Spróbuj ponownie później.';
  }
}