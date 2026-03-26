import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

const SERVICES = [
  "text",
  "chat",
  "embedding",
  "image",
  "audio",
  "music",
  "video",
  "live"
];

export function Layout() {
  return (
    <div className="layout">
      <nav className="sidebar">
        <h2>Gemini Playground</h2>
        <ul>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          {SERVICES.map((srv) => (
            <li key={srv}>
              <NavLink to={`/${srv}`}>
                {srv.charAt(0).toUpperCase() + srv.slice(1)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
