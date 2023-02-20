# archiver-rar

ArchiverJS RAR Support

Rar for Linux or WinRar for Windows should be installed.
Visit the [ArchiverJS](https://www.archiverjs.com/) for examples.

## Install

```bash
npm install archiver archiver-rar --save
```

## Quick Start

```js
// Auto register
const archiver = require('archiver-rar')(require('archiver'));
```

```js
// Manual register
const archiver = require('archiver');
const { module } = require('archiver-rar');

archiver.registerFormat('rar', module);
```

## Usage

```js
// Options
const options = {
    rate: 3, // Compress rate (0-5)
    baseDir: 'Backup', // Base directory in rar file
    password: 'dummy', // Password for the file
    comment: 'Rar file comment', // Comment of the file <string|Buffer|file.txt>
    extra: [], // Extra rar Switches
}

const archive = archiver('rar', options);
```

All [Rar Switches](https://documentation.help/WinRAR/HELPSwitches.htm) list.