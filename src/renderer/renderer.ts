const chatgptButton = document.getElementById("chatgpt");
const perplexityButton = document.getElementById("perplexity");

console.log("Renderer loaded");

chatgptButton?.addEventListener("click", () => {
  console.log("ChatGPT button clicked");
  window.dlp.openPlatform("chatgpt");
});

perplexityButton?.addEventListener("click", () => {
  console.log("Perplexity button clicked");
  window.dlp.openPlatform("perplexity");
});