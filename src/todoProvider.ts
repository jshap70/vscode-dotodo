import * as fs from 'fs';
import * as vscode from 'vscode';
import { matchTask, Task } from './tasks';

// class File extends vscode.TreeItem {

//     constructor(
//         label,
//         public uri: vscode.Uri
//     ) {
//         super(label);
//     }

// }

export class TaskFactory {
    private constructors: Map<string, (file: vscode.Uri, pos: vscode.Range, note: string, actor?: string) => Task>;

    constructor(labels: string[]) {
        this.constructors = new Map();
        for (let label of labels) {
            this.constructors.set(label.toLowerCase(), (file: vscode.Uri, pos: vscode.Range, note: string, actor?: string): Task => {
                return new Task(file, pos, label, note, actor);
            });
        }
    }

    public get(header: string): (file: vscode.Uri, pos: vscode.Range, note: string, actor?: string) => Task {
        return this.constructors.get(header.toLowerCase());
    }

    // takes a text document and returns all of the matching tasks
    public scan(doc: vscode.TextDocument): Promise<Task[]> {
        return new Promise( (resolve) => {
            let returns: Task[] = [];
            let text = doc.getText();
            let res: RegExpExecArray;
            while ( (res = matchTask.exec(text)) !== null) {
                // `header` here is pattern's label matching string by definition
                let header = res[1];
                let fun = this.get(header);
                if ( fun !== undefined ) {
                    let actor = res[2];
                    let note = res[3];
                    let start = doc.positionAt(res.index); // index the match begins at, aka `^`
                    let end = doc.positionAt(matchTask.lastIndex); // index the match ends at, aka `$`
                    let pos = new vscode.Range(start, end);
                    returns.push(fun(doc.uri, pos, note, actor));
                }
            }
            resolve(returns);
        });
    }

}

export class TodoList implements vscode.TreeDataProvider<Task> {

    // TODO
    private treeDidChangeData: vscode.EventEmitter<Task | undefined> = new vscode.EventEmitter<Task | undefined>();
    public onDidChangeTreeData?: vscode.Event<Task | undefined> = this.treeDidChangeData.event;

    // actual storage map for tasks,
    // stored by file uri in string form b/c typescript maps only allow numbers and strings as keys
    private tasks: Map<vscode.Uri, Task[]> = new Map();

    constructor(
        private taskFactory: TaskFactory,
        files?: vscode.Uri[],
    ) {
        if ( files !== undefined ) {
            for (let file of files) {
                this.scanFile(file);
            }
        }
    }

    public scanFile(file: vscode.Uri): vscode.ProviderResult<boolean> {
        return new Promise( (resolve) => {
            try {
                vscode.workspace.openTextDocument(file).then( (doc) => {
                    this.taskFactory.scan(doc).then( (tasks) => {
                        this.tasks.set(file, tasks);
                        this.treeDidChangeData.fire();
                    });
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
        } else {
            if ( this.tasks.size > 0 ) {
                return Array.from( this.tasks.values() ).reduce((first, second) => first.concat(second));
            }
        }
        return [];
    }

}

// TODO: maybe use vscode.FileSystemWatcher?
