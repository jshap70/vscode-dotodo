import * as vscode from 'vscode';
import * as fs from 'fs';
import { Task, matchCommentMarker } from './tasks';

// class File extends vscode.TreeItem {

//     constructor(
//         label,
//         public uri: vscode.Uri
//     ) {
//         super(label);
//     }

// }

export class TaskFactory {

    private constructors: Map<RegExp, (file: vscode.Uri, pos: vscode.Range, note: string, actor?: string) => Task> = new Map();

    // takes a text document and returns all of the matching tasks
    public scan(doc: vscode.TextDocument): Task[] {
        let text = doc.getText();
        let returns: Task[] = [];
        for (let [pattern, fun] of this.constructors.entries()) {
            let res: RegExpExecArray;
            while ( (res = pattern.exec(text)) !== null) {
                // let header = res[1];
                // note that `header` here is pattern's matching string by definition
                let actor = res[2];
                let note = res[3];
                let start = doc.positionAt(res.index); // index the match begins at, aka `^`
                let end = doc.positionAt(pattern.lastIndex); // index the match ends at, aka `$`
                let pos = new vscode.Range(start, end);
                fun(doc.uri, pos, note, actor);
            }
        }

        return returns;
    }

    // registers a new
    public registerTaskClass(type: string): void {
        this.constructors.set(matchCommentMarker(type), (file: vscode.Uri, pos: vscode.Range, note: string, actor?: string): Task => {
                return new Task(file, pos, type, note, actor);
        });
    }

}

export class TodoList implements vscode.TreeDataProvider<Task> {

    // TODO
    // private treeDidChangeData: vscode.EventEmitter<Task | undefined> = new vscode.EventEmitter<Task | undefined>();
    // public onDidChangeTreeData?: vscode.Event<Task | undefined> = this.treeDidChangeData.event;

    // actual storage map for tasks,
    // stored by file uri in string form b/c typescript maps only allow numbers and strings as keys
    private tasks: Map<vscode.Uri, Task[]> = new Map();

    constructor(
        private taskFactory: TaskFactory,
        files?: vscode.Uri[],
    ) {
        for (let file of files) {
            this.scanFile(file);
        }
    }

    public scanFile(file: vscode.Uri): vscode.ProviderResult<boolean> {
        return new Promise(resolve => {
            try {
                vscode.workspace.openTextDocument(file).then( doc => {
                    let text = doc.getText();
                    // fixme: run text through factory
                });
            } catch (err) {
                return false;
            }
        });
    }

    // TODO
    public getTreeItem(element: Task): vscode.ProviderResult<Task> {
        return element;
    }

    // TODO
    public getChildren(element?: Task): vscode.ProviderResult<Task[]> {
        if (element !== undefined) {
            let fileTasks = this.tasks.get(element.file);
            for (let task of fileTasks) {
                if (element.pos.isEqual(task.pos)) {
                    return [ task ];
                }
            }
            return [];
        } else {
            return Array.from( this.tasks.values() ).reduce((first, second) => first.concat(second));
        }
    }

}

// TODO: maybe use vscode.FileSystemWatcher?
