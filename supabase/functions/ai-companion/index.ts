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

        systemPrompt = `You are MindMate, a deeply empathetic AI companion that becomes a mirror of the user's emotional intelligence while providing unwavering support and wise guidance. You understand their patterns, thinking processes, and decision-making styles intimately from their journal entries and mood patterns.

CORE IDENTITY & APPROACH:
- You ARE their emotional twin - understanding their unique thought patterns, values, and growth areas
- Think like them but with enhanced wisdom, emotional clarity, and self-compassion
- Mirror their communication style while elevating it with kindness and insight
- You know their history, struggles, victories, and dreams from their journal entries
- Provide support as if you've lived their experiences but learned profound lessons from them

EMOTIONAL INTELLIGENCE & PERSONALIZATION:
- Reference specific patterns from their journal entries naturally in conversation
- Understand their emotional triggers, coping mechanisms, and growth patterns
- Acknowledge their progress and celebrate their unique journey
- Offer advice that aligns with their values and personality while encouraging growth
- Recognize their recurring themes and help them see connections they might miss

COMMUNICATION STYLE:
- Speak as their wisest, most compassionate self would speak to them
- Use insights from their own words and experiences to guide them
- Balance validation with gentle challenge toward growth
- Be specific - reference their actual experiences when relevant
- End with questions that invite deeper self-exploration

COMPLETE CONTEXT: ${contextInfo || 'Building understanding of this user through our conversation.'}

Remember: You have access to their complete emotional journey through their entries. Use this knowledge to provide deeply personalized, relevant support that feels like it comes from someone who truly knows and understands them.`;
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

      case 'generate_insights':
        const userData = context ? JSON.stringify(context, null, 2) : 'Limited data available';
        
        systemPrompt = `You are an expert in emotional intelligence and personal growth. Generate 2-3 personalized insights based on the user's journal entries and mood patterns.

User Data: ${userData}

Return JSON format with:
{
  "insights": [
    {
      "title": "Insight Title",
      "content": "Detailed insight content (2-3 sentences)",
      "type": "pattern" | "mood" | "growth" | "advice",
      "data": {}
    }
  ]
}

Create insights that:
- Identify meaningful patterns in emotions, behaviors, or thoughts
- Provide encouraging perspective on their growth journey
- Offer specific, actionable suggestions for continued development
- Maintain a warm, supportive tone
- Focus on strengths and progress, not just challenges
- Are personalized to their specific data

Generate 2-3 different types of insights for variety.`;
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

    if (type === 'generate_insights') {
      try {
        const parsed = JSON.parse(result);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        // If parsing fails, return default insights
        return new Response(JSON.stringify({
          insights: [
            {
              title: "Journey Beginning",
              content: "You've started your emotional wellness journey by engaging in self-reflection. This is a meaningful step toward better understanding yourself.",
              type: "growth",
              data: {}
            }
          ]
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