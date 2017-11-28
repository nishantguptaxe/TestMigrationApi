var rest = require("restler");
var assert = require('assert');
var YAML = require('yamljs');
var File = require('File');
var fs = require('fs');

var envName = process.argv[2];
var apiFile = process.argv[3];
var backEndName = process.argv[4];

var length;

YAML.load(apiFile + '.yml', function (resultdev) {
    length = resultdev.length;
    console.log("length=" + length);

    /**
     * Run the recursive loop for the length of requests
     */
    (function loop() {
        if (length > 0) {
            var apiData = resultdev[length - 1];
            var basePath = apiData.basePath;
            console.log("basePath=" + basePath);
            var path = apiData.paths;
            console.log("path=" + path);
            var name = apiData.name;
            console.log("name="+name);
            var headers = apiData.headers;
            var queryData = apiData.query;
            console.log("queryData=" + queryData);
            var methodName = apiData.method;
            var bodyData = apiData.body;
            var definition = apiData.definition;
            var statusCode = apiData.status;
            var endPoint;

            /**
             * Read the environment file passed as command line argument
                          */
            YAML.load(envName + '.yml', function (result) {
                var envObject = result;
                var base_url = envObject.baseUrl;
                console.log("base_url="+base_url);
                console.log("basePath=" + basePath);

                if(basePath===null) {
                    endPoint = base_url + path;
                }
                else {
                    endPoint = base_url + basePath + path;
                }
                console.log("endPoint="+endPoint);
                    rest[methodName](endPoint, {
                        headers: headers,
                        query: queryData,
                        data: JSON.stringify(bodyData)
                    }).on('complete', function (data, response) {
                        console.log(response.statusCode);
                        assert.equal(statusCode, response.statusCode);
                        console.log(data);


                        fs.writeFile(name + backEndName +".json", JSON.stringify(data), 'utf8', function (err) {
                            if (err) {
                                    return console.log(err);
                            }

                            console.log("The file was saved!");
                        });
                        length = length - 1;
                        loop();
                    });
            });
        }
    }());

});
