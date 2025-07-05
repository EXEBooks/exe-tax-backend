const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/send-tax-pdf", async (req, res) => {
  const { email, taxData } = req.body;
  if (!email || !taxData) return res.status(400).send("Missing data");

  const doc = new PDFDocument();
  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", async () => {
    const pdfData = Buffer.concat(buffers);
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"EXE BOOKS LLP" <${process.env.USER_EMAIL}>`,
        to: email,
        subject: "Your Salary Tax Calculation - EXE BOOKS LLP",
        text: "Attached is your tax calculation in PDF format.",
        attachments: [{ filename: "Tax_Calculation.pdf", content: pdfData }],
      });
      res.send("Email sent!");
    } catch (error) {
      res.status(500).send("Email failed: " + error.message);
    }
  });

  doc.fontSize(18).text("EXE BOOKS LLP - Salary Tax Calculation", { align: "center" });
  doc.moveDown();
  doc.fontSize(12);
  for (const key in taxData) {
    doc.text(`${key.replace(/([A-Z])/g, " $1")}: ${taxData[key]}`);
  }
  doc.moveDown();
  doc.fontSize(9).fillColor("gray").text("Disclaimer: This calculation is an estimate only. Contact EXE BOOKS LLP for official assistance.", { align: "center" });
  doc.end();
});

app.listen(3000, () => console.log("Server running on port 3000"));
