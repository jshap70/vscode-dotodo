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
    private constructors: Map<string, (file: vscode.Uri, pos: vscode.Range, note?: string, actor?: string) => Task>;

    constructor(labels: string[]) {
        this.constructors = new Map();
        for (let label of labels) {
            this.constructors.set(label.toLowerCase(), (file: vscode.Uri, pos: vscode.Range, note?: string, actor?: string): Task => {
                return new Task(file, pos, label, note, actor);
            });
        }
    }

    public get(header: string): (file: vscode.Uri, pos: vscode.Range, note?: string, actor?: string) => Task {
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

export class TodoList implements vscode.TreeDataProvider<Task | TaskHolder> {

    // TODO
    private treeDidChangeData: vscode.EventEmitter<Task | TaskHolder | undefined> = new vscode.EventEmitter<Task | undefined>();
    public onDidChangeTreeData?: vscode.Event<Task | TaskHolder | undefined> = this.treeDidChangeData.event;

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
                    this.taskFactory.scan(doc).then( (taskList) => {
                        if ( taskList !== undefined && taskList.length > 0 ) {
                            this.tasks.set(file, taskList);
                            this.treeDidChangeData.fire();
                        }
                    });
                });
            } catch (err) {
                return false;
            }
        });
    }

    // TODO
    public getTreeItem(element: Task | TaskHolder): vscode.ProviderResult<Task | TaskHolder> {
        return element;
    }

    // TODO
    public getChildren(element?: Task | TaskHolder): vscode.ProviderResult<Task[] | TaskHolder[]> {
        if (element !== undefined) {
            if ( element instanceof TaskHolder ) {
                let fileTasks = this.tasks.get(element.file);
                return fileTasks;
            } else {
                let fileTasks = this.tasks.get(element.file);
                for (let task of fileTasks) {
                    if (element.pos.isEqual(task.pos)) {
                        return [ task ];
                    }
                }
            }
        } else {
            let fileList: TaskHolder[] = [];
            for (let file of this.tasks.keys()) {
                fileList.push( new TaskHolder(file) );
            }
            return fileList;
        }
        return [];
    }

}

// TODO: maybe use vscode.FileSystemWatcher?

export class TaskHolder extends vscode.TreeItem {
    public collapsibleState: vscode.TreeItemCollapsibleState.Collapsed;

    constructor(
        public file: vscode.Uri,
    ) {
        super(`${ relativePath(file) }`, vscode.TreeItemCollapsibleState.Collapsed);
    }

}

function relativePath(path: vscode.Uri): string {
    let fsPath: string = path.fsPath;
    let root: string = vscode.workspace.rootPath;

    if (!root) {
        return fsPath;
    }

    if (fsPath.indexOf(root) === 0) {
        return fsPath.replace(root, "").substr(1);
    } else {
        return fsPath;
    }
}
