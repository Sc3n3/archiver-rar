var fs = require('fs');
var child = require('child_process');

class Rar {
  
  #options = {}

  #checkRar = (command, cb) => {
    try {
      var result = child.execSync(command, { stdio: [ 'ignore', 'pipe', 'ignore' ] });
      var bin = cb(result.toString());
      if (!bin) { throw new Error(); }
    } catch (e) {
      throw new Error('RAR not found!');
    }

    return bin;
  }

  constructor(options = {}){
    this.#options = { ...this.#options, ...options }

    if (process.platform === 'win32') {
      var command = "reg query HKEY_CLASSES_ROOT\\WinRAR\\shell\\open\\command /ve";
      this.bin = this.#checkRar(command, res => res.match(/\"([^\"]+)\"/)[1]);
    } else {
      // Linux
      var command = "whereis rar";
      this.bin = this.#checkRar(command, res => res.split(" ")[1]);
    }

    this.temp = require('temp').track();
    this.engine = require('stream').PassThrough();
    this.directory = this.temp.mkdirSync();
  }

  on(...args){
    return this.engine.on.apply(this.engine, args)
  }

  pipe(stream){
    return this.engine.pipe(stream)
  }

  append(content, file, done){
    if (file.sourceType === 'buffer') {
      content = require('stream').Readable.from(content);
    }

    var dirName = require('path').dirname(file.name);
    var fileName = require('path').basename(file.name);

    var dirPath = [this.directory, dirName].filter(v => v).join('/');

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    var stream = fs.createWriteStream(dirPath +'/'+ fileName);
    content.pipe(stream).on('finish', done);
  }

  finalize(){
    var commands = ['"'+ this.bin +'" a -r -ibck -ep'];

    this.#options.rate && commands.push('-m"'+ this.#options.rate +'"');
    this.#options.baseDir && commands.push('-ap"'+ this.#options.baseDir +'"');
    this.#options.password && commands.push('-hp"'+ this.#options.password +'"');

    if (this.#options.comment) {
      if (fs.existsSync(this.#options.comment)) {
        var comment = this.#options.comment;
      } else {
        var comment = this.temp.path({ suffix: '.txt' });
        fs.writeFileSync(comment, Buffer.from(this.#options.comment));  
      }
      
      commands.push('-z"'+ comment +'"');
    }

    if (Array.isArray(this.#options.extra)) {
      commands = [ ...commands, ...this.#options.extra ];
    }

    var archive = this.temp.path({ suffix: '.rar' });

    commands.push('"'+ archive +'" "'+ this.directory +'"');
    child.execSync(commands.join(" "), { stdio: 'ignore' });

    var stream = fs.createReadStream(archive);
    stream.pipe(this.engine).on('finish', this.temp.cleanupSync);
  }
}

var registerModule = (archiver) => {
  archiver.registerFormat('rar', Rar);
  return archiver;
};

registerModule.module = Rar;

module.exports = registerModule;