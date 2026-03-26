
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { ExtractedContent } from '../types';

interface ExportOptions {
  format?: string;
  language?: string;
  personaLabel?: string;
}

export const exportToTxt = (content: ExtractedContent, options?: ExportOptions) => {
  const text = `
ARISTOTLE 26 - UNIVERSAL AI SUMMARIZER
======================================

TITLE: ${content.title}
SOURCE: ${content.url}
TYPE: ${content.type.toUpperCase()}
${options?.format ? `FORMAT: ${options.format}` : ''}
${options?.language ? `LANGUAGE: ${options.language}` : ''}
${options?.personaLabel ? `PERSONA: ${options.personaLabel}` : ''}

--- CONTENT BREAKDOWN ---

${content.content}

--------------------------------------
Generated via Aristotle 26 Neural Bridge
  `.trim();

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Aristotle26_${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToMarkdown = (content: ExtractedContent, options?: ExportOptions) => {
  const markdown = `
# ARISTOTLE 26 - UNIVERSAL AI SUMMARIZER

## ${content.title}

- **Source:** [${content.url}](${content.url})
- **Type:** ${content.type.toUpperCase()}
${options?.format ? `- **Format:** ${options.format}` : ''}
${options?.language ? `- **Language:** ${options.language}` : ''}
${options?.personaLabel ? `- **Persona:** ${options.personaLabel}` : ''}

---

### CONTENT BREAKDOWN

${content.content}

---
*Generated via Aristotle 26 Neural Bridge*
  `.trim();

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Aristotle26_${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToPdf = (content: ExtractedContent, options?: ExportOptions) => {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - margin * 2;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(0, 212, 255); // Cyan
  doc.text("ARISTOTLE 26", margin, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("UNIVERSAL AI SUMMARIZER", margin, 26);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  const titleLines = doc.splitTextToSize(content.title, maxLineWidth);
  doc.text(titleLines, margin, 40);
  
  let currentY = 40 + (titleLines.length * 7);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Source: ${content.url}`, margin, currentY);
  currentY += 6;
  doc.text(`Type: ${content.type.toUpperCase()}`, margin, currentY);
  
  if (options?.format) {
    currentY += 6;
    doc.text(`Format: ${options.format}`, margin, currentY);
  }
  if (options?.language) {
    currentY += 6;
    doc.text(`Language: ${options.language}`, margin, currentY);
  }
  if (options?.personaLabel) {
    currentY += 6;
    doc.text(`Persona: ${options.personaLabel}`, margin, currentY);
  }
  
  currentY += 15;

  // Content
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  const contentLines = doc.splitTextToSize(content.content, maxLineWidth);
  
  // Handle multi-page
  contentLines.forEach((line: string) => {
    if (currentY > 280) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(line, margin, currentY);
    currentY += 7;
  });

  doc.save(`Aristotle26_${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
};

export const exportToDocx = async (content: ExtractedContent, options?: ExportOptions) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "ARISTOTLE 26",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: "UNIVERSAL AI SUMMARIZER",
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: content.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Source: ", bold: true }),
            new TextRun(content.url),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Type: ", bold: true }),
            new TextRun(content.type.toUpperCase()),
          ],
          spacing: { after: 100 },
        }),
        ...(options?.format ? [
          new Paragraph({
            children: [
              new TextRun({ text: "Format: ", bold: true }),
              new TextRun(options.format),
            ],
            spacing: { after: 100 },
          })
        ] : []),
        ...(options?.language ? [
          new Paragraph({
            children: [
              new TextRun({ text: "Language: ", bold: true }),
              new TextRun(options.language),
            ],
            spacing: { after: 100 },
          })
        ] : []),
        ...(options?.personaLabel ? [
          new Paragraph({
            children: [
              new TextRun({ text: "Persona: ", bold: true }),
              new TextRun(options.personaLabel),
            ],
            spacing: { after: 100 },
          })
        ] : []),
        new Paragraph({
          text: "CONTENT BREAKDOWN",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 400, after: 200 },
        }),
        ...content.content.split('\n').map(line => new Paragraph({
          text: line.trim(),
          spacing: { after: 120 },
        })),
        new Paragraph({
          text: "Generated via Aristotle 26 Neural Bridge",
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Aristotle26_${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
