//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import { matchTask } from '../src/tasks';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Regex tests", () => {

    let fullText = `
    // TODO: fuck

    // k
    Lorem ipsum dolor sit amet, consectetur adipiscing elit,
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        # TODO: help
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

        # TODO (somebody else): that

    # d
	Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

    // This next line has spaces and tabs mixed, don't change it
    	# fixme (right - now
    help
    `;

    // Defines a Mocha unit test
    test("standard test", () => {
        let docText = `
        // TODO: fuck
        `;

        let k = matchTask.exec(docText);
        assert.equal("TODO", k[1]);
        assert.equal(undefined, k[2]);
        assert.equal("fuck", k[3]);
    });

    // FIXME: add tests for all the other cases in full text
});
