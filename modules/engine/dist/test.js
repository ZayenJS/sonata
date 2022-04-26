"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
(name, password, word, email, stack, range, linenb, items) => {
    const buffer = [];
    buffer.push('<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Document</title>\n  </head>\n  <body>\n    {@ includes/header @}\n    <!--  -->\n    Hello ', (0, utils_1.escape)(((stack.linenb = 10), word)));
    buffer.push(' From @Sonata !\n    <p>', (0, utils_1.escape)(((stack.linenb = 11), 2 + 2 === 4 && 3 - 2 === 2 ? 'coucou' : 'hello')));
    buffer.push('</p>\n    <p>', (0, utils_1.escape)(((stack.linenb = 12), password ?? 'no password specified')));
    buffer.push('</p>\n\n    <!-- interpolation -->\n    <p>', (0, utils_1.escape)(((stack.linenb = 15), `the name is ${name}`)));
    buffer.push('</p>\n    <!-- short ternary -->\n    <p>', (0, utils_1.escape)(((stack.linenb = 17), name ? name : 'no name specified')));
    buffer.push('</p>\n    <p>', (0, utils_1.escape)(((stack.linenb = 18), name ? name : 'Rob')));
    buffer.push('</p>\n    <!-- interpolation + ternary/short ternary -->\n    <p>', (0, utils_1.escape)(((stack.linenb = 20), `Hello ${name ? name : 'James'}`)));
    buffer.push('</p>\n    <!-- multiple interpolation -->\n    <p>', (0, utils_1.escape)(((stack.linenb = 22),
        `Hello ${name ? 'Robert' : 'James'} im ${2 + 2 === 4 ? '18' : '22'}`)));
    buffer.push('</p>\n\n    ');
    if (name === 'Mark' || word === 'World') {
        buffer.push('\n    <p>', (0, utils_1.escape)(((stack.linenb = 25), name)));
        buffer.push(' (if)</p>\n    ');
    }
    else if (2 + 2 === 4) {
        buffer.push('\n    <p>nice !</p>\n    ');
    }
    else if (name === 'John') {
        buffer.push('\n    <p>', (0, utils_1.escape)(((stack.linenb = 29), name)));
        buffer.push(' ! (john elif)</p>\n    <ul>\n      <li>hello</li>\n      <li>world</li>\n      <li>blalabal</li>\n    </ul>\n    ');
    }
    else if (name === 'James') {
        buffer.push('\n    <p>', (0, utils_1.escape)(((stack.linenb = 36), name)));
        buffer.push(' ! (james else if)</p>\n    ');
    }
    else {
        buffer.push('\n    <p>', (0, utils_1.escape)(((stack.linenb = 38), name)));
        buffer.push(' ! (else)</p>\n    ');
    }
    buffer.push('\n    <!--  -->\n    ');
    for (const i of range(10)) {
        buffer.push('\n    <span>bonjour</span>\n    ');
    }
    buffer.push('\n    <!--  -->\n    ');
    for (const item of items) {
        buffer.push('\n    <p>', (0, utils_1.escape)(((stack.linenb = 46), item)));
        buffer.push('</p>\n    ');
    }
    buffer.push(' \n    ');
    let firstName = null;
    firstName = 'David';
    buffer.push('\n    ', (0, utils_1.escape)(((stack.linenb = 49), firstName)));
    buffer.push('\n\n\n    ');
    let num = null;
    num = [1, 2, 3];
    buffer.push('\n    ');
    for (const i of num) {
        buffer.push('\n    <p>', (0, utils_1.escape)(((stack.linenb = 54), i)));
        buffer.push('</p>\n    ');
    }
    buffer.push('\n\n\n    ');
    let n = null;
    n = 0;
    buffer.push('\n    ');
    while (n < 10) {
        buffer.push('\n      <p>Hello the number is: ', (0, utils_1.escape)(((stack.linenb = 60), n)));
        buffer.push('</p>\n    ');
        n += 3;
        buffer.push('\n    ');
    }
    buffer.push('\n\n    <form>\n      <input type="text" name="name" placeholder="Name" value="', (0, utils_1.escape)(((stack.linenb = 65), name)));
    buffer.push('" />\n      <input type="text" name="email" placeholder="Email" value="', (0, utils_1.escape)(((stack.linenb = 66), email)));
    buffer.push('" />\n      <input type="submit" value="Submit" />\n    </form>\n  </body>\n</html>\n');
    return buffer.join('');
};
