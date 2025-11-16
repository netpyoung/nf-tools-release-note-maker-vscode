import * as vscode from 'vscode';
import * as utils from '../utils';
import * as setting from '../setting';

let _isCreating = false;

export async function Command_Create() {
  const rootFolder = utils.getOpenedRootFolder();
  if (!rootFolder) {
    vscode.window.showErrorMessage('Fail: Fail to find root folder');
    return;
  }

  const cmd = `dotnet release-note create --show-available-type  --config ${setting.setting.configFileName}`;
  const result = await utils.runCommand(cmd, rootFolder);
  if (!result.success) {
    vscode.window.showErrorMessage(result.stdout);
    return;
  }

  const availableTypes = result.stdout.trim().split(/\r?\n/);

  const panel = vscode.window.createWebviewPanel(
    'CreateFragmentForm',
    'Create Fragment',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.onDidDispose(() => {
    _isCreating = false;
  });

  const typesJson = JSON.stringify(availableTypes);

  const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Issue Fragment Form</title>
  <style>
    :root{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial;}
    body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f6f8fa;margin:0;padding:24px}
    .card{background:#fff;border-radius:12px;box-shadow:0 6px 20px rgba(16,24,40,.08);width:100%;max-width:540px;padding:20px}
    h1{font-size:1.125rem;margin:0 0 12px}
    form{display:grid;gap:12px}
    label{font-size:.875rem}
    input[type="text"],select{width:100%;padding:10px;border:1px solid #dfe3e8;border-radius:8px;font-size:1rem;}
    .row{display:flex;gap:8px}
    .actions{display:flex;gap:8px;justify-content:flex-end;margin-top:8px}
    button{padding:10px 14px;border-radius:8px;border:0;font-weight:600;cursor:pointer}
    button[type="submit"]{background:#0b6efd;color:#fff}
    button[type="button"]{background:#eef2ff;color:#0b6efd}
    .result{margin-top:14px;padding:12px;border-radius:8px;background:#f8fafc;border:1px solid #eef2ff}
    small.error{color:#d12f2f}
  </style>
</head>
<body>
  <main class="card" role="main">
    <h1>Create Fragment</h1>

    <form id="issueForm" novalidate>
      <div>
        <label for="fragmentType">Fragment Type</label>
        <select id="fragmentType" name="fragmentType" required aria-required="true">
          <option value="" disabled selected>Select a type</option>
        </select>
      </div>
      
      <div>
        <label for="issueName">Fragment Name</label>
        <input id="issueName" name="issueName" type="text" placeholder="+ / +hello / 123 / baz.1.2" required maxlength="120" />
        <small id="nameError" class="error" aria-live="polite" style="display:none"></small>
      </div>

     <div>
        <label for="issueName">Fragment Content</label>
        <input id="inputFragmentContent" name="issueName" type="text" placeholder="Enter fragment content" required maxlength="120" style="height: 60px; padding: 8px;"/>
        <small id="nameError" class="error" aria-live="polite" style="display:none"></small>
      </div>
      <div class="actions">
        <button type="button" id="resetBtn">Reset</button>
        <button type="submit">Submit</button>
      </div>
    </form>

    <div id="result" class="result" hidden aria-live="polite"></div>
  </main>

  <script>
    const vscode = acquireVsCodeApi();

    const types = ${typesJson};

    const select = document.getElementById("fragmentType");
    types.forEach(t => {
      const opt = new Option(t, t);
      select.add(opt);
    });

    const form = document.getElementById('issueForm');
    const nameInput = document.getElementById('issueName');
    const typeSelect = document.getElementById('fragmentType');
    const result = document.getElementById('result');
    const nameError = document.getElementById('nameError');
    const resetBtn = document.getElementById('resetBtn');

    const inputFragmentContent = document.getElementById('inputFragmentContent');

    function validateName() {
      const value = nameInput.value.trim();
      if (!value) {
        nameError.textContent = 'Issue Name is required.';
        nameError.style.display = 'inline';
        return false;
      }
      if (value.length > 120) {
        nameError.textContent = 'Issue Name must be 120 characters or fewer.';
        nameError.style.display = 'inline';
        return false;
      }
      nameError.textContent = '';
      nameError.style.display = 'none';
      return true;
    }

    nameInput.addEventListener('input', validateName);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const isNameOk = validateName();
      const typeValue = typeSelect.value;
      if (!isNameOk) return;
      if (!typeValue) {
        result.hidden = false;
        result.textContent = 'Please select a Fragment Type.';
        result.style.color = '#d12f2f';
        return;
      }

      // Build payload
      const payload = {
        fragmentName: nameInput.value.trim(),
        fragmentType: typeValue,
        fragmentContent: inputFragmentContent.value.trim(),
      };

      // For demo we just show the payload. Replace this with fetch() to send to your backend.
      result.hidden = false;
      result.style.color = '#0b1f2f';
      result.textContent = 'Creating';

      vscode.postMessage(payload);
    });

    resetBtn.addEventListener('click', () => {
      form.reset();
      result.hidden = true;
      nameError.style.display = 'none';
    });

    window.addEventListener('message', event => {
        result.textContent = event.data.message;
        result.style.color = '#d12f2f';
        })
  </script>
</body>
</html>
`;
  panel.webview.html = html;
  panel.webview.onDidReceiveMessage(msg => { OnMessage(panel, msg); });
}

function isEmpty(str: string | undefined | null): boolean {
  return !str || str.trim() === "";
}

async function OnMessage(panel: vscode.WebviewPanel, msg: any) {
  if (_isCreating) {
    panel.webview.postMessage({ message: 'Creating' });
    return;
  }


  try {
    _isCreating = true;

    const rootFolder = utils.getOpenedRootFolder();
    if (rootFolder) {
      panel.webview.postMessage({ message: 'Fail: Fail to find root folder' });
      return;
    }

    let content = msg.fragmentContent;
    if (isEmpty(content)) {
      content = 'Add your info here';
    }

    const cmd = `dotnet release-note create --config ${setting.setting.configFileName} --content ${content} ${msg.fragmentName}.${msg.fragmentType}.md`;
    const result = await utils.runCommand(cmd, rootFolder);
    if (!result.success) {
      panel.webview.postMessage({ message: result.stdout });
      return;
    }

    panel.dispose();
  } finally {
    _isCreating = false;
  }
}