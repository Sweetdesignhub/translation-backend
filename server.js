// // const express = require("express");
// // const { Translate } = require("@google-cloud/translate").v2;
// // const fs = require("fs");
// // const dotenv = require("dotenv");
// // const PDFParser = require("pdf-parse");
// // const multer = require("multer");
// // const cors = require("cors"); // Import the CORS middleware

// // dotenv.config();

// // const app = express();
// // const PORT = process.env.PORT || 3000;

// // const credentials = JSON.parse(process.env.CREDENTIALS);

// // if (!fs.existsSync("credentials.json")) {
// //   fs.writeFileSync("credentials.json", JSON.stringify(credentials));
// // }

// // process.env.GOOGLE_APPLICATION_CREDENTIALS = "credentials.json";

// // const translateClient = new Translate();

// // // Use CORS middleware
// // app.use(cors());

// // // Multer configuration for handling file uploads
// // const upload = multer({ dest: "uploads/" });

// // // Language detection endpoint
// // app.get("/detect-language/:text", (req, res) => {
// //   const text = req.params.text;
// //   translateClient
// //     .detect(text)
// //     .then((results) => {
// //       const detectedRes = results[0];
// //       res.json({ detectedLanguage: detectedRes.language });
// //     })
// //     .catch((err) => {
// //       console.error("ERROR:", err);
// //       res.status(500).json({ error: "Internal server error" });
// //     });
// // });

// // // Translation endpoint
// // app.get("/translate/:text/:target", (req, res) => {
// //   const text = req.params.text;
// //   const target = req.params.target;
// //   translateClient
// //     .translate(text, target)
// //     .then((results) => {
// //       const transRes = results[0];
// //       res.json({ translatedText: transRes });
// //     })
// //     .catch((err) => {
// //       console.error("ERROR:", err);
// //       res.status(500).json({ error: "Internal server error" });
// //     });
// // });

// // // Language detection endpoint
// // app.post("/detect-language", upload.single("pdf"), (req, res) => {
// //   console.log(req.file); // Log the uploaded file object
// //   if (!req.file) {
// //     return res.status(400).json({ error: "No PDF file uploaded" });
// //   }

// //   const pdfFile = req.file; // Uploaded PDF file
// //   PDFParser(pdfFile.path)
// //     .then((data) => {
// //       const text = data.text;
// //       translateClient
// //         .detect(text)
// //         .then((results) => {
// //           const detectedRes = results[0];
// //           res.json({ detectedLanguage: detectedRes.language });
// //         })
// //         .catch((err) => {
// //           console.error("ERROR:", err);
// //           res.status(500).json({ error: "Internal server error" });
// //         });
// //     })
// //     .catch((error) => {
// //       console.error("PDF parsing error:", error);
// //       res.status(400).json({ error: "PDF parsing error" });
// //     });
// // });

// // // Translation endpoint
// // app.post("/translate", upload.single("pdf"), (req, res) => {
// //   console.log(req.file); // Log the uploaded file object
// //   if (!req.file) {
// //     return res.status(400).json({ error: "No PDF file uploaded" });
// //   }

// //   const pdfFile = req.file; // Uploaded PDF file
// //   PDFParser(pdfFile.path)
// //     .then((data) => {
// //       const text = data.text;
// //       const target = req.body.target; // Target language
// //       translateClient
// //         .translate(text, target)
// //         .then((results) => {
// //           const transRes = results[0];
// //           res.json({ translatedText: transRes });
// //         })
// //         .catch((err) => {
// //           console.error("ERROR:", err);
// //           res.status(500).json({ error: "Internal server error" });
// //         });
// //     })
// //     .catch((error) => {
// //       console.error("PDF parsing error:", error);
// //       res.status(400).json({ error: "PDF parsing error" });
// //     });
// // });

// // app.listen(PORT, () => {
// //   console.log(`Server is running on port ${PORT}`);
// // });

const express = require("express");
const { Translate } = require("@google-cloud/translate").v2;
const fs = require("fs");
const path = require("path"); // Import the path module
const dotenv = require("dotenv");
const PDFParser = require("pdf-parse");
const multer = require("multer");
const cors = require("cors"); // Import the CORS middleware
const { PDFDocument, rgb } = require('pdf-lib');

const ejs = require('ejs');

const pdf = require('html-pdf');



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const credentials = JSON.parse(process.env.CREDENTIALS);

if (!fs.existsSync("credentials.json")) {
  fs.writeFileSync("credentials.json", JSON.stringify(credentials));
}

process.env.GOOGLE_APPLICATION_CREDENTIALS = "credentials.json";

const translateClient = new Translate();

// Use CORS middleware
app.use(cors());

// Multer configuration for handling file uploads
const upload = multer({ dest: "uploads/" });

// Backend - Add an endpoint for detecting PDF language
app.post("/detect-language", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  const pdfFile = req.file; // Uploaded PDF file
  try {
    const text = await PDFParser(pdfFile.path).then(data => data.text);
    const [detection] = await translateClient.detect(text);
    res.json({ detectedLanguage: detection.language });
  } catch (error) {
    console.error("Error detecting PDF language:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Translation endpoint

app.post("/translate", upload.single("pdf"), async (req, res) => {
  console.log(req.file); // Log the uploaded file object
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  const pdfFile = req.file; // Uploaded PDF file
  try {
    const text = await PDFParser(pdfFile.path).then(data => data.text);

    const target = req.query.target; // Correctly extract target language from query parameters
    if (!target) {
      return res.status(400).json({ error: "Target language not specified" });
    }

    const [translatedText] = await translateClient.translate(text, target);

    // Generate file name based on uploaded file name and target language
    const uploadedFileName = path.parse(pdfFile.originalname).name; // Extract uploaded file name without extension
    const translatedFileName = `${uploadedFileName}_${target}.pdf`;
    console.log("Translated File Name:", translatedFileName); // Log the translated file name

    // Render the translated text as HTML
    const htmlContent = `
      <html>
        <head>
          <title>Translated Text</title>
        </head>
        <body>
          <h1>Translated Text</h1>
          <br/>
          <p>${translatedText}</p>
        </body>
      </html>
    `;

    // Convert HTML to PDF
    pdf.create(htmlContent).toBuffer((err, buffer) => {
      if (err) {
        console.error("Error creating PDF:", err);
        return res.status(500).json({ error: "Failed to generate PDF" });
      }
      
      // Set the file name in the response headers
      res.setHeader('Content-Disposition', `attachment; filename="${translatedFileName}"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(buffer);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new endpoint to get supported languages
app.get("/supported-languages", async (req, res) => {
  try {
    const [languages] = await translateClient.getLanguages();
    res.json(languages);
  } catch (error) {
    console.error("Error fetching supported languages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



async function htmlToPdf(html) {
  const { PDFDocument } = require('pdf-lib');

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  // Embed HTML into PDF
  await page.drawText(html, {
    x: 50,
    y: page.getHeight() - 50,
    size: 12,
  });

  // Serialize PDF
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


