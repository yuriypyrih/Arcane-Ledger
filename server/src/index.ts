import express from "express";

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "dnd-companion-server"
  });
});

app.listen(port, () => {
  console.log(`DnD Companion server listening on http://localhost:${port}`);
});
