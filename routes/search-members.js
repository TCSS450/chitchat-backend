const express = require('express');
var router = express.Router();
const db = require('../utilities/utils').db;



router.post("/", (req, res) => {
    const templateTop = {"status": 3, "data": []};
    if (!req.body['searchstring']) {res.send(template);}
    const searchstring = req.body['searchstring'].toLowerCase();
    const searchtype = parseInt(req.body['searchtype']);
    const nicknameInput = req.body['loggedInUserNickname'];
    
    if (searchstring && searchtype && nicknameInput) {
        db.any(`SELECT memberid, email, nickname, firstname, lastname 
                    FROM Members WHERE is_verified = true`) // only want verified users
            .then(rows => {
                let result = [];
                let loggedInMemberId = 0;
                    for (let i = 0; i < rows.length; i++) {
                        const fullName = (rows[i].firstname + " " + rows[i].lastname);
                        const email = rows[i].email;
                        const nickname = (rows[i].nickname);
                        let template = {"firstName": rows[i].firstname,
                        "lastName": rows[i].lastname, "nickname": rows[i].nickname,
                        "memberid": rows[i].memberid};
                        if (searchtype === 1) { // NN
                            if (nickname.toLowerCase().includes(searchstring)) {
                                result.push(template);
                            }
                        } else if (searchtype === 2) { // Full name
                            if (fullName.toLowerCase().includes(searchstring)) {
                                result.push(template);
                            }
                        } else if (searchtype === 3) { // email
                            if (email.toLowerCase().includes(searchstring)) {
                                result.push(template);
                            }
                        } else if (searchtype === 4) { // NN, Full name, email
                            if (fullName.toLowerCase().includes(searchstring) ||
                                     email.toLowerCase().includes(searchstring) 
                                        ||  nickname.toLowerCase().includes(searchstring)) {
                                result.push(template);
                            }
                        } else { // searchtype was something other than 1,2,3
                            res.send(templateTop);
                        }
                        if (nicknameInput === nickname) {
                            loggedInMemberId = rows[i].memberid;
                        }
                    }
                    res.send({"status": (result.length > 0) ? 2 : 1, "loggedInMemeberId": loggedInMemberId, "data": result});
            }).catch(() => {res.send(templateTop)});
        }
    });
module.exports = router;