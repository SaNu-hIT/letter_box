// Supabase Edge Function to generate personalized love letters

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { mood, recipientName, senderName } = await req.json();

    // Default values if not provided
    const selectedMood = mood || "romantic";
    const recipient = recipientName || "beloved";
    const sender = senderName || "";

    // Sample AI-generated letters based on mood
    const letterTemplates = {
      romantic: `Dear ${recipient},

As I write these words, my heart beats with a rhythm that only you can inspire. Every moment we've shared has been etched into my soul, creating a tapestry of memories that I cherish deeply.

Your smile is the light that guides me through my darkest days, and your laughter is the melody that brings joy to my world. When our eyes meet, time seems to stand still, and I find myself lost in the depth of your gaze.

I've never been good at expressing my feelings, but I want you to know that you mean everything to me. You are the first thought in my morning and the last whisper in my dreams.

Forever yours,${sender ? "\n" + sender : ""}`,

      passionate: `My dearest ${recipient},

The fire you've ignited in my heart burns with an intensity that consumes my every thought. I find myself breathless at the mere thought of you, captivated by the passion that flows between us like an electric current.

Your touch sends shivers down my spine, awakening desires I never knew existed. The way you move, the sound of your voice, the scent of your skin – everything about you drives me wild with longing.

I crave your presence like the desert craves rain, desperate and unrelenting. When we're apart, I count the seconds until we're together again, until I can lose myself in your embrace once more.

Desperately yours,${sender ? "\n" + sender : ""}`,

      poetic: `To ${recipient}, keeper of my heart,

In the garden of life, you are the rarest bloom,
A flower whose beauty outshines the midnight moon.
Your essence, like nectar, sweet and divine,
Intoxicates my senses, makes stars align.

Like verses of poetry written in the sky,
Our love story unfolds as days pass by.
Your soul, a sonnet of infinite grace,
Holds me captive in its warm embrace.

Through seasons changing and tides that turn,
My devotion to you will eternally burn.
For you are my muse, my lyrical dream,
The inspiration behind every word I glean.

Eternally inspired by you,${sender ? "\n" + sender : ""}`,

      playful: `Hey ${recipient}! Yes, YOU! 

Guess what? I've been trying to solve this really complicated math problem lately. It goes something like: U + Me = Happiness. And I think I've finally cracked the solution!

You know what's funny? I've been making a list of the best things in my life, and somehow your name keeps appearing at the top. Coincidence? I think not!

I'm not saying you're perfect or anything... but if there was an Olympic event for being amazing, you'd definitely win the gold medal. And I'd be cheering the loudest from the stands!

So here's a virtual high-five, a silly dance, and a whole lot of heart emojis coming your way. Because life's too short not to tell someone they make your heart do the cha-cha slide!

With a grin and a wink,${sender ? "\n" + sender : ""}`,

      nostalgic: `My cherished ${recipient},

Do you remember that autumn day when the leaves danced around us like confetti? I close my eyes and I'm there again, feeling the warmth of your hand in mine despite the chill in the air.

Time has a way of flowing like a river, carrying us forward, yet the memories we've created remain like stones in that stream – permanent, unchanging, beautiful in their constancy.

I find myself revisiting the chapters of our story – the coffee shop where we first talked until closing time, the park bench where we shared secrets under starlight, the rainy afternoon when we danced in puddles like children.

These memories are my most treasured possessions, worn smooth by frequent remembering, glowing with the patina that only time and love can create.

Yours, through all our seasons,${sender ? "\n" + sender : ""}`,

      heartfelt: `My dearest ${recipient},

Some feelings are too profound for ordinary words, too vast to be contained in simple sentences. Yet I find myself trying, because what I feel for you deserves to be expressed, even if imperfectly.

You've touched my life in ways I never thought possible. You've seen me at my worst and loved me anyway. You've celebrated my best and made those moments even brighter. Your kindness, your strength, your beautiful spirit – they've become essential parts of my world.

I want you to know that you are valued beyond measure, loved beyond reason, and appreciated beyond words. The space you occupy in my heart grows larger with each passing day.

Thank you for being exactly who you are. Thank you for allowing me to be part of your journey. In this complicated world, my feelings for you are the simplest, truest thing I know.

With all my heart,${sender ? "\n" + sender : ""}`,
    };

    // Get the template for the selected mood
    const message = letterTemplates[selectedMood] || letterTemplates.romantic;

    // Return the generated letter
    return new Response(
      JSON.stringify({
        message,
        mood: selectedMood,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
