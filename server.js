var server = require("./server/server");
var oAuthGithub = require("./server/oauth-github");
var MongoClient = require("mongodb").MongoClient;

var port = process.env.PORT || 8080;
var dbUri = process.env.DB_URI || "mongodb://user1:Zuq$;ytN3)*_[u]*@ds129600.mlab.com:29600/chat-grad-project-chris";
var oauthClientId = process.env.OAUTH_CLIENT_ID || "7780bf013aca5a98f980";
var oauthSecret = process.env.OAUTH_SECRET || "01822d8e95ba9dc3c13aa243aa15cf52aced1eee";
var middleware = [];

MongoClient.connect(dbUri, function(err, db) {
    if (err) {
        console.log("Failed to connect to db", err);
        return;
    }
    var githubAuthoriser = oAuthGithub(oauthClientId, oauthSecret);

    if (process.env.NODE_ENV !== "production") {
        var webpack = require("webpack");
        var webpackDevMiddleware = require("webpack-dev-middleware");
        var webpackHotMiddleware = require("webpack-hot-middleware");
        var config = require("./webpack.deployment.config.js");
        var compiler = webpack(config);

        middleware.push(webpackDevMiddleware(compiler, {
            noInfo: false,
            publicPath: config.output.publicPath,
            stats: {colors: true}
        }));
        middleware.push(webpackHotMiddleware(compiler, {
            log: console.log
        }));
    }

    server(port, db, githubAuthoriser, middleware);
    console.log("Server running on port " + port);
});
