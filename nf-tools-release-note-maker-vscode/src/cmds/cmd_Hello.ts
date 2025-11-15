import * as vscode from 'vscode';

export function Command_Helloworld() {
	vscode.window.showInformationMessage('Hello World from Hello!');

	const panel = vscode.window.createWebviewPanel(
		'myForm',
		'사용자 입력폼',
		vscode.ViewColumn.One,
		{ enableScripts: true }
	);

	panel.webview.html = `
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <title>폼 예제</title>
                </head>
                <body>
                    <label>이름: <input type="text" id="name" /></label>
                    <button id="submitBtn">확인</button>

                    <script>
                        const vscode = acquireVsCodeApi();
                        document.getElementById('submitBtn').addEventListener('click', () => {
                            const name = document.getElementById('name').value;
                            vscode.postMessage({ name });
                        });
                    </script>
                </body>
                </html>
            `;

	panel.webview.onDidReceiveMessage(msg => {
		vscode.window.showInformationMessage(`입력값: ${msg.name}`);
	});
}
