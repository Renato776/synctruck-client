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
const Utility_1 = require("./Utility");
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart({ uploadDir: __dirname + '/Public' });
exports.router = express_1.Router();
exports.router.post('/generals/update/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.admin) {
                res.send('You CANNOT usee this feature without a valid session. Access denied.');
                return;
            }
            const repository = yield model_1.getEnterpriseRepository();
            let allieSell = yield repository.findOne(1);
            yield Utility_1.Utility.transfer_properties(allieSell, req.body);
            yield repository.save(allieSell);
            yield Utility_1.Security.success(sec.user, 'Updated general information on AllieSell.');
            res.send('OK');
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/generals/getData', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repository = yield model_1.getEnterpriseRepository();
            const allieSell = yield repository.findOne({
                relations: ["videos"],
                where: { id: 1 }
            });
            res.send(allieSell);
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/generals/getReports/:name/:x/:y', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield Utility_1.Utility.get_report(req.params.name, req.params.x, req.params.y);
            res.send(result);
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/chats/present/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.access) {
                res.send('You must login first to continue.');
                return;
            }
            const rep = yield model_1.getChatRepository();
            let r;
            if (sec.user.rol == 'agent')
                r = yield rep.find({
                    relations: ["agent", "customer", "messages", "messages.sender"],
                    where: {
                        agent: sec.user, active: true
                    }
                });
            else
                r = yield rep.find({
                    relations: ["agent", "customer", "messages", "messages.sender"],
                    where: {
                        customer: sec.user, active: true
                    }
                });
            res.send(r);
            return;
        }
        catch (err) {
            console.log(err);
            next(err);
            return;
        }
    });
});
//insert into C##renato."chat" ("rating","active","customerId","agentId") values (4,1,2,41);
//insert into C##renato."message"(
exports.router.post('/chats/reply', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //
            const user_repo = yield model_1.getUserRepository();
            const rep = yield model_1.getChatRepository();
            let targetId = req.body['receiver'];
            let target = yield user_repo.findOne(targetId); //Target could be either an agent or a customer.
            let senderId = req.body['sender'];
            let sender = yield user_repo.findOne(senderId);
            const chat = yield rep.findOne(req.body['chat']);
            const n = new model_1.Message();
            n.sender = sender;
            n.receiver = target;
            n.content = req.body['content'];
            n.chat = chat;
            const a = yield model_1.getMessageRepository();
            yield a.save(n);
            res.send('OK');
        }
        catch (err) {
            console.log(err);
            return next(err);
        }
    });
});
exports.router.get('/chats/new/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.access) {
                res.send({ error: 'You must login first.' });
                return;
            }
            const user_repo = yield model_1.getUserRepository();
            const rep = yield model_1.getChatRepository();
            const c = new model_1.Chat();
            c.customer = sec.user;
            c.active = true;
            //POssible agents:
            const agents = yield user_repo.find({
                relations: ["agent_chats"],
                where: { rol: 'agent' }
            });
            if (agents.length == 0) {
                res.send('THere are NO agents available at the moment');
                return;
            }
            function count_actives(array) {
                let count = 0;
                for (const a of array) {
                    if (a['active'])
                        count++;
                }
                return count;
            }
            let worker = undefined;
            let controller = 999;
            for (const agent of agents) {
                let count = count_actives(agent['agent_chats']);
                if (count < controller) {
                    controller = count;
                    worker = agent;
                }
            }
            if (!worker) {
                res.send('Could not assign an agent :(');
                return;
            }
            c.agent = worker;
            yield rep.save(c);
            res.send(c);
        }
        catch (err) {
            console.log(err);
            return next(err);
        }
    });
});
exports.router.get('/chats/end/:session_token/:rating', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.access) {
                res.send({ error: 'You must login first.' });
                return;
            }
            const user_repo = yield model_1.getUserRepository();
            const rep = yield model_1.getChatRepository();
            const target = yield rep.findOne({ active: true, customer: sec.user });
            if (!target) {
                res.send('Failed to end chat. Chat doesnt exist.');
                return;
            }
            target.active = false;
            target.rating = Number(req.params.rating);
            yield rep.save(target);
            res.send('Ended chat successfully!');
            return;
        }
        catch (err) {
            console.log(err);
            return next(err);
        }
    });
});
exports.router.get('/chats/past/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            const rep = yield model_1.getChatRepository();
            let r;
            if (!sec.access) {
                res.send('Failed. You must login first.');
                return;
            }
            if (sec.user.rol == 'agent')
                r = yield rep.find({
                    relations: ["agent", "customer", "messages", "messages.sender"],
                    where: {
                        agent: sec.user, active: false
                    }
                });
            else
                r = yield rep.find({
                    relations: ["agent", "customer", "messages", "messages.sender"],
                    where: {
                        customer: sec.user, active: false
                    }
                });
            res.send(r);
            return;
        }
        catch (err) {
            console.log(err);
            next(err);
            return;
        }
    });
});
