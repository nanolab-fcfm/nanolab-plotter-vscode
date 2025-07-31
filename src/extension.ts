import * as vscode from 'vscode';

let currentPanel: vscode.WebviewPanel | undefined;
let lastPlottedUri: vscode.Uri | undefined;
let lastActiveEditorUri: string | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('✅ NanoLab Plotter activated');

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (!editor) {
			lastActiveEditorUri = undefined;
			return;
		}

		const uriStr = editor.document.uri.toString();

		// Avoid re-plotting same file repeatedly
		if (uriStr === lastActiveEditorUri) return;
		lastActiveEditorUri = uriStr;

		if (!isCSV(editor.document)) {
			closePanel();
			return;
		}

		if (uriStr === lastPlottedUri?.toString()) {
			return; // same file already plotted
		}

		console.log('📊 Plotting CSV:', editor.document.fileName);

		if (currentPanel) currentPanel.dispose();
		currentPanel = showCSVPlot(editor.document);
		lastPlottedUri = editor.document.uri;
	});
}

function isCSV(document: vscode.TextDocument): boolean {
	return document.languageId === 'csv' || document.fileName.toLowerCase().endsWith('.csv');
}

function showCSVPlot(document: vscode.TextDocument): vscode.WebviewPanel {
	// Always show CSV on the left
	vscode.window.showTextDocument(document, {
		viewColumn: vscode.ViewColumn.One,
		preserveFocus: false,
		preview: true
	});

	const panel = vscode.window.createWebviewPanel(
		'csvPlot',
		`CSV Plot: ${vscode.workspace.asRelativePath(document.fileName)}`,
		vscode.ViewColumn.Two,
		{ enableScripts: true }
	);

	const rawText = document.getText();
	panel.webview.html = getWebviewContent(rawText);

	panel.onDidDispose(() => {
		currentPanel = undefined;
		lastPlottedUri = undefined;
	});

	return panel;
}

function closePanel() {
	if (currentPanel) {
		currentPanel.dispose();
		currentPanel = undefined;
		lastPlottedUri = undefined;
	}
}

function getWebviewContent(rawText: string): string {
	const cleanCSV = rawText
		.split('\n')
		.filter(line => !line.startsWith('#'))
		.join('\n');

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>CSV Plot</title>
	<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
	<style>
		body {
			margin: 0;
			padding: 1rem;
			height: 100vh;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			font-family: sans-serif;
		}
		#plot {
			flex-grow: 1;
		}
	</style>
</head>
<body>
	<h3>Select variables to plot:</h3>
	<div style="display: flex; gap: 0.5rem; align-items: center;">
		<label for="xSelect">X:</label>
		<select id="xSelect"></select>
		<label for="ySelect">Y:</label>
		<select id="ySelect"></select>
	</div>
	<div id="plot"></div>

	<script>
		const rawCSV = \`${cleanCSV.replace(/`/g, '\\`')}\`;

		function parseCSV(text) {
			const [header, ...rows] = text.trim().split('\\n');
			const cols = header.split(',').map(h => h.trim());
			const data = rows.map(row => row.split(',').map(v => parseFloat(v)));
			return { cols, data };
		}

		const { cols, data } = parseCSV(rawCSV);

		const xSelect = document.getElementById('xSelect');
		const ySelect = document.getElementById('ySelect');

		cols.forEach((col, idx) => {
			const optX = document.createElement('option');
			optX.value = idx;
			optX.text = col;
			xSelect.appendChild(optX);

			const optY = document.createElement('option');
			optY.value = idx;
			optY.text = col;
			ySelect.appendChild(optY);
		});

		xSelect.selectedIndex = 0;
		ySelect.selectedIndex = 1;

		let lastLayout = {
			margin: { t: 30 },
			xaxis: {},
			yaxis: {}
		};

		function updatePlot() {
			const xIdx = parseInt(xSelect.value);
			const yIdx = parseInt(ySelect.value);

			const xData = data.map(row => row[xIdx]);
			const yData = data.map(row => row[yIdx]);

			const trace = {
				x: xData,
				y: yData,
				type: 'scatter',
				mode: 'lines+markers',
				marker: { size: 6 }
			};

			Plotly.newPlot('plot', [trace], {
				...lastLayout,
				xaxis: { title: cols[xIdx] },
				yaxis: { title: cols[yIdx] }
			}).then(() => {
				lastLayout = document.getElementById('plot').layout;
			});
		}

		xSelect.addEventListener('change', updatePlot);
		ySelect.addEventListener('change', updatePlot);
		window.addEventListener('resize', () => Plotly.Plots.resize('plot'));

		updatePlot();
	</script>
</body>
</html>
`;
}

export function deactivate() {
	closePanel();
}
