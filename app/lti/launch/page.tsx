export default function LtiLaunchTestPage() {
  return (
    <main
      style={{
        fontFamily: "ui-sans-serif",
        padding: 24,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: 12 }}>LTI 1.3 Launch (Demo Tester)</h1>
      <p>
        Paste an <code>id_token</code> (JWT) and submit to simulate a platform
        launch.
      </p>
      <form method="POST" action="/api/lti/launch" style={{ marginTop: 16 }}>
        <textarea
          name="id_token"
          rows={8}
          style={{ width: "100%", fontFamily: "monospace" }}
        />
        <div style={{ marginTop: 12 }}>
          <button type="submit">POST /api/lti/launch</button>
        </div>
      </form>
    </main>
  );
}
