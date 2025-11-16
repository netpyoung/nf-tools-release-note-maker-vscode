import * as vscode from 'vscode';
import * as utils from '../utils';
import * as setting from '../setting';

let _isBuilding = false;

export async function Command_Build() {
  const rootFolder = utils.getOpenedRootFolder();
  if (!rootFolder) {
    vscode.window.showErrorMessage('Fail: Fail to find root folder');
    return;
  }
  const panel = vscode.window.createWebviewPanel(
    'BuildReleaseNoteForm',
    'Build ReleaseNote',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.onDidDispose(() => {
    _isBuilding = false;
  });
  const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Build ReleaseNote</title>
  <style>
    :root{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial;}
    body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f6f8fa;margin:0;padding:24px}
    .card{background:#fff;border-radius:12px;box-shadow:0 6px 20px rgba(16,24,40,.08);width:100%;max-width:540px;padding:20px}
    h1{font-size:1.125rem;margin:0 0 12px}
    form{display:grid;gap:12px}
    label{font-size:.875rem}
    input[type="checkbox"]{transform:scale(1.2);margin-right:6px;}
    .actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
    button{padding:10px 14px;border-radius:8px;border:0;font-weight:600;cursor:pointer}
    .btn-ok{background:#0b6efd;color:#fff}
    .result{margin-top:14px;padding:12px;border-radius:8px;background:#f8fafc;border:1px solid #eef2ff}
  </style>
</head>
<body>
  <main class="card" role="main">
    <h1>Build ReleaseNote</h1>

    <form id="formBuild" novalidate>
      <div>
        <label for="inputVersion">Version</label>
        <input id="inputVersion" name="inputVersion" type="text" placeholder="0.0.0" />
        <small id="nameError" class="error" aria-live="polite" style="display:none"></small>
      </div>

      <div>
        <label>
          <input id="checkKeep" type="checkbox" />
          Keep fragment files
        </label>
      </div>

      <div class="actions">
        <button type="submit" class="btn-ok">OK</button>
      </div>
    </form>

    <div id="result" class="result" hidden aria-live="polite"></div>
  </main>

  <script>
    const vscode = acquireVsCodeApi();
    
    const form = document.getElementById('formBuild');
    const checkKeep = document.getElementById('checkKeep');
    const inputVersion = document.getElementById('inputVersion');

    const result = document.getElementById('result');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const payload = {
        version: inputVersion.value.trim(),
        isAnswerKeep: checkKeep.checked
      };

      result.hidden = false;
      result.style.color = '#0b1f2f';
      result.textContent = 'Processing...';

      vscode.postMessage(payload);
    });

    window.addEventListener('message', event => {
      result.hidden = false;
      result.textContent = event.data.message;
      result.style.color = '#d12f2f';
    });
  </script>
</body>
</html>
`;
  panel.webview.html = html;
  panel.webview.onDidReceiveMessage(msg => { OnMessage(panel, msg); });
}

class OptBuild {
  version: string = '';
  isAnswerKeep: boolean = false;
}

function isEmpty(str: string | undefined | null): boolean {
  return !str || str.trim() === "";
}

async function OnMessage(panel: vscode.WebviewPanel, msg: OptBuild) {
  if (_isBuilding) {
    panel.webview.postMessage({ message: 'Building ...' });
    return;
  }

  try {
    _isBuilding = true;

    const rootFolder = utils.getOpenedRootFolder();
    if (!rootFolder) {
      panel.webview.postMessage({ message: 'Fail: Fail to find root folder' });
      return;
    }

    let version = msg.version;
    if (isEmpty(version)) {
      panel.webview.postMessage({ message: 'Fail: need version' });
      return;
    }

    let cmd = `dotnet release-note build --config ${setting.setting.configFileName} --version "${version}"`;
    if (msg.isAnswerKeep) {
      cmd = `${cmd} --keep`;
    }
    else {
      cmd = `${cmd} --yes`;
    }

    const result = await utils.runCommand(cmd, rootFolder);
    if (!result.success) {
      panel.webview.postMessage({ message: result.stdout });
      return;
    }

    panel.dispose();
  } finally {
    _isBuilding = false;
  }
}