var express = require("express");
var cookieParser = require("cookie-parser");

module.exports = function(port, db, githubAuthoriser, middleware) {
    var app = express();

    app.use(cookieParser());
    app.use(express.static("src/client/public"));

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
