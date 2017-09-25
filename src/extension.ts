'use strict';

import * as vscode from 'vscode';
import { TodoList } from './todoProvider';

let todos: TodoList;

export function activate(context: vscode.ExtensionContext) {

    todos = new TodoList(vscode.workspace);

    /* Command for jumping to a location in a specific file;
       Used as the "on click" function in the tree.

       not exposed in the palate. */
    context.subscriptions.push(vscode.commands.registerCommand('dotodo.jumpTo', (path: vscode.Uri, line: number) => {
        vscode.workspace.openTextDocument(path).then(doc => {
            vscode.window.showTextDocument(doc).then(editor => {
                // ?vscode.commands.executeCommand("revealLine", line, "center");
                let location = new vscode.Selection(line, 0, line, 0);
                vscode.window.activeTextEditor.selection = location;
                vscode.window.activeTextEditor.revealRange(location, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
            });
        });
    }));

}

export function deactivate() {
    // TODO: destroy tree view
    todos.getChildren.deactivate();
}
