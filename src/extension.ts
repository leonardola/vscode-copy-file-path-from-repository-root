// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
var copy = require('copy-paste').copy;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('copy-file-path-from-repository-root.copyRelativePathFromRepositoryRoot', (uri) => {
		if (typeof uri === 'undefined') {
			if (vscode.window.activeTextEditor) {
				uri = vscode.window.activeTextEditor.document.uri;
			}
		}
		if (!uri) {
			vscode.window.showErrorMessage('Cannot copy relative path, as it appears that no file is opened (or it is very large');
			return;
		}

		let fileDir = uri.fsPath;
		
		const dirParts = fileDir.split('/');
		dirParts.pop(); //remove filename from path
		let found = false;
		let rootPath = null;
		let workspaceRoot = vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath;

		//Search repository root path
		do {
			fileDir = '/' + path.join(...dirParts);

			const files = fs.readdirSync(fileDir);

			const fileName = files.find((file) => {
				if ('.git' === file) {
					return true;
				}
				return false;
			});

			if (fileName) {
				rootPath = fileDir;
				found = true;
			}
			dirParts.pop();
		} while (
			!found &&
			dirParts.length &&
			fileDir !== workspaceRoot
		);
		
		let relativePath = uri.fsPath;

		if (!found){ 
			relativePath = relativePath.replace(workspaceRoot + "/",'');
			copy(relativePath);
			vscode.window.showInformationMessage('Repository root not found, copied relative to the workspace root');
		}else{
			relativePath = relativePath.replace(rootPath + "/",'');
			copy(relativePath);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
