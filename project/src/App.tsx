export function App() {
  return (
    <main
      style={{
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        margin: "2rem auto",
        maxWidth: "42rem",
        padding: "0 1rem",
        color: "#18181b",
      }}
    >
      <h1>Project Workspace</h1>
      <p>
        This directory is the working folder for remote terminal commands.
        Commands executed through the remote session run here.
      </p>
      <ul>
        <li>
          <code>package.json</code>
        </li>
        <li>
          <code>src/</code>
        </li>
        <li>
          <code>README.md</code>
        </li>
      </ul>
    </main>
  );
}

export default App;
