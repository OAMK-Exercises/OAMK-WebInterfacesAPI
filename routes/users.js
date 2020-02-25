const express = require("express");
const router = express.Router();
const usersModel = require("../services/usersModel.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const jwtKey = require('../jwtKey.json');

router.post("/register", (req,res) => {
    var user = req.body
    bcrypt.hash(user.password, saltRounds, function(err,hash){
        user = {
            _id: usersModel.getUsers().length +1,
            ...user,
            password: hash,
        }
        try {
            res.status(200).send(usersModel.addUser(user))
        }catch(err){
            console.log(err)
            res.send(err)
        }
    })
})

router.post("/login", (req, res) => {
    var user = req.body
    var loggedUser = usersModel.getByUserName(user)
    if(!loggedUser){
        res.status(404).send("Not found user")
    } else {
        let hash = loggedUser.password

        bcrypt.compare(user.password, hash, function(err, res){
            if(res){
                let payload = {
                    userName: loggedUser.userName,
                    name: loggedUser.name,
                    city: loggedUser.city,
                    country: loggedUser.country,
                    isAdmin: loggedUser.isAdmin,
                    email: loggedUser.email,
                    postings: loggedUser.postings
                }

                let options = {
                    expiresIn: "10d"
                }

                let token = jwt.sign(payload, jwtKey.key, options)

                res.status(200).json({token})
            } else {
                res.status(400).send("Password does not matches.")
            }
        })
    }
})

module.exports = router;