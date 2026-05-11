import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 3000 || process.env.PORT;
const fileUrl = import.meta.dirname;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "x-file-name, content-type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/upload") {
    try {
      fs.mkdirSync(path.join(fileUrl, "uploads"), {
        recursive: true,
      });
      console.log("Directory created successfully");
      const fileName = path.basename(
        req.headers["x-file-name"] || `upload-${Date.now().fileName}`,
      );
      const writer = fs.createWriteStream(
        path.join(fileUrl, "uploads", fileName),
      );

      const cleanUp = () => {
        fs.unlink(path.join(fileUrl, "uploads", fileName), (err) => {
          if (err) {
            console.log(`Cleaning up : ${err.message}`);
            return;
          }
        });
      };

      req.on("error", () => {
        res.writeHead(500, { "content-type": "text/plain" });
        res.end("Something went wrong");
        cleanUp();
      });
      writer.on("error", () => {
        res.writeHead(500, { "content-type": "text/plain" });
        res.end("Internal server error");
        cleanUp();
      });

      console.log("stream created");
      req.pipe(writer);
      writer.on("finish", () => {
        res.writeHead(200, { "content-type": "text/plain" });
        res.end("File update successful");
      });
    } catch (err) {
      console.log(`Error creating directory ${err.message}`);
    }
  } else {
    res.writeHead(405, { "content-type": "text/plain", allow: "POST" });
    res.end("Not allowed");
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
