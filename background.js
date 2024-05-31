// Import the AWS SDK for JavaScript from the local file
importScripts('libs/aws-sdk.min.js');

console.log("Background script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "copyContent") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: copyPageContent,
        },
        async (results) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          } else {
            console.log("Content script executed.");
            const textContent = results[0].result;
            try {
              const entities = await fetchNamedEntities(textContent);
              console.log("Fetched named entities:", entities);
              sendResponse({ entities });
            } catch (error) {
              console.error("Error fetching named entities:", error);
              sendResponse({ error: error.message });
            }
          }
        }
      );
    });

    // Return true to indicate that the response is sent asynchronously
    return true;
  }
});

function copyPageContent() {
  const body = document.body;
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNode(body);
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand("copy");
  selection.removeAllRanges();
  console.log("Page content copied to clipboard.");
  return body.innerText || body.textContent; // Return the copied text
}

async function fetchNamedEntities(text) {
  console.log("Fetching named entities for text:", text);

  // Replace with your actual Access Key ID and Secret Access Key
  const accessKeyId = 'ACCESS_KEY';
  const secretAccessKey = 'SECRET_KEY';
  const region = 'eu-north-1';

  // Configure AWS SDK with your credentials
  AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
  });

  const endpoint = new AWS.Endpoint('https://runtime.sagemaker.eu-north-1.amazonaws.com');
  const request = new AWS.HttpRequest(endpoint, region);

  request.method = 'POST';
  request.path = '/endpoints/ENDPOINT_NAME/invocations';
  request.headers['Host'] = endpoint.host;
  request.headers['Content-Type'] = 'application/json';
  request.body = JSON.stringify({ inputs: text });

  const signer = new AWS.Signers.V4(request, 'sagemaker');
  signer.addAuthorization(AWS.config.credentials, new Date());

  console.log("Request:", request);

  try {
    const response = await fetch(request.endpoint.href + request.path, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    console.log("Response status:", response.status);
    console.log("Response status text:", response.statusText);

    if (!response.ok) {
      console.error("Response error text:", await response.text());
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log("API response data:", data);
    return data.entities; // Adjust based on your API response structure
  } catch (error) {
    console.error('Error fetching named entities:', error);
    throw error;
  }
}
