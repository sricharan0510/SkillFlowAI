let cachedPdfParseClass = null;

const tryRequirePdfParse = () => {
  try {
    return require("pdf-parse");
  } catch (err) {
    return null;
  }
};

const resolvePdfParseClass = async () => {
  if (cachedPdfParseClass) return cachedPdfParseClass;

  const req = tryRequirePdfParse();
  if (req) {
    // CommonJS export shape: object with PDFParse class
    if (req.PDFParse) {
      cachedPdfParseClass = req.PDFParse;
      return cachedPdfParseClass;
    }
    // fallback if default export present
    if (req.default && req.default.PDFParse) {
      cachedPdfParseClass = req.default.PDFParse;
      return cachedPdfParseClass;
    }
    // sometimes the module itself may be the class
    if (typeof req === "function") {
      cachedPdfParseClass = req;
      return cachedPdfParseClass;
    }
  }

  try {
    const mod = await import("pdf-parse");
    if (mod && mod.PDFParse) {
      cachedPdfParseClass = mod.PDFParse;
      return cachedPdfParseClass;
    }
    if (mod && mod.default && mod.default.PDFParse) {
      cachedPdfParseClass = mod.default.PDFParse;
      return cachedPdfParseClass;
    }
    if (typeof mod === "function") {
      cachedPdfParseClass = mod;
      return cachedPdfParseClass;
    }
  } catch (err) {
    // ignore, will throw below
  }

  return null;
};

exports.extractTextFromPDF = async (buffer) => {
  const PDFParse = await resolvePdfParseClass();

  if (!PDFParse) {
    console.error("pdfExtractor: pdf-parse resolution failed", { cachedPdfParseClass });
    throw new Error("pdf-parse module not available or has unexpected export shape");
  }

  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    // destroy parser to free resources
    if (typeof parser.destroy === "function") {
      try { await parser.destroy(); } catch (e) { /* ignore */ }
    }

    return {
      text: result.text || "",
      pages: result.total || (Array.isArray(result.pages) ? result.pages.length : 0),
    };
  } catch (err) {
    console.error("pdfExtractor error:", err);
    throw err;
  }
};
