import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, type = 'chat' } = await req.json();

    let systemPrompt = '';
    let userPrompt = message;

    switch (type) {
      case 'chat':
        systemPrompt = `You are MindMate, a compassionate AI companion focused on emotional wellness and personal growth. You help users through empathetic conversation, drawing insights from their journal entries and mood patterns when provided.

Key traits:
- Warm, empathetic, and non-judgmental
- Professional yet personal tone
- Focus on emotional support and growth
- Reference user's context naturally when relevant
- Ask thoughtful follow-up questions
- Validate feelings while encouraging positive patterns

Context: ${context ? JSON.stringify(context) : 'No previous context available'}

Respond naturally and supportively, keeping responses conversational and helpful.`;
        break;

      case 'analyze_journal':
        systemPrompt = `You are an expert emotional wellness analyst. Analyze the journal entry and provide:
1. Sentiment score (-1 to 1)
2. Key themes (max 5 keywords)
3. Emotional insights
4. Suggested reflection questions

Return JSON format:
{
  "sentiment_score": number,
  "themes": string[],
  "insights": string,
  "reflection_questions": string[]
}`;
        break;

      case 'generate_insight':
        systemPrompt = `Generate a personalized insight based on the user's journal and mood data. Focus on patterns, growth opportunities, and positive reinforcement.

Data: ${context ? JSON.stringify(context) : 'Limited data available'}

Provide a supportive, actionable insight that helps the user understand their emotional patterns.`;
        break;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: type === 'analyze_journal' ? 500 : 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    // Parse JSON response for analysis types
    if (type === 'analyze_journal') {
      try {
        const parsed = JSON.parse(result);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        // If parsing fails, return a default analysis
        return new Response(JSON.stringify({
          sentiment_score: 0,
          themes: ['reflection'],
          insights: result,
          reflection_questions: ['How did writing this make you feel?']
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ response: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-companion function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});