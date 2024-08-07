import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
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

      // Calculate the height of the top 30%
      const topHeight = height * 0.43;

      // Split the top 30%
      const topPage = newPdfDoc.addPage([width, topHeight]);
      const topPageEmbedded = await newPdfDoc.embedPage(page, {
        left: 0,
        bottom: height - topHeight,
        right: width,
        top: height,
      });
      topPage.drawPage(topPageEmbedded, {
        x: 0,
        y: 0,
        width: width,
        height: topHeight,
      });
    }

    const pdfBytes = await newPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, "Top_30_Percent_Split_PDF.pdf");
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
