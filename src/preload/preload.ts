import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("dlp", {
    openPlatform: (platform: string) => {
        ipcRenderer.send("open-platform", platform);
    },

    checkSensitiveContent: (text: string) => {
        return ipcRenderer.invoke("check-sensitive-content", text);
    },

    scanImageOCR: (imageData: Uint8Array) => {
        return ipcRenderer.invoke("scan-image-ocr", imageData);
    },

    scanPDF: (pdfData: Uint8Array) => {
        return ipcRenderer.invoke("scan-pdf", pdfData);
    },
});

// Shared interception logic for both platforms
function installDLPInterception(
    platform: string,
    composerSelector: string,
    sendSelector: string
) {
    let checking = false;

    document.addEventListener(
        "click",
        async (event) => {
            const target = event.target as Element | null;
            const sendButton = target?.closest(sendSelector);

            if (!sendButton || checking) {
                return;
            }

            const composer = document.querySelector(
                composerSelector
            ) as HTMLElement | null;

            const prompt = composer?.innerText?.trim() ?? "";

            // Allow normal submission if no sensitive marker exists.
            if (!prompt.includes("WALLED_SENSITIVE")) {
                return;
            }

            // Block the original submission.
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            checking = true;

            try {
                console.log(`DLP: Sensitive prompt detected on ${platform}.`);

                const allowed = await ipcRenderer.invoke(
                    "check-sensitive-content",
                    prompt
                );

                if (allowed) {
                    console.log(`DLP: User chose Continue on ${platform}.`);

                    // Re-trigger the original submit action.
                    (sendButton as HTMLButtonElement).click();
                } else {
                    console.log(`DLP: User chose Cancel on ${platform}.`);
                }
            } catch (error) {
                console.error(`DLP error on ${platform}:`, error);
            } finally {
                checking = false;
            }
        },
        true
    );

    console.log(`GenAI DLP ${platform} interception initialized.`);
}

// ChatGPT
if (location.hostname.includes("chatgpt.com")) {
    installDLPInterception(
        "ChatGPT",
        '[contenteditable="true"][aria-label="Ask ChatGPT"]',
        'button[aria-label="Send"]'
    );
}

// Perplexity
if (location.hostname.includes("perplexity.ai")) {
    installDLPInterception(
        "Perplexity",
        '[contenteditable="true"][aria-label="Ask a follow-up"]',
        'button[aria-label="Submit"]'
    );
}

// File upload interception
function installFileUploadInterception(platform: string) {
    const approvedFiles = new WeakSet<File>();
    let processing = false;

    document.addEventListener(
        "change",
        async (event) => {
            const target = event.target as HTMLInputElement | null;

            if (!target || target.type !== "file") {
                return;
            }

            const files = Array.from(target.files ?? []);

            if (files.length === 0 || processing) {
                return;
            }

            // Allow files that have already passed DLP inspection.
            if (files.every((file) => approvedFiles.has(file))) {
                files.forEach((file) => approvedFiles.delete(file));
                return;
            }

            // Stop the website from handling the original file selection.
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            processing = true;

            console.log(
                `DLP: Inspecting ${files.length} file(s) on ${platform}.`
            );

            let blocked = false;

            try {
                for (const file of files) {
                    let extractedText = "";
                    let detected = false;

                    try {
                        // Image OCR
                        if (file.type.startsWith("image/")) {
                            console.log(
                                `DLP: Running OCR on ${file.name}.`
                            );

                            const imageData = new Uint8Array(
                                await file.arrayBuffer()
                            );

                            const result = await ipcRenderer.invoke(
                                "scan-image-ocr",
                                imageData
                            );

                            if (!result.success) {
                                console.error(
                                    `DLP: OCR failed for ${file.name}.`
                                );

                                blocked = true;
                                break;
                            }

                            extractedText = result.extractedText;
                            detected = result.detected;
                        }
                        // PDF scanning
                        else if (
                            file.type === "application/pdf" ||
                            file.name.toLowerCase().endsWith(".pdf")
                        ) {
                            console.log(
                                `DLP: Extracting text from PDF ${file.name}.`
                            );

                            const pdfData = new Uint8Array(
                                await file.arrayBuffer()
                            );

                            const result = await ipcRenderer.invoke(
                                "scan-pdf",
                                pdfData
                            );

                            if (!result.success) {
                                console.error(
                                    `DLP: PDF scanning failed for ${file.name}.`
                                );

                                // Fail closed if PDF extraction fails.
                                blocked = true;
                                break;
                            }

                            extractedText = result.extractedText;
                            detected = result.detected;
                        }
                        // Text-based file scanning
                        else {
                            extractedText = await file.text();

                            detected = extractedText.includes(
                                "WALLED_SENSITIVE"
                            );
                        }

                        if (!detected) {
                            continue;
                        }

                        console.log(
                            `DLP: Sensitive content detected in ${file.name}.`
                        );

                        const allowed = await ipcRenderer.invoke(
                            "check-sensitive-content",
                            `Sensitive content detected in uploaded file:\n\nFile: ${file.name}\n\nExtracted content:\n${extractedText}`
                        );

                        if (!allowed) {
                            blocked = true;

                            console.log(
                                `DLP: Upload blocked for ${file.name}.`
                            );

                            break;
                        }

                        console.log(
                            `DLP: User approved ${file.name}.`
                        );
                    } catch (error) {
                        console.error(
                            `DLP: Failed to inspect file ${file.name}:`,
                            error
                        );

                        // Fail closed if inspection fails.
                        blocked = true;
                        break;
                    }
                }
            } finally {
                processing = false;
            }

            if (blocked) {
                target.value = "";

                console.log(
                    `DLP: File selection blocked on ${platform}.`
                );

                return;
            }

            // All files have passed inspection or were approved.
            files.forEach((file) => approvedFiles.add(file));

            // Re-dispatch the event so the website can process the files.
            target.dispatchEvent(
                new Event("change", {
                    bubbles: true,
                })
            );
        },
        true
    );
}

// Install file upload interception
if (location.hostname.includes("chatgpt.com")) {
    installFileUploadInterception("ChatGPT");
}

if (location.hostname.includes("perplexity.ai")) {
    installFileUploadInterception("Perplexity");
}

// AI response text color modification
function installResponseColorChange(platform: string) {
    const applyColor = () => {
        if (platform === "ChatGPT") {
            const responses = document.querySelectorAll<HTMLElement>(
                '[data-markdown-text-style="assistant-message"]'
            );

            responses.forEach((response) => {
                response.style.setProperty("color", "#00BFFF", "important");
            });
        } else {
            const responses = document.querySelectorAll<HTMLElement>(
                '.prose, [class*="answer"]'
            );

            responses.forEach((response) => {
                response.style.setProperty("color", "#00BFFF", "important");
            });
        }
    };

    const initializeObserver = () => {
        applyColor();

        const observer = new MutationObserver(() => {
            applyColor();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        console.log(
            `GenAI DLP: Response color modification initialized for ${platform}.`
        );
    };

    if (document.body) {
        initializeObserver();
    } else {
        document.addEventListener("DOMContentLoaded", initializeObserver, {
            once: true,
        });
    }
}

// ChatGPT response color
if (location.hostname.includes("chatgpt.com")) {
    installResponseColorChange("ChatGPT");
}

// Perplexity response color
if (location.hostname.includes("perplexity.ai")) {
    installResponseColorChange("Perplexity");
}
