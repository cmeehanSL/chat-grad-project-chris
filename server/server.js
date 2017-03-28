var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var ObjectID = require("mongodb").ObjectID;

module.exports = function(port, db, githubAuthoriser, middleware) {
    var app = express();

    app.use(cookieParser());
    app.use(express.static("src/client/public"));
    app.use(bodyParser.json());

    middleware.forEach(function(item) {
        app.use(item);
    });

    var users = db.collection("users");
    var sessions = {};
    var userChats = db.collection("userChats");
    var conversations = db.collection("conversations");

    app.get("/oauth", function(req, res) {
        githubAuthoriser.authorise(req, function(githubUser, token) {
            if (githubUser) {
                users.findOne({
                    _id: githubUser.login
                }, function(err, user) {
                    if (!user) {
                        // TODO: Wait for this operation to complete
                        users.insertOne({
                            _id: githubUser.login,
                            name: githubUser.name,
                            avatarUrl: githubUser.avatar_url,
                        });
                    }
                    sessions[token] = {
                        user: githubUser.login
                    };
                    res.cookie("sessionToken", token);
                    res.header("Location", "/");
                    res.sendStatus(302);
                });
            }
            else {
                res.sendStatus(400);
            }

        });
    });

    app.get("/api/oauth/uri", function(req, res) {
        res.json({
            uri: githubAuthoriser.oAuthUri
        });
    });

    app.use(function(req, res, next) {
        if (req.cookies.sessionToken) {
            req.session = sessions[req.cookies.sessionToken];
            if (req.session) {
                next();
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(401);
        }
    });


    app.post("/api/chat", function(req, res) {
        var activeUserId = req.session.user;

        var otherParticipants = req.body.otherParticipants;

        var participantIds = [activeUserId];
        otherParticipants.forEach(function(participant) {
            participantIds.push(participant.id);
        });

        // Create a new Chat
        var newChat = {
            participants: participantIds,
            messages: []
        };

        // Add it to the database of chats
        conversations.insertOne(newChat);

        // insert the chat id and participants into each of the user's subscribed chat list
        userChats.find({ userId: {$in: newChat.participants}})
            .forEach(function(userChatList) {
                var newChats = userChatList.chats.slice();
                newChats.push({
                    chatId: newChat._id,
                    participants: newChat.participants
                });

                userChats.update(
                    {userId: userChatList.userId},
                    {"$set": {"chats": newChats}}
                );
            });
        res.json(newChat);

    });

    app.post("/api/chat/:id", function(req, res) {
        console.log("received request to add message to chat id of " + req.params.id);
        var targetChatId = req.params.id;
        conversations.findOne({_id: ObjectID(targetChatId)}, function(err, chat) {
            if (!err) {
                var newMessage = {
                    sender: req.session.user,
                    content: req.body.content,
                    timestamp: req.body.timestamp
                }

                var newMessages = chat.messages.concat(newMessage);
                conversations.update(
                    {_id: ObjectID(targetChatId)},
                    {"$set": {"messages": newMessages}}
                );
                res.json(newMessage);
            }
            else {
                res.sendStatus(404);
            }
        })

    })

    app.get("/api/chat/:id", function(req, res) {
        var targetChatId = req.params.id;
        conversations.findOne({"_id": ObjectID(targetChatId)}, function(err, chat) {
            if (chat) {
                res.json(chat);
            }
            else {
                res.sendStatus(404);
            }
        });
    })

    app.get("/api/user", function(req, res) {
        users.findOne({
            _id: req.session.user
        }, function(err, user) {
            if (!err) {
                res.json(user);
            } else {
                res.sendStatus(500);
            }
        });
    });

    app.get("/api/user-chats", function(req, res) {
        userChats.findOne({
            userId: req.session.user
        }, function(err, currentUserChats) {
            if (currentUserChats) {
                res.json(currentUserChats);
            } else {
                // Create a new list of chats the user is privy to
                var newUserChats = {
                    userId: req.session.user,
                    chats: []
                }
                userChats.insertOne(newUserChats);
                res.json(newUserChats);
            }
        });
    });

    app.get("/api/users", function(req, res) {
        users.find().toArray(function(err, docs) {
            if (!err) {
                var friendList = docs.map(function(user) {
                    return {
                        id: user._id,
                        name: user.name,
                        avatarUrl: user.avatarUrl
                    };
                }).filter(function(user) {
                    return user.id !== req.session.user;
                });
                res.json(friendList);
            } else {
                res.sendStatus(500);
            }
        });
    });

    return app.listen(port);
};
