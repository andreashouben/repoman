var fs = require('fs'),
  ini = require('ini'),
  path = require('path');

/**
 * class Local
 *
 * @param {Object} repos: repository name and details mapping (schemas/repoman.Schema)
 * @param {Object} scms: SCM details mapping (schemas/scms.Schema)
 */
function Local(basedir) {
  this.basedir = basedir || ".";
}

Local.prototype.generate = function (cb) {
  var filelist = fs.readdirSync(this.basedir);
  var config = {};
  var err;

  var ignoreme = /^([.]|node_modules)/;
  filelist.forEach(function (filepath) {
    if (!filepath.match(ignoreme)) {
      var fsstat = fs.statSync(filepath);
      if (fsstat.isDirectory()) {
        var gitrepo = path.join(filepath,".git", "config");
        var svnrepo = path.join(filepath,".svn", "entries");
        var origin;

        if (fs.existsSync(gitrepo)) {
          var gitconfig = ini.parse(fs.readFileSync(gitrepo, 'utf-8'));
          origin = gitconfig['remote "origin"'].url;
          if (origin) {
            console.log("GIT repo found in: %s", filepath);
            config[filepath] = {
               type: "git",
               url: origin
            };
          }
 
        } else if (fs.existsSync(svnrepo)) {
          var svninfo = require('svn-info').sync(filepath);
          origin = svninfo.repositoryRoot;
          if (origin) {
            console.log("SVN repo found in: %s", filepath);
            config[filepath] = {
               type: "svn",
               url: origin
            };
          }
        }
      }
    }
  });
  cb(err, config);
};

module.exports = Local;
