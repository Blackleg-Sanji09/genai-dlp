# GenAI DLP

A standalone Electron desktop application designed to detect sensitive content before it is sent to Generative AI platforms.

GenAI DLP monitors prompts and file uploads on supported AI platforms, detects a predefined sensitive marker, and presents a native warning dialog that allows users to either cancel or continue.

## Features

- **Prompt Monitoring** — Intercepts prompts containing `WALLED_SENSITIVE` before submission.
- **File Upload Scanning** — Scans files before they are uploaded to supported platforms.
- **Text File Scanning** — Extracts and checks text content from text-based files.
- **PDF Scanning** — Extracts PDF text and checks for sensitive content.
- **Image OCR** — Uses Tesseract OCR to extract text from images.
- **Native Warning Dialog** — Displays a warning when sensitive content is detected.
- **User-Controlled Actions** — Users can cancel the operation or explicitly choose to continue.
- **AI Response Styling** — Changes the text color of AI responses on ChatGPT.
- **Multi-Platform Support** — Supports ChatGPT and Perplexity.

## Supported Platforms

| Platform   | Prompt Scanning | File Scanning | Response Color Modification             |
| ---------- | --------------- | ------------- | --------------------------------------- |
| ChatGPT    | Yes             | Yes           | Yes                                     |
| Perplexity | Yes             | Yes           | Implemented, pending final verification |

## Supported File Types

| File Type  | Detection Method                  |
| ---------- | --------------------------------- |
| Text files | Direct text extraction            |
| PDF        | Text extraction using `pdf-parse` |
| Images     | OCR using Tesseract               |

## How It Works

1. The application opens supported Generative AI platforms inside Electron.
2. The preload script monitors prompt submissions and file selections.
3. When a prompt or file is detected, its content is inspected for the marker `WALLED_SENSITIVE`.
4. If sensitive content is detected, the application displays a native warning dialog.
5. The user can:
    - **Cancel** — The prompt submission or file upload is blocked.
    - **Continue** — The user explicitly approves the operation, and the original content is allowed to proceed.
6. AI response styling is modified to visually distinguish responses.

## Architecture

The application uses Electron's main process, preload script, and renderer interface.

### Main Process

Responsible for:

- Creating and managing the Electron application window.
- Opening supported AI platforms.
- Displaying native warning dialogs.
- Performing image OCR using Tesseract.
- Extracting text from PDF files.

### Preload Script

Responsible for:

- Exposing controlled IPC functions to the application.
- Intercepting prompt submissions.
- Intercepting file upload selections.
- Sending content for inspection.
- Blocking or allowing operations based on user decisions.
- Applying AI response styling.

### Detection Logic

The DLP detection logic checks for the predefined sensitive marker:

```text
WALLED_SENSITIVE
```

The current implementation uses marker-based detection as a demonstration of the DLP interception workflow.

## Technology Stack

- Electron
- Node.js
- TypeScript
- Tesseract OCR
- `pdf-parse`
- HTML, CSS, and JavaScript

## Prerequisites

Before running the application, install:

- Node.js
- npm
- Tesseract OCR

Tesseract must be available in the system PATH for image OCR to work.

## Installation

Clone the repository:

```bash
git clone https://github.com/Blackleg-Sanji09/genai-dlp.git
cd genai-dlp
```

Install dependencies:

```bash
npm install
```

## Running the Application

Build the project:

```bash
npm run build
```

Start the application:

```bash
npm start
```

The `start` script automatically builds the application before launching Electron.

## Account Requirements

Users must sign in to their ChatGPT and Perplexity accounts within the application to access the platforms and use their functionality.

GenAI DLP does not provide or manage user accounts. Authentication is handled directly by the respective platforms.


## Testing

Test the application using files containing the marker:

```text
WALLED_SENSITIVE
```

Test cases include:

- Sensitive prompt detection.
- Normal prompt submission.
- Sensitive text file upload.
- Normal text file upload.
- Sensitive PDF detection.
- Normal PDF upload.
- Sensitive image detection through OCR.
- Normal image upload.
- Canceling sensitive content operations.
- Continuing after a sensitive content warning.

Test files are available in the `test-files/` directory.

## Limitations

- Detection currently relies on the predefined marker `WALLED_SENSITIVE`.
- Image OCR depends on Tesseract being installed and accessible.
- PDF scanning extracts text from PDFs; image-only PDFs may not be detected through text extraction.
- The application relies on the DOM structure of supported AI websites, which may change over time.
- The application currently supports ChatGPT and Perplexity.
- This is a demonstration implementation of a DLP workflow, not a production-grade enterprise DLP solution.

## Security Considerations

- Sensitive content inspection is performed locally by the application.
- The application provides a user-controlled warning before allowing detected content to proceed.
- If file inspection fails, the current implementation blocks the file selection.
- Detection is marker-based and does not identify arbitrary sensitive information such as credentials, personal information, or financial data.

## Project Status

This project demonstrates an Electron-based Data Loss Prevention workflow for Generative AI platforms, including prompt interception, file inspection, OCR, PDF text extraction, and user-controlled approval.

---

**GenAI DLP — Data Loss Prevention for Generative AI**
