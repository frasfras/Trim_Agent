import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // CORS headers just in case
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Proxy route for creating/retrieving a session ID
  app.post("/api/sessions", async (req, res) => {
    try {
      console.log("[PROXY] POST /api/sessions -> Calling Barber Agent API...");
      const response = await fetch("https://mybarberagent-jun-1008791897094.us-east1.run.app/apps/app/users/web-user-01/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[PROXY] Session creation failed (Status ${response.status}):`, errorText);
        return res.status(response.status).json({ 
          error: "Failed to create session with Barber Agent API", 
          details: errorText 
        });
      }

      const data = await response.json();
      console.log("[PROXY] Session created successfully:", data);
      res.json(data);
    } catch (error: any) {
      console.error("[PROXY] Error in session creation route:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Proxy route for running messages
  app.post("/api/run", async (req, res) => {
    try {
      const { session_id, message } = req.body;
      if (!session_id || !message) {
        return res.status(400).json({ error: "Missing session_id or message in request body" });
      }

      // Exact JSON structure requested by user
      const payload = {
        app_name: "app",
        user_id: "web-user-01",
        session_id: session_id,
        new_message: {
          parts: [
            {
              text: message
            }
          ]
        }
      };

      console.log(`[PROXY] Sending message for Session ${session_id}...`);
      console.log("[PROXY] Payload:", JSON.stringify(payload));

      let response = await fetch("https://mybarberagent-jun-1008791897094.us-east1.run.app/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok && response.status === 404) {
        console.log(`[PROXY] Session ${session_id} not found on remote (Status 404). Auto-provisioning session...`);
        try {
          const createResponse = await fetch("https://mybarberagent-jun-1008791897094.us-east1.run.app/apps/app/users/web-user-01/sessions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: session_id })
          });

          if (createResponse.ok) {
            console.log(`[PROXY] Session ${session_id} auto-provisioned successfully. Retrying execution...`);
            response = await fetch("https://mybarberagent-jun-1008791897094.us-east1.run.app/run", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload)
            });
          } else {
            const createErr = await createResponse.text();
            console.error(`[PROXY] Auto-provision session failed:`, createErr);
          }
        } catch (createErr: any) {
          console.error(`[PROXY] Error during auto-provisioning session:`, createErr);
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[PROXY] Execution failed (Status ${response.status}):`, errorText);
        return res.status(response.status).json({ 
          error: "Barber Agent API failed to execute message", 
          details: errorText 
        });
      }

      const data = await response.json();
      console.log("[PROXY] Message processed. Return type of data:", Array.isArray(data) ? "Array" : typeof data);
      res.json(data);
    } catch (error: any) {
      console.error("[PROXY] Error in message route:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Fullstack Barber Shop server running on http://localhost:${PORT}`);
  });
}

startServer();
