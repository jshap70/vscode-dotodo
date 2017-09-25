import * as vscode from 'vscode';
import { Task, MatchCommentMarker } from './tasks';

class File extends vscode.TreeItem {

    constructor(
        label,
        public uri: vscode.Uri
    ) {
        super(label);
    }

}

export class TodoList implements vscode.TreeDataProvider<Task | File> {

    // TODO
    public onDidChangeTreeData?: vscode.Event<Task>;

    // actual storage map for tasks,
    // stored by file uri in string form b/c typescript maps only allow numbers and strings as keys
    private list: { [file: string]: Task[]; } = {};

    constructor(
        files?: vscode.TextDocument[],
    ) {
        for (let file of files) {
            // scan file
            // story by `file.uri` into this.list
        }
    }

    // TODO
    public getTreeItem(element: Task): vscode.TreeItem | Thenable<vscode.TreeItem> {
        throw new Error("Method not implemented.");
    }

    // TODO
    public getChildren(element?: Task): vscode.ProviderResult<Task[]> {
        if (element !== undefined) {
            let fileTasks = this.list[element.file.toString()];
            for (let task of fileTasks) {
                if (element.line === task.line) {
                    return [ task ];
                }
            }
        }

        throw new Error("Method not implemented.");
    }



}

// TODO: maybe use vscode.FileSystemWatcher?
