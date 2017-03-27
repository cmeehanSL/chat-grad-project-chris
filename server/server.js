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
                            // userChats: populateNewUserChats();
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

    // function populateNewUserChats() {
    //     var newUserChats = [];
    //     users.find().each(function(err, item) {
    //         if(item._id !== req.session.user) {
    //             // create a new chat
    //             chats.insertOne({
    //                 participants: [req.session.user, item._id]
    //                 messages: []
    //             }, function(err, newChat) {
    //                 // add the new chat Id and participants to the user chats
    //                 var newUserChat = {
    //                     chatId: newChat._id,
    //                     participants: newChat.participants
    //                 };
    //                 newUserChats.push(newUserChat);
    //                 // also add this to the other user
    //                 item.userChats
    //             });
    //             //
    //         }
    //     })
    // }


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

    // function getCurrentUser() {
    //
    //     var currentUser;
    //     users.findOne({
    //         _id: req.session.user
    //     }, function(err, user) {
    //         currentUser = user;
    //         return currentUser;
    //     });
    // }

    app.post("/api/chat", function(req, res) {
        var activeUserId = req.session.user;

        console.log(Object.keys(req));
        console.log(req.body.otherParticipants);
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
                console.log("should have updated the list");

                console.log("currently on userChatList where the id is " + userChatList.userId);
                console.log("and adding a chat with the id of " + newChat._id);
                // userChatList.chats.push({
                //     chatId: newChat._id,
                //     participants: newChat.participants
                // });
                //update the actual list one the database or it wont refresh
            });

            console.log("creating conversation with participants: " + participantIds );
            console.log("the new chat id is " + newChat._id);
            console.log("the newChat has keys " + Object.keys(newChat));
            res.json(newChat);
        // });

    });

    app.post("/api/chat/:id", function(req, res) {
        console.log("received request to add message to chat id of " + req.params.id);
        var targetChatId = req.params.id;
        conversations.findOne({_id: ObjectID(targetChatId)}, function(err, chat) {
            if(!err) {
                console.log("found chat");
                console.log("chat is " + chat);
                console.log("chat contains " + Object.keys(chat));
                var newMessage = {
                    sender: req.session.user,
                    content: req.body.content
                }

                var newMessages = chat.messages.concat(newMessage);
                conversations.update(
                    {_id: ObjectID(targetChatId)},
                    {"$set": {"messages": newMessages}}
                );
                console.log("should have added a new message to the chat")
                res.json(newMessage);
            }
            else {
                res.sendStatus(404);
            }
        })

    })

    app.get("/api/chat/:id", function(req, res) {
        console.log("received request for chat id of " + req.params.id);
        var targetChatId = req.params.id;
        conversations.find().forEach(function(item) {
            console.log("current chat id is " + item._id);
            console.log("is this equal to " + targetChatId + "? + " + (targetChatId === item._id));
        })
        conversations.findOne({"_id" : ObjectID(targetChatId)}, function(err, chat) {
            if(chat) {
                console.log("foundChat ");
                console.log("chat is " + chat);
                // console.log("chat contains " + Object.keys(chat));
                res.json(chat);
            }
            else {
                res.sendStatus(404);
            }
        });
    })

    app.get("/api/user", function(req, res) {
        console.log("get api user");
        users.findOne({
            _id: req.session.user
        }, function(err, user) {
            if (!err) {
                res.json(user);
            } else {
                console.log("sending a 500");
                res.sendStatus(500);
            }
        });
    });

    app.get("/api/user-chats", function(req, res) {
        console.log("get api user chats");
        userChats.findOne({
            userId: req.session.user
        }, function(err, currentUserChats) {
            if(currentUserChats) {
                console.log("found a userChats with this user");
                console.log("it is " + currentUserChats);
                res.json(currentUserChats);
            } else {
                console.log("creating a new blank userChats for this user");
                // Create a new list of chats the user is privy to
                var newUserChats = {
                    userId: req.session.user,
                    chats: []
                }
                // // loop through the other users and create new chat IDs
                // // and add them to the list of chats
                // users.find().each(function(err, item) {
                //     if(item._id !== req.session.user) {
                //         chats.insertOne({
                //             participants: [req.session.user, item._id],
                //             messages: []
                //         }, function(err, newChat) {
                //             newUserChats.chats.push({
                //                 chatId: newChat._id;
                //                 participants: []
                //             });
                //             userChats.findOne({
                //                 userId: item._id;
                //             }, function())
                //
                //         })
                //     }
                // })
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
