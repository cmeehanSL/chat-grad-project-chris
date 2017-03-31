var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var ObjectID = require("mongodb").ObjectID;
var util = require("util");
var async = require("async");

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

        console.log("participants are " +  newChat.participants);

        // var q = async.queue(function(doc, callback) {
        //     userChats.update(
        //         {userId: doc.userId},
        //         {"$push": {"chats": doc.newUserChat}},
        //         {w: 1}, callback);
        //     }, Infinity);

        // Add it to the database of chats
        conversations.insertOne(newChat)
        .then(function(doc) {
            console
            console.log("inserted id of " + doc.insertedId);
            newChat._id = doc.insertedId;
            var newUserChat = {
                chatId: newChat._id,
                participants: newChat.participants,
                mostRecentMessage: null,
                unseenCount: 0
            }
            console.log("participants to update are " + newUserChat.participants);
            userChats.updateMany(
                {userId: {$in: newUserChat.participants}},
                {"$push": {"chats": newUserChat}}
            )
            .then(function(result) {
                if(result) {
                    console.log("should have updated all user chats to contain this new chat");
                    console.log("returning new chat");
                    res.json(newChat);
                }
                else {
                    console.log("logging error");
                    // console.log(err);
                    res.status(500);
                }
            });
        })
        .catch(function(err) {
            console.log(err);
            res.status(500);
        });

            //TODO check if such a conversation already exists!
            // insert the chat id and participants into each of the user's subscribed chat list

            // console.log("was a chat added? :: " + addedChat);


            // userChats.find({ userId: {$in: addedChat.participants}}).snapshot()
            // .forEach(function(userChatList) {
            //     userChats.update(
            //         {userId: }
            //     )
            // });

            // cursor.forEach(function(userChatList) {
            //
            //     var doc = {
            //         userId: userChatList.userId,
            //         newUserChat: newUserChat
            //     }
            //
            //     q.push(doc);
            //     // userChats.update(
            //     //     {userId: userChatList.userId},
            //     //     {"$push": {"chats": newUserChat}}
            //     // )
            // });
            //
            // q.drain = function() {
            //     if(cursor.isClosed()) {
            //         res.json(newMessage);
            //     }
            // }
            //
            // .then(res.json(newChat))
            // .catch(res.status(500));
        // });

    });

    app.post("/api/chat/:id", function(req, res) {
        console.log("received request to add message to chat id of " + req.params.id);
        var targetChatId = req.params.id;
        conversations.findOne({_id: ObjectID(targetChatId)}, function(err, chat) {
            if (chat) {
                console.log("found a conversation to add to");
                console.log("the conversation is " + util.inspect(chat, false ,null));
                var newMessage = {
                    sender: req.session.user,
                    content: req.body.content,
                    timestamp: req.body.timestamp,
                    chatId: chat._id
                }

                conversations.update(
                    {_id: ObjectID(targetChatId)},
                    {"$push": {"messages": newMessage}}
                ).then(function(err) {
                    // console.log("updated and result is " + util.inspect(err, false, null));
                })
                // Update the most recent message in current user's chat list
                // as well as recepients, and increment their unseen counter

                var q = async.queue(function(doc, callback) {
                    userChats.update(
                        {userId: doc.userId, "chats.chatId": doc.newChat.chatId},
                        {"$set": {"chats.$": doc.newChat}},
                        {w: 1}, callback);
                    }, Infinity);

                var cursor = userChats.find(
                    {chats: { $elemMatch: {chatId: chat._id}}}
                ).snapshot();

                cursor.forEach(function(userChatList) {
                    var userId = userChatList.userId;
                    var newChats = userChatList.chats.map(function(currentChat) {
                        console.log("looping through the found user chats");
                        console.log("current chat id is " + currentChat.chatId);
                        console.log("new message chat id is " + newMessage.chatId);
                        console.log("equal? : " + currentChat.chatId.equals(newMessage.chatId));
                        if (currentChat.chatId.equals(newMessage.chatId)) {
                            console.log("found a userChat to add to");
                            currentChat.mostRecentMessage = newMessage;
                            if (newMessage.sender !== userChatList.userId) {
                                currentChat.unseenCount++;
                            }
                            console.log("modified current chat within user chats is now " + util.inspect(currentChat, false, null));
                            var newUserChatList = {
                                userId: userId,
                                newChat: currentChat
                            }
                            q.push(newUserChatList);
                        }
                        return currentChat;
                    });
                    // userChats.update(
                    //     {userId: userId},
                    //     {"$set": {"chats": newChats}}
                    // );
                });

                q.drain = function() {
                    if(cursor.isClosed()) {
                        console.log("drained queue returning");
                        res.json(newMessage);
                    }
                }

                // res.json(newMessage);
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
