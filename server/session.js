"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const model_1 = require("./model");
exports.router = express_1.Router();
/*
* Alright, assuming we have a table with some users loaded, let's attempt to login:
* */
exports.router.post('/session/login', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //console.log(req.body);
            const repository = yield model_1.getSessionRepository();
            const user_repository = yield model_1.getUserRepository();
            const user = yield user_repository.findOne({
                where: { correo: req.body.username, password: req.body.password }
            });
            if (user == undefined) {
                res.send('Failed to login. Username or password incorrect.');
                return;
            }
            if (user.status != 'active') {
                res.send('Your credentials are correct but your account is not active.' +
                    'Please, contact the administrator and make sure you ' +
                    'have completed the registration process.');
                return;
            }
            //Check   if user doesn't have another session already up:
            const dup_sessions = yield repository.find({ where: { user: user, active: true } });
            for (let i = 0; i < dup_sessions.length; i++) { //We close any active session if any.
                let dup_session = dup_sessions[i];
                dup_session.active = false;
                yield repository.save(dup_session);
            }
            const session = new model_1.Session();
            session.user = user;
            session.active = true;
            yield repository.save(session);
            res.send(session.id.toString());
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/session/logout/:token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repository = yield model_1.getSessionRepository();
            const session = yield repository.findOne({ id: +req.params.token });
            if (session == undefined) {
                res.send('failed to logout. Session does not exist :(');
            }
            session.active = false;
            const result = yield repository.save(session);
            res.send(result);
        }
        catch (err) {
            return next(err);
        }
    });
});
