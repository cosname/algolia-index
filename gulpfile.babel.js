/*jshint esversion: 6 */
import gulp from 'gulp';
import babel from 'gulp-babel';
import through from 'through2';
import path from 'path';
import gutil from 'gulp-util';
import {
    File,
    PluginError
} from 'gulp-util';
import algoliasearch from 'algoliasearch';
import * as dotenv from 'dotenv';
import matter from 'gray-matter';
import "isomorphic-fetch";


let commits_url = 'https://api.github.com/repos/cosname/cosx.org/commits?since=' +
  curday +  'T00:00:00Z';


fetch(commits_url )
  .then(resp=>resp.json())
  .then(commits=>{
    if (commits.length > 0) {
      dotenv.load();

      const PATH = {
          content: "docs/content/**/*.md",
          index: "dist/index.json"
      };

      function getAliases(datum, file) {
          // Hugo use slug as url
          // if not available, will use filename as url
          if (datum.data.slug === undefined) {
              return path.basename(file.path, '.md');
          }
          // console.log(datum)
          return datum.data.slug;
      }

      function capitalize(value) {
           var baseurl = "https://cosx.org/"
           if(value.length < 13){
             return baseurl + "" + value.slice(0,value.length-3)
           }else if(value.length == 14){
             return baseurl + "chinar/" + value.slice(0,value.length-3)
           }else{
             return baseurl +
                value.slice(0, 4) + "/" +
                value.slice(5, 7) + "/" +
                value.slice(11, value.length-3)
           }
         }
      // function getAliases2(datum, file) {
      //     // Hugo use slug as url
      //     // if not available, will use filename as url
      //     if (datum.data.title === undefined) {
      //         return path.basename(file.path, '.md');
      //     }
      //
      //     return datum.data.title;
      // }

      gulp.task('index', () => {
          console.log("Starting to index rezhajulio.id ...");

          let index = [];
          gulp.src(PATH.content)
              .pipe(through.obj(function (file, enc, cb) {
                  this.push(file);
                  let datum = matter(file.contents.toString(), {
                      lang: 'yaml',
                      delims: ['---', '---']
                  });
                  console.log(datum)
                  if (datum.data.draft !== true) {
                      index.push({
                          content: datum.content,
                          uri: getAliases(datum, file),
                          title: datum.data.title,
                          autor: datum.data.author,
                          date: datum.data.date,
                          description: datum.data.description,
                          url: capitalize(path.basename(file.path)),
                          objectID: path.basename(file.path)
                      });
                  }

                  cb();
              }, function endStream(cb) {
                  let indexFile = new File({
                      base: path.join(__dirname, './dist/'),
                      cwd: __dirname,
                      path: path.join(__dirname, PATH.index)
                  });

                  indexFile.contents = new Buffer(JSON.stringify(index));

                  let client = algoliasearch(process.env.ALGOLIA_API_KEY, process.env.ALGOLIA_API_SECRET);
                  let db = client.initIndex('cosx.org');

                  // console.log("indexing to algolia...");
                  db.saveObjects(index, (err, content) => {
                      if (err) {
                          console.log(err);
                      }
                      cb();
                  });

                  this.push(indexFile);
              }))
              .pipe(gulp.dest('dist'));
      });
    }
  })
