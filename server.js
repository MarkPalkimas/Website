const express = require("express");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");
const packageJsonPath = path.join(__dirname, "package.json");

function readGitValue(command, fallback = "unknown") {
  try {
    return execSync(command, { cwd: __dirname, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return fallback;
  }
}

function readVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.version || "unknown";
  } catch {
    return "unknown";
  }
}

const buildInfo = {
  commit:
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.COMMIT_SHA ||
    readGitValue("git rev-parse --short HEAD"),
  branch:
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.GIT_BRANCH ||
    readGitValue("git rev-parse --abbrev-ref HEAD"),
  buildTime:
    process.env.VERCEL_BUILD_DATE ||
    process.env.BUILD_TIME ||
    new Date().toISOString(),
  version: readVersion()
};

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
];

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", cspDirectives.join("; "));
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Strict-Transport-Security", "max-age=31536000");
  next();
});

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

app.get("/build.json", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(buildInfo);
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
