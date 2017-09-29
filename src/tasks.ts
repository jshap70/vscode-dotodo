'use strict';

import * as vscode from 'vscode';

// Remember a back reference only to the Task's note and the Task's header
// This will let us create a factory for Tasks based on the header, while building only 1 regex for all of them
//
// cool stuff.
// also btw is case insensitive
//
// FIXME: make it so that this also can match `# TODO` w/ no message
export let matchTask = /^\s*(?:#|\/\/)\s*(.*?)\s*(\(.*?\))?\s*:\s*(.*?)\s*?$/gmi;

// Todo Object, stores relevant info i
export class Task extends vscode.TreeItem {
    public command: vscode.Command;

    constructor(
        public file: vscode.Uri,
        public pos: vscode.Range,
        public header: string,
        public note: string,
        public actor?: string,
     ) {
        super(`${header.toUpperCase()}${actor !== undefined && actor !== "" ? actor : ""}: ${note}`);
        this.command = {
            command: 'dotodo.jumpTo',
            title: '',
            arguments: [this.file, this.pos],
        };
    }

}
