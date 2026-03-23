import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const adminEmail = "mehedi23145545@gmail.com";
  const adminPassword = "8gcmic44";

  // Check if admin already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === adminEmail);

  if (existing) {
    // Ensure admin role exists
    await supabase.from("user_roles").upsert(
      { user_id: existing.id, role: "admin" },
      { onConflict: "user_id,role" }
    );
    return new Response(JSON.stringify({ message: "Admin already exists, role ensured" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create admin user
  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { region: "bd" },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  // Assign admin role
  await supabase.from("user_roles").insert({ user_id: newUser.user!.id, role: "admin" });

  // Give admin credits
  await supabase.from("profiles").update({ credits: 99999 }).eq("id", newUser.user!.id);

  return new Response(JSON.stringify({ message: "Admin created successfully" }), {
    headers: { "Content-Type": "application/json" },
  });
});
