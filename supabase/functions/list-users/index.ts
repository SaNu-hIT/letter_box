// Supabase Edge Function to list users securely

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
    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    // Create a Supabase client using the service role key
    const supabaseAdmin = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    if (!supabaseAdmin || !supabaseUrl) {
      throw new Error("Missing environment variables");
    }

    // Verify the user is an admin
    const supabaseClient = createClient(supabaseUrl, supabaseAdmin);
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: isAdmin, error: adminError } =
      await supabaseClient.rpc("is_admin");

    if (adminError || !isAdmin) {
      throw new Error("Unauthorized - Admin access required");
    }

    // Get users from auth.users
    const { data: authUsers, error: authError } =
      await supabaseClient.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Error fetching auth users: ${authError.message}`);
    }

    // Get additional user data from the users table
    const { data: usersData, error: usersError } = await supabaseClient
      .from("users")
      .select("id, name, email");

    if (usersError) {
      throw new Error(`Error fetching users data: ${usersError.message}`);
    }

    // Create a map of user IDs to names
    const userMap = {};
    if (usersData) {
      usersData.forEach((user) => {
        userMap[user.id] = user;
      });
    }

    // Combine the data
    const formattedUsers = authUsers.users.map((user) => ({
      id: user.id,
      email: user.email,
      name: userMap[user.id]?.name || user.user_metadata?.full_name || "",
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    }));

    return new Response(JSON.stringify({ users: formattedUsers }), {
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
      status: error.message.includes("Unauthorized") ? 403 : 400,
    });
  }
});

// Helper function to create Supabase client
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    auth: {
      getUser: async (token: string) => {
        try {
          const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: supabaseKey,
            },
          });
          const data = await response.json();
          return { data: { user: data }, error: null };
        } catch (error) {
          return { data: { user: null }, error };
        }
      },
      admin: {
        listUsers: async () => {
          try {
            const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
              headers: {
                Authorization: `Bearer ${supabaseKey}`,
                apikey: supabaseKey,
              },
            });
            const users = await response.json();
            return { data: { users }, error: null };
          } catch (error) {
            return { data: { users: [] }, error };
          }
        },
      },
    },
    from: (table: string) => ({
      select: (columns: string) => ({
        async then(resolve: any) {
          try {
            const response = await fetch(
              `${supabaseUrl}/rest/v1/${table}?select=${columns}`,
              {
                headers: {
                  Authorization: `Bearer ${supabaseKey}`,
                  apikey: supabaseKey,
                },
              },
            );
            const data = await response.json();
            resolve({ data, error: null });
          } catch (error) {
            resolve({ data: null, error });
          }
        },
      }),
    }),
    rpc: (functionName: string) => ({
      async then(resolve: any) {
        try {
          const response = await fetch(
            `${supabaseUrl}/rest/v1/rpc/${functionName}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${supabaseKey}`,
                apikey: supabaseKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({}),
            },
          );
          const data = await response.json();
          resolve({ data, error: null });
        } catch (error) {
          resolve({ data: null, error });
        }
      },
    }),
  };
}
