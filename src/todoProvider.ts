import * as vscode from 'vscode';
import * as fs from 'fs';
import Todo from './todo.ts'

class TodoNode extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly todo:  Todo,
    ) {
        super(label)
    }

}

// TODO: maybe use vscode.FileSystemWatcher?
