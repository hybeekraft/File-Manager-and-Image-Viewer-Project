import { app } from "./app";
import { config } from "./config";

app.listen(config.port, () => {
  console.log(`File Manager API running on http://localhost:${config.port}`);
});
