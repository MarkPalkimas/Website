const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

app.use(
  express.static(publicDir, {
    extensions: ["html"],
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    }
  })
);

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
