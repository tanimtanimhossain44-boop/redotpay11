 "use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadEmails(pass = password) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${pass}`
        },
        body: JSON.stringify({}),
        cache: "no-store"
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign in.");
      setEmails(data.emails || []);
      setUnlocked(true);
      setSelected(null);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setUnlocked(false);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUnlocked(false);
    setPassword("");
    setEmails([]);
    setSelected(null);
    setSearch("");
    setError("");
  }

  const filtered = useMemo(() => emails.filter((mail) => {
    const haystack = `${mail.subject || ""} ${mail.from || ""} ${mail.snippet || ""}`;
    return haystack.toLowerCase().includes(search.toLowerCase());
  }), [emails, search]);

  if (!unlocked) {
    return (
      <main className="loginPage">
        <section className="loginCard">
          <div className="brandMark">R</div>
          <p className="eyebrow">PRIVATE MAIL DASHBOARD</p>
          <h1>RedotPay Mail</h1>
          <p className="muted">Enter your dashboard password to continue.</p>
          <form onSubmit={(event) => { event.preventDefault(); loadEmails(); }}>
            <label htmlFor="password">Dashboard password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button className="primaryButton" disabled={loading || !password}>
              {loading ? "Checking…" : "Unlock dashboard"}
            </button>
          </form>
          {error && <p className="error" role="alert">{error}</p>}
          <p className="tiny muted">Your Gmail password is never requested here.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brandMark small">R</div>
          <div>
            <h1>RedotPay Mail</h1>
            <p className="muted">Private email dashboard</p>
          </div>
        </div>
        <div className="topActions">
          <button className="secondaryButton" onClick={() => loadEmails()} disabled={loading}>
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
          <button className="quietButton" onClick={logout}>Lock</button>
        </div>
      </header>

      <section className="summary">
        <div>
          <p className="eyebrow">INBOX</p>
          <h2>RedotPay emails</h2>
          <p className="muted">Only matching RedotPay messages are listed.</p>
        </div>
        <div className="count"><strong>{filtered.length}</strong><span>Messages</span></div>
      </section>

      <section className="toolbar">
        <input
          aria-label="Search emails"
          placeholder="Search sender or subject…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      {error && <p className="error">{error}</p>}

      {selected ? (
        <section className="messagePanel">
          <button className="quietButton backButton" onClick={() => setSelected(null)}>← Back to inbox</button>
          <h2 className="messageSubject">{selected.subject}</h2>
          <div className="messageMeta">
            <span><b>From:</b> {selected.from || "Unknown sender"}</span>
            <span><b>Date:</b> {selected.date || "Unknown date"}</span>
          </div>
          {selected.sensitive ? (
            <div className="notice">
              This message appears to contain an authentication or verification code.
              Its message body is hidden for account security.
            </div>
          ) : selected.html ? (
            <iframe
              title="Email message"
              className="emailFrame"
              sandbox=""
              referrerPolicy="no-referrer"
              srcDoc={selected.html}
            />
          ) : (
            <pre className="plainMail">{selected.text || selected.snippet || "No message body available."}</pre>
          )}
        </section>
      ) : (
        <section className="emailList">
          {filtered.map((mail) => (
            <article className="emailCard" key={mail.id}>
              <div className="emailHeading">
                <h3>{mail.subject || "(No subject)"}</h3>
                <time>{mail.date || ""}</time>
              </div>
              <p className="sender">{mail.from || "Unknown sender"}</p>
              <p className="preview">
                {mail.sensitive
                  ? "Authentication-related message — body hidden"
                  : (mail.snippet || "No preview available.")}
              </p>
              <button className="secondaryButton" onClick={() => setSelected(mail)}>View email →</button>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="emptyState">
              <h3>No emails found</h3>
              <p className="muted">Try refreshing or changing your search.</p>
            </div>
          )}
        </section>
      )}
      <footer>Read-only Gmail connection · Keep this dashboard private</footer>
    </main>
  );
}