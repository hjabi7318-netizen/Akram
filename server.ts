import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for PDF generation
  app.get("/api/pdf/:orderId", async (req, res) => {
    const { orderId } = req.params;
    const invoiceUrl = `http://localhost:3000/order/${orderId}?print=true`;

    let browser;
    try {
      console.log(`[PO-PDF] Request received for Order: ${orderId}`);
      console.log(`[PO-PDF] Target URL: ${invoiceUrl}`);
      
      browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          "--no-sandbox", 
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--font-render-hinting=none"
        ],
        headless: true,
      });
      
      const page = await browser.newPage();
      
      // Enable request interception to block noise and catch failing resources
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const url = request.url();
        const resourceType = request.resourceType();

        // Block non-essential noise but ALLOW core app resources
        if (
          url.includes("google-analytics") || 
          url.includes("favicon.ico") ||
          resourceType === 'websocket' ||
          url.includes("hmr")
        ) {
          request.abort();
        } else {
          request.continue();
        }
      });

      page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        
        // Ignore known unavoidable dev errors that don't affect PDF quality
        if (
          text.includes("Failed to load resource") || 
          text.includes("net::ERR_FAILED") ||
          text.includes("vite") ||
          text.includes("favicon")
        ) {
          return;
        }

        if (type === 'error') {
          console.error(`[BROWSER-ERROR] ${text}`);
        } else if (type === 'warning') {
          console.warn(`[BROWSER-WARN] ${text}`);
        } else if (process.env.NODE_ENV !== "production") {
          console.log(`[BROWSER-LOG] ${text}`);
        }
      });

      page.on('requestfailed', request => {
        const url = request.url();
        const failure = request.failure();
        // Only log failures for core assets (CSS, Images, local scripts)
        if (
          !url.includes("favicon.ico") && 
          !url.includes("vite") && 
          !url.includes("hmr") &&
          !url.includes(".map")
        ) {
          console.warn(`[RESOURCE-FAIL] ${url} | Reason: ${failure?.errorText || "Unknown"}`);
        }
      });

      // Set A4 viewport
      await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
      
      console.log(`[PDF] Navigating to page...`);
      // Use 'load' and specific selector wait instead of aggressive networkidle
      const response = await page.goto(invoiceUrl, {
        waitUntil: "load",
        timeout: 45000,
      });

      if (!response || !response.ok()) {
        throw new Error(`Failed to load page: ${response?.status() || 'No response'}`);
      }

      console.log(`[PDF] Waiting for .invoice-ready selector...`);
      await page.waitForSelector(".invoice-ready", { 
        visible: true,
        timeout: 30000 
      });

      // Ensure all content (QR, fonts) are settled
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`[PDF] Generating PDF buffer...`);
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        margin: {
          top: "0.5cm",
          right: "0.5cm",
          bottom: "0.5cm",
          left: "0.5cm",
        },
      });

      console.log(`[PDF] Generation complete. Sending binary response.`);
      
      // Convert to Node.js Buffer for safe delivery
      const buffer = Buffer.from(pdfBuffer);

      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${orderId.slice(0, 8)}.pdf"`,
        "Content-Length": buffer.length,
        "Cache-Control": "no-cache"
      });
      
      res.end(buffer);

    } catch (error) {
      console.error("[PDF ERROR] Detailed Failure:", error);
      
      // If headers haven't been sent, we can send a clean JSON error
      if (!res.headersSent) {
        res.status(500).json({ 
          error: "Failed to generate PDF", 
          message: error instanceof Error ? error.message : "Generation timed out or failed internally"
        });
      }
    } finally {
      if (browser) {
        await browser.close();
        console.log(`[PDF] Browser closed for ${orderId}`);
      }
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
