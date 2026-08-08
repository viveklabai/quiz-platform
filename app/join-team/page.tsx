export default function JoinTeamPage() {
return (
<main
style={{
padding: "40px",
maxWidth: "500px",
margin: "0 auto",
}}
>
<h1>Join Team</h1>

<div style={{ marginTop: "20px" }}>
<label>Display Name</label>
<br />
<input
type="text"
style={{
width: "100%",
padding: "10px",
marginTop: "5px",
}}
/>
</div>

<div style={{ marginTop: "20px" }}>
<label>Team Code</label>
<br />
<input
type="text"
style={{
width: "100%",
padding: "10px",
marginTop: "5px",
}}
/>
</div>

<div style={{ marginTop: "20px" }}>
<button
style={{
padding: "10px 20px",

}}
>
Join Team
</button>
</div>
</main>
);
}
