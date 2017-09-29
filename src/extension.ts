'use strict';

import * as vscode from 'vscode';
import { TaskFactory, TodoList  } from './todoProvider';

export function activate(context: vscode.ExtensionContext) {
    let config = vscode.workspace.getConfiguration('dotodo');

    let factory = new TaskFactory( config.get("dotodo.labels") );
    let todos: TodoList = new TodoList(factory);

    vscode.workspace.findFiles("*").then( (files) => {
        files.forEach( ( file ) => console.log(file.toString()));
    });

    /* Command for jumping to a location in a specific file;
       Used as the "on click" function in the tree.

       not exposed in the palate.

       ? use new vscode.Range(line,0,line,0) to jump to line # (I think)*/
    context.subscriptions.push(vscode.commands.registerCommand('dotodo.jumpTo', (path: vscode.Uri, pos: vscode.Range) => {
        vscode.workspace.openTextDocument(path).then( (doc) => {
            vscode.window.showTextDocument(doc).then( (editor) => {
                // ?vscode.commands.executeCommand("revealLine", line, "center");
                // let location = new vscode.Selection(line, 0, line, 0);
                // vscode.window.activeTextEditor.
                // vscode.window.activeTextEditor.selection = location;
                vscode.window.activeTextEditor.revealRange(pos, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
            });
        });
    }));

    vscode.window.registerTreeDataProvider("dotodoExplorer", todos);

}

export function deactivate() {
    // TODO: destroy tree view
}
