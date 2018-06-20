'use strict';
const Compiler = require('angular-gettext-tools').Compiler;
const Extractor = require('angular-gettext-tools').Extractor;
const fs = require('fs');
const glob = require("glob");
const path = require("path");

function AngularGetTextPlugin(options) {
  this.compileTranslations = options.compileTranslations;
  this.extractStrings = options.extractStrings;
}

function compile(options) {
  // https://github.com/rubenv/grunt-angular-gettext/blob/master/tasks/compile.js#L7
  if (!Compiler.hasFormat(options.format)) {
    throw new Error('There is no "' + options.format + '" output format.');
  }

  const compiler = new Compiler({
    format: options.format
  });

  const filePaths = glob.sync(options.input);
  const output = compiler.convertPo(filePaths.map(fn => fs.readFileSync(fn, 'utf-8')));

  return output;
}

AngularGetTextPlugin.prototype.apply = function(compiler) {
  const options = this;

  compiler.plugin('emit', (compilation, done) => {
    if (options.compileTranslations) {
      const result = compile(options.compileTranslations);
      console.log(options);
      fs.writeFileSync(options.compileTranslations.dest, result);
    }

    if (options.extractStrings) {
      var extractor = new Extractor(options.extractStrings);

      const filePaths = glob.sync(options.extractStrings.input)
      filePaths.forEach( (fileName) => {
        var content = fs.readFileSync(fileName, 'utf8');
        extractor.parse(fileName, content);
      });
      fs.writeFileSync(options.extractStrings.destination, extractor.toString())
    }

    done();
  });
};

module.exports = AngularGetTextPlugin;
