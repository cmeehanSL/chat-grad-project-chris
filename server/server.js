var express = require("express");
var cookieParser = require("cookie-parser");
var cookie = require("cookie");
var bodyParser = require("body-parser");
var ObjectID = require("mongodb").ObjectID;
var util = require("util");
var async = require("async");

const url = require("url");
const http = require("http");
const WebSocket = require("ws");


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
    var userSockets = {};
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
                    userSockets[githubUser.login] = null;
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

        var otherParticipants = req.body.otherParticipants || [];
        var participants = otherParticipants.concat({id: activeUserId});

        var participantIds = [];
        participants.forEach(function(participant) {
            participantIds.push(participant.id);
        });

        // Create a new Chat
        var newChat = {
            participants: participantIds,
            messages: []
        };

        // Check to see if such a conversation already exists
        userChats.findOne(
            {userId: req.session.user,
                "chats.participants": {
                    "$size": participantIds.length,
                    "$all": participantIds
                }
            }
        ).then(function(doc) {
            if (doc) {
                // Such a conversation already exists
                // console.log("such a convo already exists");
                return res.sendStatus(202);
            }
            else {
                // console.log("convo doesn't exist yet");
                createNewConversation(newChat, req, res);
            }
        })

    });

    function createNewConversation(newChat, req, res) {
        // Add it to the database of chats
        conversations.insertOne(newChat)
        .then(function(doc) {
            newChat._id = doc.insertedId;
            var newUserChat = {
                chatId: newChat._id,
                participants: newChat.participants,
                mostRecentMessage: {
                    sender: req.session.user,
                    content: "Group Created",
                    timestamp: new Date(),
                    chatId: newChat._id
                },
                unseenCount: 0
            }
            userChats.updateMany(
                {userId: {$in: newUserChat.participants}},
                {"$push": {"chats": newUserChat}}
            )
            .then(function(result) {
                if (result) {
                    res.status(201);
                    res.json(newChat);
                    notifyOfNewConversation(newChat, req);
                }
                else {
                    res.sendStatus(500);
                }
            });
        })
        .catch(function(err) {
            res.sendStatus(500);
        });
    }

    function notifyOfNewConversation(newChat, req) {
        var participants = newChat.participants;

        participants.forEach(function(userId) {
            if(userId === req.session.user) {
                return;
            }
            var userSocket = userSockets[userId];
            console.log("the socket to send to is " + userSocket);
            if(userSocket) {
                console.log("attempting to send to the socket of user " + userId);
                userSocket.send(JSON.stringify({
                    type: "RECEIVED_NEW_CONVERSATION",
                    content: newChat
                }));
            }
        });
    }

    app.put("/api/chat/reset/:id", function(req, res) {
        var targetChatId = req.params.id;
        userChats.updateOne(
            {userId: req.session.user, "chats.chatId": ObjectID(targetChatId)},
            {"$set": {"chats.$.unseenCount": 0}}
        ).then(function(info) {
            if (info.matchedCount === 1) {
                res.sendStatus(200);
            }
            else {
                res.status(400).send("Did not reset any count");
            }
        })
        .catch(function(err) {
            res.status(400).send("Error locating user chat to reset");
        });
    });

    app.post("/api/chat/:id", function(req, res) {
        var targetChatId = req.params.id;
        conversations.findOne({_id: ObjectID(targetChatId)}, function(err, chat) {
            if (chat) {
                // console.log("found a conversation to add to");
                // console.log("the conversation is " + chat._id);
                var newMessage = {
                    sender: req.session.user,
                    content: req.body.content,
                    timestamp: req.body.timestamp,
                    chatId: chat._id
                }

                conversations.update(
                    {_id: ObjectID(targetChatId)},
                    {"$push": {"messages": newMessage}}
                ).then(function(writeResult) {
                    // console.log("calling update user chat lists");
                    updateUsersChatLists(newMessage, res);
                })
                .catch(function(err) {
                    return res.sendStatus(500);
                })
            }
            else {
                // console.log("sending the 404");
                res.sendStatus(404);
            }
        })

    });

    function updateUsersChatLists(newMessage, res) {

        userChats.find({chats: { $elemMatch: {chatId: newMessage.chatId}}})
        .forEach(function(userChatInfo) {

            // Only respond once the Active User's chats have been updated
            // (the others can continue updating in the background)
            if (userChatInfo.userId === newMessage.sender) {
                userChats.update(
                    {userId: userChatInfo.userId, "chats.chatId": newMessage.chatId},
                    {"$set": {"chats.$.mostRecentMessage": newMessage}}
                )
                .then(function(info) {
                    if (info) {
                        // console.log("updated active user chats so responding with json");
                        res.status(200).json(newMessage);
                    }
                    else {
                        console.log("not updated active user chats");
                        res.sendStatus(500);
                    }
                });
            }
            else {
                // Increment the other users unseen counts
                // console.log("attempting to increment another user's unseencount");
                userChats.update(
                    {userId: userChatInfo.userId, "chats.chatId": newMessage.chatId},
                    {
                        "$set": {"chats.$.mostRecentMessage": newMessage},
                        "$inc": {"chats.$.unseenCount": 1}
                    }
                )
                .then(function(info) {
                    notifyParticipant(userChatInfo.userId, newMessage);
                })
                .catch(function(err) {
                    console.log("caught error in updating");
                    res.sendStatus(500);
                })
            }
        });
    }

    function notifyParticipant(userId, newMessage) {
        var userSocket = userSockets[userId];
        console.log("the socket to send to is " + userSocket);
        if(userSocket) {
            console.log("attempting to send to the socket of user " + userId);
            userSocket.send(JSON.stringify({
                type: "RECEIVED_MESSAGE",
                content: newMessage
            }));
        }
    }

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
                res.status(200).json(currentUserChats);
            } else {
                // Create a new list of chats the user is privy to
                var newUserChats = {
                    userId: req.session.user,
                    chats: []
                }
                userChats.insertOne(newUserChats)
                .then(function(info) {
                    res.status(200).json(newUserChats);
                })
                .catch(function(err) {
                    res.status(500).send(err);
                })
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

    app.use(function(req, res) {
        res.send({msg: "hello"});
    });

    const server = http.createServer(app);
    const wss = new WebSocket.Server({server});


    // console.log("wss is " + util.inspect(wss, false, null));

    wss.on('connection', function connection(ws) {
        console.log("connected to socket");
        const location = url.parse(ws.upgradeReq.url, true);

        var receivedCookies = ws.upgradeReq.headers.cookie;
        var parsedCookies = cookie.parse(receivedCookies);
        console.log("session token is " + parsedCookies.sessionToken);
        var userId = sessions[parsedCookies.sessionToken].user;

        userSockets[userId] = ws;
        // ws.send("something");

        console.log(Object.keys(userSockets));

        ws.on('message', function incoming(message) {
            console.log("received: %s", message);
            // for(var key in userSockets) {
            //     userSockets[key].send("meeee");
            // }
        });

        ws.on('close', function close() {
            userSockets[userId] = null;
            console.log("socket connection closed");
        });

    })


    return server.listen(port);
};
