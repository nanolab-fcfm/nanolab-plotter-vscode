# 🧪 NanoLab Plotter

**NanoLab Plotter** is a lightweight VS Code extension that automatically visualizes `.csv` files in a side panel using Plotly. It's perfect for experimental data workflows — just open a `.csv` and see the plot instantly.

---

## ✨ Features

- 📊 Automatically opens a plot beside your CSV file
- 🔽 Dropdown menus to choose X and Y axes
- 🧠 Remembers plot zoom/scale between files
- 📐 Fully resizable with responsive layout
- 🪄 Integrates seamlessly into your workflow

---

## 🚀 Quick Install

### ▶️ Option 1: Install via `.vsix`

1. [Download the latest `.vsix`](https://github.com/YOUR_GITHUB_USERNAME/nanolab-plotter/releases)
2. In VS Code:
   - Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
   - Run: `Extensions: Install from VSIX...`
   - Select the `.vsix` file
3. Open any `.csv` — the plot appears automatically

### ▶️ Option 2: Developer Mode

```bash
git clone https://github.com/nanolab-fcfm/nanolab-plotter-vscode.git
cd nanolab-plotter
npm install
code .
