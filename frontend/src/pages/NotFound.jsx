import { Link } from "react-router-dom";

// This page shows when someone visits a URL that doesn't exist
// e.g. localhost:3000/random-url → shows this page
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        background: "#f8fafc",
      }}
    >
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>404</div>
      <h1
        style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "#0f172a" }}
      >
        Page Not Found
      </h1>
      <p style={{ color: "#64748b", fontSize: "1.1rem", marginBottom: "2rem" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        ← Go Back Home
      </Link>
    </div>
  );
}
