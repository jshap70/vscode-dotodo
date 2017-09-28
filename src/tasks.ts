'use strict';

import * as vscode from 'vscode';

// Todo Object, stores relevant info i
export class Task extends vscode.TreeItem {
    public command: vscode.Command;

    constructor(
        public file: vscode.Uri,
        public pos: vscode.Range,
        public header: string,
        public note: string,
        public actor?: string
     ) {
        super(`${header}${actor !== undefined && actor !== "" ? actor : ""}: ${note}`);
        this.command = {
            command: 'dotodo.jumpTo',
            title: '',
            arguments: [this.file, this.pos],
        };
    }

}

export function matchCommentMarker(match: string) {
    // Remember a back reference only to the Task's note and the Task's header
    // This will let us create a factory for Tasks based on the header, while building only 1 regex for all of them
    //
    // cool stuff.
    let regexString = `^\s*(?:#|\/\/)\s*(${match})\s*(.*?)\s*:\s*(.*?)\s*?$`;
    // also btw is case insensitive
    return new RegExp(regexString, 'gim');
}
