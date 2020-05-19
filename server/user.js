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
const nodemailer = require("nodemailer");
const model_1 = require("./model");
const Utility_1 = require("./Utility");
const multipart = require("connect-multiparty");
const fs = require("fs");
const multipartMiddleware = multipart({ uploadDir: __dirname + '/Public' });
exports.router = express_1.Router();
exports.router.post('/file_upload', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repo = yield model_1.getPhotoRepository();
            const photo = new model_1.Photo();
            yield repo.save(photo);
            const file = req.body;
            const saved_name = '_' + photo.id + file.name;
            photo.url = saved_name;
            yield repo.save(photo);
            const base64data = file.content.replace(/^data:.*,/, '');
            fs.writeFile(__dirname + '/Public/' + saved_name, base64data, 'base64', (err) => {
                if (err) {
                    next(err);
                }
                else { }
            });
            res.send(photo.id.toString());
            return;
        }
        catch (e) {
            next(e);
        }
        /**
         try{
             const file_info = req["files"];
             const keys = Object.keys(file_info);
             const key = [keys];
             const info = file_info[key];
             const originalFilename = info["originalFilename"];
             const saved_path = info["path"];
             let saved_name = saved_path.split('/');
             saved_name = saved_name[saved_name.length-1];
             Printing.log('File :'+originalFilename+' uploaded successfully ' +
                 'under name: '+saved_name);
             const photo = new Photo();
             photo.url = saved_name;
             const repo = await getPhotoRepository();
             await repo.save(photo);
             res.send(photo.id.toString());
             return;
         } catch(err){
             next(err);
         }**/
    });
});
exports.router.post('/video_upload', multipartMiddleware, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file_info = req["files"];
            const keys = Object.keys(file_info);
            const key = [keys];
            const info = file_info[key];
            const originalFilename = info["originalFilename"];
            const saved_path = info["path"];
            let saved_name = saved_path.split('/');
            saved_name = saved_name[saved_name.length - 1];
            Utility_1.Printing.log('File :' + originalFilename + ' uploaded successfully ' +
                'under name: ' + saved_name);
            const video = new model_1.Video();
            video.url = saved_name;
            const repo = yield model_1.getVideoRepository();
            yield repo.save(video);
            res.send(video.id.toString());
            return;
        }
        catch (err) {
            next(err);
        }
    });
});
const business_email_address = 'renato.flores.business@gmail.com';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: business_email_address,
        pass: 'Renato201709244'
    }
});
function get_photo(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const photo_repo = yield model_1.getPhotoRepository();
        let photo = yield photo_repo.findOne({ id: id });
        if (photo == undefined) {
            photo = yield photo_repo.findOne({ id: 1 });
        }
        return photo;
    });
}
function generate_random_password(length) {
    let p = '';
    let chars_ = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXWZ";
    let chars = [];
    for (let i = 0; i < chars_.length; i++) {
        chars.push(chars_[i]);
    }
    for (let i = 0; i < length; i++) {
        p += Utility_1.Security.getRandomElement(chars);
    }
    return p;
}
function update_forced_user(user, body) {
    //This function behaves like update_ser. However, fields
    //Like tier, rol, earnings, etc can be directly set from body.
    user.tier = body.tier;
    user.credit = body.credit;
    user.rol = body.rol;
    user.earnings = body.earnings;
    user.password = body.password;
    user.address = body.address;
    user.apellidos = body.apellidos;
    user.correo = body.correo;
    user.fechaNac = new Date(body.fechaNac);
    user.genero = body.genero;
    user.name = body.name;
    user.telefono = body.telefono;
    return user;
}
function update_ser(user, body, first_time = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (first_time) { //We only set this variables the first time we create the user.
            const tiers = Object.keys(model_1.TIERS);
            user.tier = Utility_1.Security.getRandomElement(tiers);
            user.credit = model_1.TIERS[user.tier];
            user.earnings = 0;
        }
        user.photo = yield get_photo(body.photo);
        user.password = body.password;
        user.address = body.address;
        user.apellidos = body.apellidos;
        user.correo = body.correo;
        user.fechaNac = new Date(body.fechaNac);
        user.genero = body.genero;
        user.name = body.name;
        user.telefono = body.telefono;
        return user;
    });
}
exports.router.get('/users/reset_password/:userName', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repository = yield model_1.getUserRepository();
            const user = yield repository.findOne({
                correo: req.params.userName
            });
            if (user == undefined) {
                res.send('Failed to reset password.\n' +
                    'We could not find any user under username: ' + req.params.userName);
                return;
            }
            const og = user.password;
            user.password = generate_random_password(10);
            yield repository.save(user);
            Utility_1.Security.rollback_password(user, og, user.password).then(() => {
                Utility_1.Printing.log('Auto generated password has expired for user: ' + user.correo);
            });
            const mailOptions = {
                from: business_email_address,
                to: user.correo,
                subject: 'Password reset',
                html: '<h1>AllieSell</h1>' +
                    '<p>Tu password ha sido reestablecida con exito! <br>' +
                    'Tu nueva password temporal es: ' + user.password +
                    '<br> No olvides cambiarla tan pronto inicies sesion. ' +
                    'Ya que esta password tiene un tiempo maximo de duracion de 2 minutos.</p>' // plain text body
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err)
                    res.send('Failed to send password reset email :(\n' + err.message);
                else
                    res.send('OK');
            });
            Utility_1.Security.success(user, 'Started reset password process.');
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/users/complete_registration/:token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repository = yield model_1.getUserRepository();
            const user = yield repository.findOne({
                id: +req.params.token
            });
            if (user == undefined) {
                res.send('Failed to complete registration. Invalid TOKEN.');
                return;
            }
            user.status = 'active';
            yield repository.save(user);
            const cart_repo = yield model_1.getCartRepository();
            let cart = new model_1.Cart();
            cart.user = user;
            cart.active = true;
            yield cart_repo.save(cart);
            yield Utility_1.Security.success(user, 'Finished registration process.');
            res.send('OK');
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/users/delete_account/:token/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            /*
            * To perform this operation we must first make sure
            * there's an active session on AND
            * the owner of the session is either,
            * the the customer trying to update itself
            * or an admin.
            * Token is the User ID.
            * */
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.access) {
                res.send('You CANNOT use this feature without a valid session. Access denied.');
            }
            const repository = yield model_1.getUserRepository();
            const user = yield repository.findOne({
                id: +req.params.token
            });
            if (user == undefined) {
                res.send('Failed to delete account. Invalid User ID.');
                return;
            }
            if (!(sec.user.id == user.id || sec.user.rol == 'admin')) {
                res.send('Failed to delete account. A normal user can only ' +
                    'delete its own account. ');
            }
            user.status = 'down';
            yield repository.save(user);
            yield Utility_1.Security.success(sec.user, 'Marked account: ' + user.correo + ' as inactive.');
            res.send('OK');
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.post('/users/update/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.access) {
                res.send('You CANNOT usee this feature without a valid session. Access denied.');
                return;
            }
            const repository = yield model_1.getUserRepository();
            let user = yield repository.findOne({
                correo: req.body.correo
            });
            if (user == undefined) {
                res.send('Failed to update user. NO user found ' +
                    'with username: ' + req.body.correo);
                return;
            }
            if (!(sec.user.id == user.id || sec.user.rol == 'admin')) {
                res.send('Failed to update user. A normal user can only ' +
                    'edit itself. ');
                return;
            }
            user = yield update_ser(user, req.body);
            yield repository.save(user);
            yield Utility_1.Security.success(sec.user, 'Updated general information on profile: ' + user.correo);
            res.send('OK');
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/users/data/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.access) {
                res.send('You CANNOT usee this feature without a valid session. Access denied.');
                return;
            }
            res.send(sec.user);
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/users/history/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.admin) {
                res.send('You CANNOT usee this feature only admins allowed. Access denied.');
                return;
            }
            const rep = yield model_1.getHistoryRepository();
            const h = yield rep.find({
                relations: ["user"]
            });
            res.send(h);
            return;
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/users/sensitive_data/:session_token/:user_id', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.admin) {
                res.send('You CANNOT usee this feature only admins allowed. Access denied.');
                return;
            }
            const ur = yield model_1.getUserRepository();
            const u = yield ur.findOne({
                relations: ["photo"],
                where: { id: Number(req.params.user_id) }
            });
            if (u)
                res.send(u);
            else
                res.send('User DOES NOT exist.');
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.post('/users/register', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repository = yield model_1.getUserRepository();
            let user = new model_1.User();
            user.status = 'pending';
            user.rol = 'customer';
            user = yield update_ser(user, req.body, true);
            const dup_user = yield repository.findOne({
                correo: user.correo
            });
            if (dup_user != undefined) {
                res.send('Another user already exists with this email. Did you forget your password?');
                return;
            }
            yield repository.save(user);
            const link = model_1.BASE_URL + '/users/complete_registration/' + user.id;
            const mailOptions = {
                from: business_email_address,
                to: user.correo,
                subject: 'AllieSell Registration Confirmation',
                html: '<h1>AllieSell</h1>' +
                    '<p>Te damos la bienvenida a AllieSell! <br>' +
                    'Para completar tu registro, por favor selecciona el ' +
                    'siguiente link: ' + link + '</p>' // plain text body
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err)
                    res.send('Failed to send registration email :(\n' + err.message);
                else
                    res.send('OK');
            });
            yield Utility_1.Security.success(user, 'Started registration process.');
        }
        catch (err) {
            return next(err);
        }
    });
});
//--------------------------ADMIN SPECIFIC ROUTES---------------------------
exports.router.post('/users/force_register/:token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sec = yield Utility_1.Security.verify_session(req.params.token);
            if (!sec.access) {
                res.send('You must have an active session to access this feature.' +
                    'access denied.');
                return;
            }
            if (sec.user.rol != 'admin') {
                res.send('Only admins can use this feature. Access denied.');
                return;
            }
            const repository = yield model_1.getUserRepository();
            let user = new model_1.User();
            user.status = 'active';
            user = update_forced_user(user, req.body);
            const dup_user = yield repository.findOne({
                where: { correo: user.correo }
            });
            if (dup_user != undefined) {
                res.send('Another user already exists with this email. Failed to create user.');
                return;
            }
            yield repository.save(user);
            yield Utility_1.Security.success(sec.user, 'Created user: ' + user.correo);
            res.send('OK');
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/users/get_thumbnail/:token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sec = yield Utility_1.Security.verify_session(req.params.token);
            if (!sec.access) {
                res.send('You must have an active session to access this feature.' +
                    'access denied.');
                return;
            }
            let answer = { photo: sec.user.photo,
                name: sec.user.name + ' ' + sec.user.apellidos,
                tier: sec.user.tier, rol: sec.user.rol, id: sec.user.id };
            res.send(answer);
        }
        catch (e) {
            next(e);
        }
    });
});
exports.router.get('/users/all/:token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sec = yield Utility_1.Security.verify_session(req.params.token);
            if (!sec.admin) {
                res.send('You must have an active session to access this feature.' +
                    'Only admins allowed. access denied.');
                return;
            }
            const repo = yield model_1.getUserRepository();
            const answer = yield repo.find({
                relations: ["photo"]
            });
            res.send(answer);
        }
        catch (e) {
            next(e);
        }
    });
});
exports.router.post('/users/update_important/:token/:field', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            //This path is used if you want to edit a user's sensitive field
            //Like rol, tier, status, etc.
            const sec = yield Utility_1.Security.verify_session(req.params.token);
            if (!sec.access) {
                res.send('You must have an active session to access this feature.' +
                    'access denied.');
                return;
            }
            if (sec.user.rol != 'admin') {
                res.send('Only admins can use this feature. Access denied.');
                return;
            }
            const repository = yield model_1.getUserRepository();
            let user = yield repository.findOne({
                id: req.body.id
            });
            if (user == undefined) {
                res.send(`Failed to update field:${req.params.field}. NO user found with id:${req.body.id}`);
                return;
            }
            let change;
            switch (req.params.field) {
                case "tier":
                    user.tier = change = req.body.tier;
                    break;
                case "credit":
                    user.credit = change = Number(req.body.credit);
                    break;
                case "rol":
                    user.rol = change = req.body.rol;
                    break;
                case "status":
                    user.status = change = req.body.status;
                    break;
            }
            yield repository.save(user);
            yield Utility_1.Security.success(sec.user, 'Updated ' + req.params.field + ' on user: ' + user.correo + ' to: ' + change, req.body.comment);
            res.send('OK');
        }
        catch (err) {
            return next(err);
        }
    });
});
