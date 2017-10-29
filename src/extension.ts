'use strict';

import * as vscode from 'vscode';
import { TaskFactory, TodoList  } from './todoProvider';

export function activate(context: vscode.ExtensionContext) {
    let labels: string[] = vscode.workspace.getConfiguration('dotodo').get("labels");

    let factory = new TaskFactory( labels );

    let todos: TodoList = new TodoList(factory);

    // vscode.workspace.findFiles("**/*.*", '**/node_modules/*', 10).then( (files) => {
    //     // FIXME: this is also finding a bunch of things we don't want, like binary files.
    //     //        it is also super duper slow
    //     if ( files !== undefined && files.length > 0 ) {
    //         files.forEach( ( file ) => {
    //             todos.scanFile(file);
    //         });
    //     }
    // });

    vscode.workspace.textDocuments.forEach( (doc) => {
        todos.scanFile(doc.uri);
    });

    function updateFile(e: vscode.TextDocumentChangeEvent) {
        todos.scanFile(e.document.uri);
    }

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument( (e) => todos.scanFile(e.document.uri) ));
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument( (e) => todos.scanFile(e.uri) ));

    /* Command for jumping to a location in a specific file;
       Used as the "on click" function in the tree.

       not exposed in the palate. */
    context.subscriptions.push(vscode.commands.registerCommand('dotodo.jumpTo', (path: vscode.Uri, pos: vscode.Range) => {
        vscode.workspace.openTextDocument(path).then( (doc) => {
            vscode.window.showTextDocument(doc).then( (editor) => {
                let sel = new vscode.Selection(pos.end.line, 0, pos.end.line, 0);
                vscode.window.activeTextEditor.selection = sel;
                vscode.window.activeTextEditor.revealRange(pos, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
            });
        });
    }));

    vscode.window.registerTreeDataProvider("dotodoExplorer", todos);
}

export function deactivate() {
    // TODO: destroy tree view
}
