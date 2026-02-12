// Migrated to Server-Side Execution for Security

export const generateEcoAnalysis = async (userPrompt: string): Promise<string> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt })
    });

    if (!response.ok) throw new Error('Analysis Request Failed');

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Unable to process environmental data at this moment. Please retry.";
  }
};

export const generateSpeech = async (text: string, articleId?: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, articleId })
    });

    if (!response.ok) throw new Error('Speech Request Failed');

    const data = await response.json();
    return data.audioData;
  } catch (error) {
    console.error("Speech Error:", error);
    return null;
  }
};