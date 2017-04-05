var server = require("../server/server");
var request = require("request");
var assert = require("chai").assert;
var sinon = require("sinon");
var sinonPromise = require("sinon-promise");
sinonPromise(sinon);

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var oauthClientId = "1234clientId";

var testUser = {
    _id: "bob",
    name: "Bob Bilson",
    avatarUrl: "http://avatar.url.com/u=test"
};
var testUser2 = {
    _id: "charlie",
    name: "Charlie Colinson",
    avatarUrl: "http://avatar.url.com/u=charlie_colinson"
};
var testGithubUser = {
    login: "bob",
    name: "Bob Bilson",
    avatar_url: "http://avatar.url.com/u=test"
};
var testToken = "123123";
var testExpiredToken = "987978";
var testConversationId = "58e268db1ccb4318807a9bd7";

describe("server", function() {
    var cookieJar;
    var db;
    var githubAuthoriser;
    var serverInstance;
    var dbCollections;
    var middleware = [];

    var webpack = require("webpack");
    var webpackDevMiddleware = require("webpack-dev-middleware");
    var webpackHotMiddleware = require("webpack-hot-middleware");
    var config = require("../webpack.deployment.config.js");
    var compiler = webpack(config);

    middleware.push(webpackDevMiddleware(compiler, {
        noInfo: false,
        publicPath: config.output.publicPath,
        stats: {colors: true}
    }));
    middleware.push(webpackHotMiddleware(compiler, {
        log: console.log
    }));
    this.timeout(20000);
    beforeEach(function() {
        cookieJar = request.jar();
        dbCollections = {
            users: {
                find: sinon.stub(),
                findOne: sinon.stub(),
                insertOne: sinon.spy()
            },
            userChats: {
                insertOne: sinon.promise().resolves("info"),
                findOne: sinon.stub(),
                find: sinon.stub()
            },
            conversations: {
                insertOne: sinon.spy(),
                findOne: sinon.stub(),
                update: sinon.promise().resolves("info")
            }
        };
        db = {
            collection: sinon.stub()
        };
        db.collection.withArgs("users").returns(dbCollections.users);
        db.collection.withArgs("conversations").returns(dbCollections.conversations);
        db.collection.withArgs("userChats").returns(dbCollections.userChats);


        githubAuthoriser = {
            authorise: function() {},
            oAuthUri: "https://github.com/login/oauth/authorize?client_id=" + oauthClientId
        };

        serverInstance = server(testPort, db, githubAuthoriser, middleware);
    });
    afterEach(function() {
        serverInstance.close();
    });
    function authenticateUser(user, token, callback) {
        sinon.stub(githubAuthoriser, "authorise", function(req, authCallback) {
            authCallback(user, token);
        });

        dbCollections.users.findOne.callsArgWith(1, null, user);

        request(baseUrl + "/oauth", function(error, response) {
            cookieJar.setCookie(request.cookie("sessionToken=" + token), baseUrl);
            callback();
        });
    }
    describe("GET /oauth", function() {
        var requestUrl = baseUrl + "/oauth";

        it("responds with status code 400 if oAuth authorise fails", function(done) {
            var stub = sinon.stub(githubAuthoriser, "authorise", function(req, callback) {
                callback(null);
            });

            request(requestUrl, function(error, response) {
                assert.equal(response.statusCode, 400);
                done();
            });
        });
        it("responds with status code 302 if oAuth authorise succeeds", function(done) {
            var user = testGithubUser;
            var stub = sinon.stub(githubAuthoriser, "authorise", function(req, authCallback) {
                authCallback(user, testToken);
            });

            dbCollections.users.findOne.callsArgWith(1, null, user);

            request({url: requestUrl, followRedirect: false}, function(error, response) {
                assert.equal(response.statusCode, 302);
                done();
            });
        });
        it("responds with a redirect to '/' if oAuth authorise succeeds", function(done) {
            var user = testGithubUser;
            var stub = sinon.stub(githubAuthoriser, "authorise", function(req, authCallback) {
                authCallback(user, testToken);
            });

            dbCollections.users.findOne.callsArgWith(1, null, user);

            request(requestUrl, function(error, response) {
                assert.equal(response.statusCode, 200);
                assert.equal(response.request.uri.path, "/");
                done();
            });
        });
        it("add user to database if oAuth authorise succeeds and user id not found", function(done) {
            var user = testGithubUser;
            var stub = sinon.stub(githubAuthoriser, "authorise", function(req, authCallback) {
                authCallback(user, testToken);
            });

            dbCollections.users.findOne.callsArgWith(1, null, null);

            request(requestUrl, function(error, response) {
                assert(dbCollections.users.insertOne.calledOnce);
                assert.deepEqual(dbCollections.users.insertOne.firstCall.args[0], {
                    _id: "bob",
                    name: "Bob Bilson",
                    avatarUrl: "http://avatar.url.com/u=test"
                });
                done();
            });
        });
    });
    describe("GET /api/oauth/uri", function() {
        var requestUrl = baseUrl + "/api/oauth/uri";
        it("responds with status code 200", function(done) {
            request(requestUrl, function(error, response) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
        it("responds with a body encoded as JSON in UTF-8", function(done) {
            request(requestUrl, function(error, response) {
                assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
                done();
            });
        });
        it("responds with a body that is a JSON object containing a URI to GitHub with a client id", function(done) {
            request(requestUrl, function(error, response, body) {
                assert.deepEqual(JSON.parse(body), {
                    uri: "https://github.com/login/oauth/authorize?client_id=" + oauthClientId
                });
                done();
            });
        });
    });
    describe("GET /api/user", function() {
        var requestUrl = baseUrl + "/api/user";
        it("responds with status code 401 if user not authenticated", function(done) {
            request(requestUrl, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with status code 401 if user has an unrecognised session token", function(done) {
            cookieJar.setCookie(request.cookie("sessionToken=" + testExpiredToken), baseUrl);
            request({url: requestUrl, jar: cookieJar}, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with status code 200 if user is authenticated", function(done) {
            authenticateUser(testUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("responds with a body that is a JSON representation of the user if user is authenticated", function(done) {
            authenticateUser(testUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar}, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body), {
                        _id: "bob",
                        name: "Bob Bilson",
                        avatarUrl: "http://avatar.url.com/u=test"
                    });
                    done();
                });
            });
        });
        it("responds with status code 500 if database error", function(done) {
            authenticateUser(testUser, testToken, function() {

                dbCollections.users.findOne.callsArgWith(1, {err: "Database error"}, null);

                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
    });
    describe("GET /api/users", function() {
        var requestUrl = baseUrl + "/api/users";
        var allUsers;
        beforeEach(function() {
            allUsers = {
                toArray: sinon.stub()
            };
            dbCollections.users.find.returns(allUsers);
        });
        it("responds with status code 401 if user not authenticated", function(done) {
            request(requestUrl, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with status code 401 if user has an unrecognised session token", function(done) {
            cookieJar.setCookie(request.cookie("sessionToken=" + testExpiredToken), baseUrl);
            request({url: requestUrl, jar: cookieJar}, function(error, response) {
                assert.equal(response.statusCode, 401);
                done();
            });
        });
        it("responds with status code 200 if user is authenticated", function(done) {
            authenticateUser(testUser, testToken, function() {
                allUsers.toArray.callsArgWith(0, null, [testUser]);

                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("responds with a body that is a JSON representation of the user if user is authenticated", function(done) {
            authenticateUser(testUser, testToken, function() {
                allUsers.toArray.callsArgWith(0, null, [
                        testUser,
                        testUser2
                    ]);

                request({url: requestUrl, jar: cookieJar}, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body), [
                        {
                            id: "bob",
                            name: "Bob Bilson",
                            avatarUrl: "http://avatar.url.com/u=test"
                        },
                        {
                            id: "charlie",
                            name: "Charlie Colinson",
                            avatarUrl: "http://avatar.url.com/u=charlie_colinson"
                        }
                    ]);
                    done();
                });
            });
        });
        it("responds with status code 500 if database error", function(done) {
            authenticateUser(testUser, testToken, function() {
                allUsers.toArray.callsArgWith(0, {err: "Database failure"}, null);

                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
    });
    describe("GET /api/user-chats", function() {
        var requestUrl = baseUrl + "/api/user-chats";
        // var userChats;
        // beforeEach(function() {
        //
        // });
        it("returns a 500 if the insertion fails", function(done) {
            dbCollections.userChats.insertOne = sinon.promise().rejects('info'),
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.userChats.findOne.callsArgWith(1, null, null);


                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
        it("creates a userChats entry for that user if not already existing", function(done) {
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.userChats.findOne.callsArgWith(1, null, null);

                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    assert(dbCollections.userChats.insertOne.calledOnce);
                    assert.deepEqual(dbCollections.userChats.insertOne.firstCall.args[0], {
                        userId: "bob",
                        chats: []
                    });
                    done();
                });
            });
        });
        it("returns the userChat object if there already is one", function(done) {
            var mockUserChats = {
                userId: testUser._id,
                chats: []
            };
            authenticateUser(testGithubUser, testToken, function() {
                dbCollections.userChats.findOne.callsArgWith(1, null, mockUserChats);
                request({url: requestUrl, jar: cookieJar}, function(error, response, body) {
                    assert.equal(response.statusCode, 200);
                    assert.deepEqual(JSON.parse(body), {
                        userId: "bob",
                        chats: []
                    });
                    done();
                });
            });
        });
    });
    describe("GET /api/chat/:id", function() {
        var requestUrl = baseUrl + "/api/chat/" + testConversationId;
        it("returns a 404 if no such conversation exists", function(done) {
            authenticateUser(testUser, testToken, function() {
                dbCollections.conversations.findOne.callsArgWith(1, null, null);
                request({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 404);
                    done();
                });
            });
        });
        it("returns the conversation object if such a conversation exists", function(done) {
            var mockConversation = {
                _id: "ff72",
                participants: [testUser._id, testUser2._id],
                messages: [{content: "hi", timestamp: 3, sender: testUser._id}]
            };
            authenticateUser(testUser, testToken, function() {
                dbCollections.conversations.findOne.callsArgWith(1, null, mockConversation);
                request({url: requestUrl, jar: cookieJar}, function(error, response, body) {
                    assert.equal(response.statusCode, 200);
                    assert.deepEqual(JSON.parse(body), {
                        _id: "ff72",
                        participants: [testUser._id, testUser2._id],
                        messages: [{content: "hi", timestamp: 3, sender: testUser._id}]
                    });
                    done();
                });
            });
        });
    });
    describe("POST /api/chat/:id", function() {
        var requestUrl = baseUrl + "/api/chat/" + testConversationId;
        var userChatsList;
        beforeEach(function() {
        });
        it("returns a 404 if no such conversation exists", function(done) {
            authenticateUser(testUser, testToken, function() {
                dbCollections.conversations.findOne.callsArgWith(1, null, false);
                request.post({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert.equal(response.statusCode, 404);
                    done();
                });
            });
        });
        it("calls conversation update", function(done) {

            dbCollections.conversations.findOne.callsArgWith(1, null, true);
            dbCollections.conversations.update = sinon.promise().resolves("updated");
            authenticateUser(testUser, testToken, function() {

                request.post({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert(dbCollections.conversations.update.calledOnce);
                    done();
                });
            });
        });
        it("updates the active user's user chats", function(done) {
            userChatsList = {
                forEach: sinon.stub()
            };
            dbCollections.userChats.find.returns(userChatsList);

            dbCollections.conversations.findOne.callsArgWith(1, null, true);
            dbCollections.conversations.update = sinon.promise().resolves("updated");
            dbCollections.userChats.update = sinon.promise().resolves("info");
            userChatsList.forEach.callsArgWith(0, {
                userId: testGithubUser.login
            });
            authenticateUser(testGithubUser, testToken, function() {
                request.post({url: requestUrl, jar: cookieJar}, function(error, response, body) {
                    assert(dbCollections.userChats.find.calledOnce);
                    assert(userChatsList.forEach.calledOnce);
                    assert(dbCollections.userChats.update.calledOnce);
                    assert.equal(response.statusCode, 200);
                    assert.deepEqual(JSON.parse(body),
                        {
                            sender: "bob"
                        }
                    )
                    done();
                });
            });
        });
        it("returns 500 if can't update active user chats", function(done) {
            userChatsList = {
                forEach: sinon.stub()
            };
            dbCollections.userChats.find.returns(userChatsList);

            dbCollections.conversations.findOne.callsArgWith(1, null, true);
            dbCollections.conversations.update = sinon.promise().resolves("updated");
            dbCollections.userChats.update = sinon.promise().resolves(false);
            userChatsList.forEach.callsArgWith(0, {
                userId: testGithubUser.login
            });
            authenticateUser(testGithubUser, testToken, function() {
                request.post({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert(dbCollections.userChats.find.calledOnce);
                    assert(userChatsList.forEach.calledOnce);
                    assert(dbCollections.userChats.update.calledOnce);
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
        it("ateempts to update other users user chats, responds with 500 if can't", function(done) {
            userChatsList = {
                forEach: sinon.stub()
            };
            dbCollections.userChats.find.returns(userChatsList);
            dbCollections.conversations.findOne.callsArgWith(1, null, true);
            dbCollections.conversations.update = sinon.promise().resolves("updated");
            dbCollections.userChats.update = sinon.promise().rejects("error");
            userChatsList.forEach.callsArgWith(0, {
                userId: testUser2._id
            });
            authenticateUser(testGithubUser, testToken, function() {
                request.post({url: requestUrl, jar: cookieJar}, function(error, response) {
                    assert(dbCollections.userChats.update.calledOnce);
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
    });
    describe("POST /api/chat", function(){
        var requestUrl = baseUrl + "/api/chat";
        // otherParticipants.forEach = sinon.stub();
        // var postData = {
        //     otherParticipants: []
        // };
        // var options = {
        //     url: requestUrl,
        //     jar: cookieJar,
        //     method: 'POST',
        //     body: postData,
        //     json: true,
        // };
        it("returns a 202 if such a conversation already exists", function(done) {
            dbCollections.userChats.findOne = sinon.promise().resolves("found a convo");
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "post"}, function(error, response) {
                    assert.equal(response.statusCode, 202);
                    done();
                });
            });
        });
        it("inserts a conversation if one not already existing", function(done) {
            dbCollections.conversations.insertOne = sinon.promise().resolves("inserted info");
            dbCollections.userChats.findOne = sinon.promise().resolves(false);
            dbCollections.updateMany = sinon.promise().resolves(true);
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "post"}, function(error, response) {
                    assert(dbCollections.conversations.insertOne.calledOnce);
                    assert.deepEqual(dbCollections.conversations.insertOne.firstCall.args[0], {
                        participants: ["bob"],
                        messages: [],
                        _id: undefined
                    });
                    // assert(dbCollections.userChats.updateMany.calledOnce);
                    done();
                });
            });
        });
        it("updates the user chats with the new conversation when a conversation is inserted", function(done) {
            dbCollections.conversations.insertOne = sinon.promise().resolves("inserted info");
            dbCollections.userChats.findOne = sinon.promise().resolves(false);
            dbCollections.userChats.updateMany = sinon.promise().resolves(true);
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "post"}, function(error, response, body) {
                    assert.equal(response.statusCode, 201);
                    // the json parse gets rid of the undefined id
                    assert.deepEqual(JSON.parse(body), {
                        participants: ["bob"],
                        messages: [],
                    });
                    done();
                });
            });
        });
        it("sends a 500 if the userChats are not updated", function(done) {
            dbCollections.conversations.insertOne = sinon.promise().resolves("inserted info");
            dbCollections.userChats.findOne = sinon.promise().resolves(false);
            dbCollections.userChats.updateMany = sinon.promise().resolves(false);
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "post"}, function(error, response) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
        it("sends a 500 if not inserted into the conversations", function(done) {
            dbCollections.conversations.insertOne = sinon.promise().rejects("not inserted");
            dbCollections.userChats.findOne = sinon.promise().resolves(false);
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "post"}, function(error, response) {
                    assert.equal(response.statusCode, 500);
                    done();
                });
            });
        });
    });
    describe("PUT /api/chat/reset/:id", function() {
        var requestUrl = baseUrl + "/api/chat/reset/" + testConversationId;
        it("returns 400 if error updating", function(done) {
            dbCollections.userChats.updateOne = sinon.promise().rejects("error");
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "put"}, function(error, response) {
                    assert.equal(response.statusCode, 400);
                    done();
                });
            });
        });
        it("returns 400 if not the count not reset", function(done) {
            dbCollections.userChats.updateOne = sinon.promise().resolves({
                matchedCount: 0
            });
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "put"}, function(error, response) {
                    assert.equal(response.statusCode, 400);
                    done();
                });
            });
        });
        it("returns 200 if the updated count is 1", function(done) {
            dbCollections.userChats.updateOne = sinon.promise().resolves({
                matchedCount: 1
            });
            authenticateUser(testGithubUser, testToken, function() {
                request({url: requestUrl, jar: cookieJar, method: "put"}, function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
    });
});
