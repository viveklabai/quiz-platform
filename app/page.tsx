import Link from "next/link";

export default function Home() {
return (
<main
style={{
padding: "40px",
textAlign: "center",
}}
>
<h1>Quiz Platform</h1>

<p>Welcome to Quiz Platform</p>

<div
style={{
display: "flex",
gap: "20px",
justifyContent: "center",
marginTop: "30px",
}}
>
<Link href="/join-team">
<button>Join Team</button>
</Link>

<button>Quiz Master</button>
</div>
</main>
);
}
