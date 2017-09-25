'use strict';

import * as vscode from 'vscode';

// Todo Object, stores relevant info i
export class Task extends vscode.TreeItem {
    public command: vscode.Command;

    constructor(
        public file: vscode.Uri,
        public line: number,
        public header: string,
        public note: string,
     ) {
        super(header + ": " + note);
        this.command = {
            command: 'dotodo.jumpTo',
            title: '',
            arguments: [file, line],
        };
    }

}

export function MatchCommentMarker(match: string) {
    // Remember a back reference only to the Task's note and the Task's header
    // This will let us create a factory for Tasks based on the header, while building only 1 regex for all of them
    //
    // cool stuff.
    //
    // also btw is case insensitive
    return new RegExp("^\s*(?:#|\/\/)\s(" + match + "):\s*(.*)$", 'gim');
}
