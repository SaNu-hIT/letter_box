// Supabase Edge Function to generate love letters

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { mood, recipientName = "beloved" } = await req.json();

    // Sample AI-generated letters based on mood
    const aiLetters: Record<string, string> = {
      romantic: `Dear ${recipientName},\n\nAs I write these words, my heart beats with a rhythm that only you can inspire. Every moment we've shared has been etched into my soul, creating a tapestry of memories that I cherish deeply.\n\nYour smile is the light that guides me through my darkest days, and your laughter is the melody that brings joy to my world. When our eyes meet, time seems to stand still, and I find myself lost in the depth of your gaze.\n\nI've never been good at expressing my feelings, but I want you to know that you mean everything to me. You are the first thought in my morning and the last whisper in my dreams.\n\nForever yours,`,
      passionate: `My dearest ${recipientName},\n\nThe fire you've ignited in my heart burns with an intensity that consumes my every thought. I find myself breathless at the mere thought of you, captivated by the passion that flows between us like an electric current.\n\nYour touch sends shivers down my spine, awakening desires I never knew existed. The way you move, the sound of your voice, the scent of your skin – everything about you drives me wild with longing.\n\nI crave your presence like the desert craves rain, desperate and unrelenting. When we're apart, I count the seconds until we're together again, until I can lose myself in your embrace once more.\n\nDesperately yours,`,
      poetic: `To ${recipientName}, keeper of my heart,\n\nIn the garden of life, you are the rarest bloom,\nA flower whose beauty outshines the midnight moon.\nYour essence, like nectar, sweet and divine,\nIntoxicates my senses, makes stars align.\n\nLike verses of poetry written in the sky,\nOur love story unfolds as days pass by.\nYour soul, a sonnet of infinite grace,\nHolds me captive in its warm embrace.\n\nThrough seasons changing and tides that turn,\nMy devotion to you will eternally burn.\nFor you are my muse, my lyrical dream,\nThe inspiration behind every word I glean.\n\nEternally inspired by you,`,
      playful: `Hey ${recipientName}! Yes, YOU! \n\nGuess what? I've been trying to solve this really complicated math problem lately. It goes something like: U + Me = Happiness. And I think I've finally cracked the solution!\n\nYou know what's funny? I've been making a list of the best things in my life, and somehow your name keeps appearing at the top. Coincidence? I think not!\n\nI'm not saying you're perfect or anything... but if there was an Olympic event for being amazing, you'd definitely win the gold medal. And I'd be cheering the loudest from the stands!\n\nSo here's a virtual high-five, a silly dance, and a whole lot of heart emojis coming your way. Because life's too short not to tell someone they make your heart do the cha-cha slide!\n\nWith a grin and a wink,`,
      nostalgic: `My cherished ${recipientName},\n\nDo you remember that autumn day when the leaves danced around us like confetti? I close my eyes and I'm there again, feeling the warmth of your hand in mine despite the chill in the air.\n\nTime has a way of flowing like a river, carrying us forward, yet the memories we've created remain like stones in that stream – permanent, unchanging, beautiful in their constancy.\n\nI find myself revisiting the chapters of our story – the coffee shop where we first talked until closing time, the park bench where we shared secrets under starlight, the rainy afternoon when we danced in puddles like children.\n\nThese memories are my most treasured possessions, worn smooth by frequent remembering, glowing with the patina that only time and love can create.\n\nYours, through all our seasons,`,
      heartfelt: `My dearest ${recipientName},\n\nSome feelings are too profound for ordinary words, too vast to be contained in simple sentences. Yet I find myself trying, because what I feel for you deserves to be expressed, even if imperfectly.\n\nYou've touched my life in ways I never thought possible. You've seen me at my worst and loved me anyway. You've celebrated my best and made those moments even brighter. Your kindness, your strength, your beautiful spirit – they've become essential parts of my world.\n\nI want you to know that you are valued beyond measure, loved beyond reason, and appreciated beyond words. The space you occupy in my heart grows larger with each passing day.\n\nThank you for being exactly who you are. Thank you for allowing me to be part of your journey. In this complicated world, my feelings for you are the simplest, truest thing I know.\n\nWith all my heart,`,
    };

    // Get the letter for the requested mood or default to romantic
    const message = aiLetters[mood] || aiLetters.romantic;

    const data = {
      message,
      mood,
    };

    return new Response(JSON.stringify(data), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});
