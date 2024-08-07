import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import "./PDFSplitter.css";

const PDFSplitter = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setFileName(uploadedFile ? uploadedFile.name : "");
  };

  const splitPDF = async (file) => {
    setIsProcessing(true);
    setProgress(0);

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

      // Update progress
      setProgress(((i + 1) / pdfDoc.getPageCount()) * 100);
    }

    const pdfBytes = await newPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, "Meesho Shipping Labels without Invoice.pdf");

    setIsProcessing(false);
    setProgress(100);
  };

  const handleSplit = async () => {
    if (file) {
      await splitPDF(file);
    }
  };

  return (
    <Container maxWidth="md">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Meesho Shipping Label Generator
          </Typography>
        </Toolbar>
      </AppBar>
      <Box mt={4} display="flex" justifyContent="center">
        <Card>
          <CardContent>
            <input
              accept="application/pdf"
              style={{ display: "none" }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Upload PDF
              </Button>
            </label>
            {fileName && (
              <Typography variant="body1" component="div" gutterBottom>
                {fileName}
              </Typography>
            )}
            {isProcessing && (
              <LinearProgress variant="determinate" value={progress} />
            )}
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSplit}
                fullWidth
                disabled={!file || isProcessing}
              >
                Generate labels
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default PDFSplitter;
