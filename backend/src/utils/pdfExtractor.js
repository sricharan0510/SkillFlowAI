const pdfParse = require("pdf-parse");

exports.extractTextFromPDF = async (buffer) => {
  const data = await pdfParse(buffer);

  return {
    text: data.text,
    pages: data.numpages,
  };
};
