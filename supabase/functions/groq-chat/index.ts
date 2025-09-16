import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with the user's session
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { message, model = 'llama3-8b-8192', conversation_history = [] } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing chat request for user:', user.id);
    console.log('Message:', message);
    console.log('Model:', model);

    // Prepare messages for Groq API
    const messages = [
      {
        role: "system",
        content: "You are VN-AI, an advanced and helpful AI assistant. You are knowledgeable, friendly, and provide accurate information. Always be concise but thorough in your responses."
      },
      ...conversation_history,
      {
        role: "user",
        content: message
      }
    ];

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API error: ${groqResponse.status} - ${errorText}`);
    }

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from Groq API');
    }

    // Save the conversation to database
    const { data: chatMessage, error: saveError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        message: message,
        response: aiResponse,
        model: model
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving chat message:', saveError);
      // Don't throw here, still return the response even if saving fails
    }

    console.log('Chat response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        message_id: chatMessage?.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in groq-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});