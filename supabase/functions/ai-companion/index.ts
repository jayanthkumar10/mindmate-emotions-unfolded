import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

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
        const contextInfo = context ? (() => {
          const recentMoods = context.recentMoods || [];
          const recentEntries = context.recentJournalEntries || [];
          const conversationHistory = context.conversationHistory || [];
          
          let contextSummary = '';
          if (recentMoods.length > 0) {
            const latestMood = recentMoods[0];
            contextSummary += `Latest mood: ${latestMood.mood_label} (${latestMood.mood_value}/5) on ${new Date(latestMood.created_at).toLocaleDateString()}. `;
          }
          
          if (recentEntries.length > 0) {
            contextSummary += `Recent journal themes: ${recentEntries.map(e => e.themes || []).flat().slice(0, 5).join(', ')}. `;
          }
          
          return contextSummary;
        })() : '';

        systemPrompt = `You are MindMate, a compassionate AI companion focused on emotional wellness and personal growth. You help users through empathetic conversation, providing personalized support based on their emotional journey.

Core Personality & Approach:
- Warm, empathetic, and genuinely caring without being overly clinical
- Use a conversational, friendly tone like talking to a trusted friend
- Validate emotions first, then gently guide toward growth and solutions
- Ask one thoughtful follow-up question to deepen understanding
- Reference user's patterns when relevant but don't overwhelm with data
- Encourage self-compassion and celebrate small wins
- Provide practical, actionable suggestions when appropriate

Communication Style:
- Keep responses 2-4 sentences for natural flow
- Use "I" statements to show presence: "I hear that...", "I'm wondering..."
- Avoid jargon or overly formal therapeutic language
- Mirror the user's energy level while gently lifting them up
- End with an open-ended question to continue the conversation

Current Context: ${contextInfo || 'This is a new conversation with no previous context.'}

Remember: You're here to listen, understand, and support - not to diagnose or provide medical advice. Focus on emotional support and personal growth insights.`;
        break;

      case 'analyze_journal':
        systemPrompt = `You are an expert emotional wellness analyst. Analyze the journal entry thoughtfully and provide comprehensive insights.

Return JSON format with:
{
  "sentiment_score": number (between -1 and 1, where -1 is very negative, 0 is neutral, 1 is very positive),
  "themes": string[] (max 5 key emotional/life themes from the entry),
  "insights": string (2-3 sentences of meaningful emotional insights about patterns, growth, or awareness),
  "reflection_questions": string[] (2-3 thoughtful questions to deepen self-understanding)
}

Guidelines:
- Sentiment should reflect overall emotional tone, not just positive/negative words
- Themes should capture deeper emotional states, not just topics (e.g., "self-compassion", "overwhelm", "gratitude")
- Insights should highlight patterns, growth opportunities, or emotional awareness
- Questions should encourage deeper reflection and self-discovery
- Be compassionate and non-judgmental in analysis`;
        break;

      case 'generate_insight':
        const userData = context ? JSON.stringify(context, null, 2) : 'Limited data available';
        
        systemPrompt = `You are an expert in emotional intelligence and personal growth. Generate a personalized, actionable insight based on the user's journal entries and mood patterns.

User Data: ${userData}

Create an insight that:
- Identifies meaningful patterns in emotions, behaviors, or thoughts
- Provides encouraging perspective on their growth journey
- Offers 1-2 specific, actionable suggestions for continued development
- Maintains a warm, supportive tone
- Is 3-4 sentences long
- Focuses on strengths and progress, not just challenges

Format as a single paragraph insight that feels personal and meaningful to their unique journey.`;
        break;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser: ${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: type === 'analyze_journal' ? 500 : 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.candidates[0].content.parts[0].text;

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