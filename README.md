# SEAS (Steve's Extension for AppSheet)

**SEAS** is a Chrome extension designed to augment and enhance the AppSheet app editor and other aspects of appsheet.com.

## Currently Supported Features

### 📥 Download App Definition (JSON)

Download the complete definition of the app currently being edited in the AppSheet editor.

- **High Performance**: Uses "Main World" injection to access the app definition directly in the page context.
- **Memory Efficient**: Handles large app definitions (50MB+) without the overhead of extension message passing.
- **Fast**: Triggers a direct browser download for instantaneous results.

## Tech Stack

- **Framework**: [WXT](https://wxt.dev/) (Web Extension Toolbox)
- **UI Library**: [Svelte](https://svelte.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Architecture**: [Feature-Sliced Design (FSD)](https://feature-sliced.design/)

## Installation (Non-Developers)

If you just want to use the extension without setting up a development environment:

1.  **Download the Extension**: Go to the [Releases](https://github.com/seas010226/SEAS/releases) page and download the latest `seas-0.1.0-chrome.zip`.
2.  **Unzip the File**: Extract the zip archive to a folder on your computer.
3.  **Load in Chrome**:
    - Open `chrome://extensions`
    - Enable **Developer mode** (top right toggle)
    - Click **Load unpacked**
    - Select the folder you just extracted.

## Installation (Developers)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/seas010226/SEAS.git
    cd SEAS
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Build the extension**:
    ```bash
    npm run build
    ```
4.  **Load in Chrome**:
    - Open `chrome://extensions`
    - Enable **Developer mode**
    - Click **Load unpacked**
    - Select the `.output/chrome-mv3` folder

## Development

To start the development server with live-reloading:

```bash
npm run dev
```

## Vision

SEAS is built with a long-term vision of providing a suite of power-user tools for AppSheet developers, including enhanced UI tweaks, data diffing, and advanced editor augmentations.
