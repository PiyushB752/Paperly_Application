# Paperly — Tiptap Document Pagination Editor

## Overview

Paperly is a prototype **Tiptap-based rich text editor with pagination**, built to help legal professionals visualize exactly how their documents will appear when printed or exported as PDF. The goal is to provide a **Google Docs / Microsoft Word–like page experience**, allowing users to see page boundaries, understand content flow across pages, and ensure formatting accuracy for official submissions such as USCIS filings. This implementation focuses on **print-accurate pagination**, using DOM-based content measurement to closely match the final printed output.

## Features

### Rich Text Editing

- Headings (H1–H4)
- Paragraphs
- Bold, italic, underline, strikethrough
- Bullet and numbered lists
- Text alignment (left, center, right)
- Undo / redo support

### Document Pagination

- Pagination based on **US Letter size (8.5 × 11 inches)**  
- **1-inch margins** on all sides
- Clear visual separation between pages
- Pagination updates dynamically when content is added, removed, or edited
- Multi-page document support

### Preview & Export

- Preview mode that shows paginated pages
- Visual page break indicators
- Print / PDF export with layout matching the preview
- Consistent typography and spacing between preview and print

## Tech Stack

- **Frontend:** React (Vite)
- **Editor:** Tiptap 
- **Styling:** CSS
- **Export:** Native browser print (PDF)

## Pagination Approach

### How It Works

1. Editor content is retrieved as HTML from Tiptap.
2. The HTML is parsed into block-level elements (paragraphs, headings, lists, etc.).
3. Each block is temporarily rendered in a hidden DOM container with:
   - Fixed content width
   - Matching font family
   - Matching font size and line height
4. The rendered height of each block is measured using `offsetHeight`.
5. Blocks are accumulated until the page’s available content height is exceeded.
6. When the limit is reached, a new page is created.
7. Each page is rendered using fixed dimensions to visually match printed output.

This approach ensures pagination is based on **actual rendered layout**, not character counts or approximations.

## Trade-offs & Limitations

- **Pagination is implemented in Preview mode**, not directly inside the live editor.
  - This was a deliberate trade-off to ensure print fidelity and stability within the assignment scope.
  - Live pagination would require a ProseMirror plugin using decorations or custom node views.

- **Long blocks (e.g., large paragraphs or tables)** are not split across pages.
  - If a block exceeds a single page’s height, it is placed on its own page.

- Performance is suitable for typical legal documents but could be optimized further for very large files.

## Future Improvements

Given more time, the following enhancements would be prioritized:

- Live pagination inside the editor using ProseMirror decorations
- Splitting long paragraphs and tables across page boundaries
- Page numbers
- Header and footer support
- DOCX export with preserved pagination
- Height measurement caching and debouncing for improved performance

## Getting Started

### Installation

```
1. cd client
2. npm install
3. npm run dev
```

### Usage

1. Launch the application in your browser.
2. Start drafting content in **Edit mode** using the toolbar options.
3. Switch to **Preview mode** to view the document split into paginated pages.
4. Review page breaks and formatting.
5. Use **Print / PDF** to export the document with layout matching the preview.

## Print & Export Behavior

Paperly uses native browser printing to generate PDF output.

- Page size is set to **US Letter**
- Margins are fixed at **1 inch**
- Each preview page maps directly to a printed page
- Page breaks in preview correspond to actual print page breaks

This ensures that what users see in Preview mode accurately reflects the final exported document.

## Deployment

Link - https://paperly-application.vercel.app/