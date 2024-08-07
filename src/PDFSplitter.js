import React, { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

const PDFSplitter = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const splitPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdfDoc = await PDFDocument.create();

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      // Create top half page
      const topPage = newPdfDoc.addPage([width, height / 2]);
      topPage.drawPage(page, {
        x: 0,
        y: -height / 2,
        width: width,
        height: height,
      });

      // Create bottom half page
      const bottomPage = newPdfDoc.addPage([width, height / 2]);
      bottomPage.drawPage(page, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    }

    const pdfBytes = await newPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, "Split_PDF.pdf");
  };

  const handleSplit = async () => {
    if (file) {
      await splitPDF(file);
    }
  };

  return (
    <div>
      <h1>PDF Splitter</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleSplit}>Split PDF</button>
    </div>
  );
};

export default PDFSplitter;
