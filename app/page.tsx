export default function Home() {
return (
<main style={{ padding: "40px" }}>
<h1>Quiz Platform</h1>

<p>
Supabase URL Present:{" "}
{process.env.NEXT_PUBLIC_SUPABASE_URL ? "Yes" : "No"}
</p>

<p>
Supabase Key Present:{" "}
{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Yes" : "No"}
</p>
</main>
);
}
