# GenAI DLP Architecture

## Overview

GenAI DLP is a standalone Electron desktop application that monitors user interactions
with ChatGPT and Perplexity and detects sensitive content before it is submitted.

The application uses Electron's Main, Preload, and Renderer processes.

## Architecture Components

### 1. Main Process

Location: `src/main/main.ts`

Responsibilities:

- Create and manage the Electron application window.
- Load ChatGPT and Perplexity.
- Handle IPC requests from the Preload process.
- Display native warning dialogs.
- Scan PDFs using `pdf-parse`.
- Perform image OCR using Tesseract.
- Return scanning results to the Preload process.

### 2. Preload Process

Location: `src/preload/preload.ts`

Responsibilities:

- Intercept prompt submission on ChatGPT and Perplexity.
- Inspect prompt text before submission.
- Intercept file uploads.
- Send text, PDF, and image content for scanning.
- Display the native DLP warning when sensitive content is detected.
- Allow or block submission based on the user's choice.
- Modify AI-generated response text color.

### 3. DLP Detection Module

Location: `src/dlp/detector.ts`

Responsibilities:

- Detect the `WALLED_SENSITIVE` marker in text.
- Extract text from images through Tesseract OCR.
- Return detection results.

### 4. Renderer Process

Location: `src/renderer/`

Responsibilities:

- Display the application's user interface.
- Allow users to select ChatGPT or Perplexity.
- Provide the application navigation and interface.

## Data Flow

### Prompt Scanning

1. The user enters a prompt.
2. The Preload process intercepts the submission.
3. The prompt is checked for `WALLED_SENSITIVE`.
4. If no marker is found, submission proceeds normally.
5. If the marker is detected, a native warning dialog appears.
6. The user chooses Continue or Cancel.
7. Continue allows the original prompt to proceed.
8. Cancel blocks the submission.

### File Scanning

1. The user selects a file for upload.
2. The Preload process identifies the file type.
3. Text files are inspected directly.
4. PDFs are scanned using `pdf-parse`.
5. Images are scanned using Tesseract OCR.
6. Extracted content is checked for `WALLED_SENSITIVE`.
7. If detected, the user receives a native warning.
8. Continue allows the upload; Cancel blocks it.

### Response Modification

The Preload process observes AI-generated responses and modifies their text color to blue on ChatGPT and Perplexity.

## Technologies

- Electron
- TypeScript
- Node.js
- Vitest
- pdf-parse
- Tesseract OCR

## Security Considerations

- Content inspection occurs locally within the desktop application.
- The application detects the configured sensitive marker.
- The user is given the choice to continue or cancel when sensitive content is detected.
- Scanning failures are handled according to the application's fail-closed upload behavior.
- The application relies on the websites' DOM structure, which may change over time.

## Limitations

- Detection is marker-based and does not identify arbitrary sensitive information.
- Image scanning requires Tesseract OCR to be installed and available in PATH.
- PDF scanning primarily detects extractable text.
- Website DOM changes may affect interception or response-color modification.
- Only ChatGPT and Perplexity are currently supported.
