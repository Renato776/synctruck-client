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
exports.router = express_1.Router();
exports.router.post('/products/insert/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.access) {
                res.send('You CANNOT usee this feature without a valid session. Access denied.');
                return;
            }
            let p = new model_1.Product();
            yield Utility_1.Utility.transfer_properties(p, req.body);
            p.owner = sec.user;
            yield Utility_1.Utility.product_repo.save(p);
            res.send('OK');
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.post('/products/categories/insert/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            const repository = yield model_1.getCategoryRepository();
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.access) {
                res.send('You CANNOT usee this feature without a valid session. Access denied.');
                return;
            }
            let ren = new model_1.Category();
            const parent = yield repository.findOne({ id: req.body.parent });
            if (!parent) {
                res.send('Fatal error. The parent category does NOT exist. ');
                return;
            }
            ren.name = req.body.name;
            ren.parent = parent;
            yield repository.save(ren);
            res.send('OK');
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/products/categories/all', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repository = yield model_1.getCategoryRepository();
            function child_traversal(parent) {
                return __awaiter(this, void 0, void 0, function* () {
                    let children = yield repository.find({ parent: parent });
                    if (children) {
                        if (Array.isArray(children)) {
                            for (let i = 0; i < children.length; i++) {
                                children[i] = yield child_traversal(children[i]);
                            }
                        }
                    }
                    parent.children = children;
                    return parent;
                });
            }
            const result = yield repository.find({ where: { parent: null } });
            for (let i = 0; i < result.length; i++) {
                result[i] = yield child_traversal(result[i]);
            }
            res.send(result);
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.post('/products/categories/delete/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            const repository = yield model_1.getCategoryRepository();
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.access) {
                res.send('You CANNOT usee this feature without a valid session. Access denied.');
                return;
            }
            const parent = yield repository.findOne({ id: req.body.id });
            if (!parent) {
                res.send('Fatal error. The parent category does NOT exist. ');
                return;
            }
            yield repository.delete(parent);
            res.send('OK');
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.post('/products/categories/update/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            const repository = yield model_1.getCategoryRepository();
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.access) {
                res.send('You CANNOT usee this feature without a valid session. Access denied.');
                return;
            }
            const parent = yield repository.findOne({ id: req.body.id });
            if (!parent) {
                res.send('Fatal error. The parent category does NOT exist. ');
                return;
            }
            parent.name = name;
            yield repository.save(parent);
            res.send('OK');
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.post('/products/insert_many/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            const sec = yield Utility_1.Security.verify_session(req.params.session_token);
            if (!sec.access) {
                res.send('You CANNOT usee this feature without a valid session. Access denied.');
                return;
            }
            let raw_source = req.body.source;
            let source_entries = raw_source.split(',');
            let source = [];
            let aux = {};
            let j = 0;
            for (let i = 0; i < source_entries.length; i++) {
                let entry = source_entries[i].trim();
                switch (j) {
                    case 0:
                        aux["codigo"] = entry;
                        break;
                    case 1:
                        aux["name"] = entry;
                        break;
                    case 2:
                        aux["photo"] = yield (Utility_1.Utility.get_photo(Number(entry)));
                        break;
                    case 3:
                        aux["description"] = entry;
                        break;
                    case 4:
                        aux["category"] = entry;
                        break;
                    case 5:
                        aux["price"] = isNaN(entry) ? 0 : Number(entry);
                        break;
                    case 6:
                        aux["stock"] = isNaN(entry) ? 0 : Number(entry);
                        break;
                    case 7: //Last property. We save the product & prepare for the next.
                        aux["color"] = entry;
                        source.push(aux);
                        j = -1;
                        aux = {};
                        break;
                    default: throw "Unrecognized entry out of order: " + entry;
                }
                j++;
            }
            for (const element of source) {
                let p = new model_1.Product();
                yield Utility_1.Utility.transfer_properties(p, element);
                p.owner = sec.user;
                yield Utility_1.Utility.product_repo.save(p);
            }
            res.send('OK');
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.post('/products/search/', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            yield Utility_1.Utility.initialize_category_repo();
            const category = (isNaN(req.body.category)) ? undefined : yield Utility_1.Utility.category_repo.findOne({ relations: ["children"],
                where: { id: Number(req.body.category) }
            });
            const s = yield Utility_1.Utility.search_products(category, req.body.keyword, req.body.orderBy, req.body.direction);
            res.send(s);
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/products/delete/:session_token/:product_id', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            try {
                const sec = yield Utility_1.Security.verify_session(req.params.session_token);
                if (!sec.access) {
                    res.send('You CANNOT use this feature without a valid session. Access denied.');
                    return;
                }
                let p = yield Utility_1.Utility.product_repo.findOne({ id: Number(req.params.product_id) });
                if (!p) {
                    res.send('Error. Product: ' + req.params.product_id + " does NOT exist.");
                    return;
                }
                res.send(yield Utility_1.Utility.product_repo.delete(p));
                return;
            }
            catch (err) {
                console.log(err);
                res.send(err['text']);
                return;
            }
            ;
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.post('/products/update/:session_token/:product_id', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            try {
                const sec = yield Utility_1.Security.verify_session(req.params.session_token);
                if (!sec.access) {
                    res.send('You CANNOT usee this feature without a valid session. Access denied.');
                    return;
                }
                let p = yield Utility_1.Utility.product_repo.findOne({
                    relations: ["owner"],
                    where: { id: Number(req.params.product_id) }
                });
                if (!p) {
                    res.send('Error. Product: ' + req.params.product_id + " does NOT exist.");
                    return;
                }
                const text = `Access denied. Only the owner of a product or an administrator can edit a product.
                User who tried: ${sec.user.id},Owner of the product: ${p.owner.id}. Product: ${req.params.product_id}`;
                if (!(p.owner.id == sec.user.id || sec.admin)) {
                    res.send(text);
                    return;
                }
                yield Utility_1.Utility.transfer_properties(p, req.body);
                p.owner = sec.user;
                yield Utility_1.Utility.product_repo.save(p);
                res.send('OK');
                return;
            }
            catch (err) {
                console.log(err);
                res.send(err);
                return;
            }
            ;
        }
        catch (err) {
            return next(err);
        }
    });
});
///////////////////////////////////////REVIEW IMPLEMENTATION///////////////////////////////////
exports.router.post('/products/review/:session_token/:product_id', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            try {
                const sec = yield Utility_1.Security.verify_session(req.params.session_token);
                if (!sec.access) {
                    res.send('You CANNOT usee this feature without a valid session. Access denied.');
                    return;
                }
                let p = yield Utility_1.Utility.product_repo.findOne({ id: Number(req.params.product_id) });
                if (!p) {
                    res.send('Error. Product: ' + req.params.product_id + " does NOT exist.");
                    return;
                }
                const rep = yield model_1.getReviewRepository();
                let r = new model_1.Review();
                r.product = p;
                r.user = sec.user;
                r.comment = req.body.comment;
                r.rating = Number(req.body.rating);
                yield rep.save(r);
                res.send('OK');
                return;
            }
            catch (err) {
                res.send(err);
                return;
            }
            ;
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/products/delete_review/:session_token/:review_id', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            try {
                const rep = yield model_1.getReviewRepository();
                const sec = yield Utility_1.Security.verify_session(req.params.session_token);
                if (!sec.access) {
                    res.send('You CANNOT usee this feature without a valid session. Access denied.');
                    return;
                }
                let p = yield rep.findOne({ id: Number(req.params.review_id) });
                if (!p) {
                    res.send('Error. Review: ' + req.params.review_id + " does NOT exist.");
                    return;
                }
                yield rep.delete(p.id);
                res.send('OK');
                return;
            }
            catch (err) {
                res.send(err);
                return;
            }
            ;
        }
        catch (err) {
            console.log(err);
            return next(err);
        }
    });
});
exports.router.get('/products/getOwn/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            try {
                const sec = yield Utility_1.Security.verify_session(req.params.session_token);
                if (!sec.access) {
                    res.send('You CANNOT usee this feature without a valid session. Access denied.');
                    return;
                }
                const ps = yield Utility_1.Utility.product_repo.find({
                    relations: ["photo", "category", "colors", "reviews", "owner"],
                    where: { owner: sec.user }
                });
                res.send(ps);
                return;
            }
            catch (err) {
                res.send(err);
                return;
            }
            ;
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/products/details/:product_id', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            try {
                let p = yield Utility_1.Utility.product_repo.findOne({
                    where: { id: Number(req.params.product_id) },
                    relations: ["reviews", "owner", "colors", "reviews.user", "category", "photo"]
                });
                if (!p) {
                    res.send('Error. Product: ' + req.params.product_id + " does NOT exist.");
                    return;
                }
                res.send(p);
                return;
            }
            catch (err) {
                res.send(err);
                return;
            }
            ;
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/products/purchase/:session_token/:product_id/:color/:quantity', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            try {
                const sec = yield Utility_1.Security.verify_session(req.params.session_token);
                if (!sec.access) {
                    res.send('You CANNOT usee this feature without a valid session. Access denied.');
                    return;
                }
                let p = yield Utility_1.Utility.product_repo.findOne({ id: Number(req.params.product_id) });
                if (!p) {
                    res.send('Error. Product: ' + req.params.product_id + " does NOT exist.");
                    return;
                }
                const rep = yield model_1.getCartRepository();
                const sel_rep = yield model_1.getSelectionRepository();
                const cart = yield rep.findOne({
                    where: { user: sec.user, active: true },
                    relations: ["selections"]
                });
                const c = yield Utility_1.Utility.search_color(req.params.color);
                if (!cart) {
                    console.log("FATAL ERROR. There's no active cart for customer ");
                    res.send("FATAL ERROR. There's no active cart for customer ");
                    return;
                }
                const q = Number(req.params.quantity);
                if (q > p.stock) {
                    res.send("ERROR: The owner of this product doesn't have enough stock to supply demand." +
                        "There's only: " + p.stock + " left.");
                    return;
                }
                const sel = new model_1.Selection();
                sel.product = p;
                sel.color = c;
                sel.cart = cart;
                sel.quantity = q;
                yield sel_rep.save(sel);
                cart.selections.push(sel);
                yield rep.save(cart);
                res.send('OK');
                return;
            }
            catch (err) {
                res.send(err);
                return;
            }
            ;
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/cart/purchase/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            const selection_repo = yield model_1.getSelectionRepository();
            const user_rep = yield model_1.getUserRepository();
            try {
                const sec = yield Utility_1.Security.verify_session(req.params.session_token);
                if (!sec.access) {
                    res.send('You CANNOT usee this feature without a valid session. Access denied.');
                    return;
                }
                const rep = yield model_1.getCartRepository();
                const cart = yield rep.findOne({
                    where: { user: sec.user, active: true },
                    relations: ["selections", "selections.product", "selections.product.owner"]
                });
                if (!cart) {
                    console.log("FATAL ERROR. There's no active cart for customer ");
                    res.send("FATAL ERROR. There's no active cart for customer ");
                    return;
                }
                let price = 0;
                for (const sel of cart.selections) {
                    //Verify there's enough stock for product.
                    const p = sel.product;
                    if (p.stock < sel.quantity) {
                        res.send('An error occurred while purchasing.' +
                            'This product: ' + p.name + ' does not have enough stock to supply demand.' +
                            ' Please, adjust quantity for this product and try again.' +
                            'There is only: ' + p.stock + ' left.');
                        return;
                    }
                    price += p.price * sel.quantity;
                    p.stock -= sel.quantity;
                    p.owner.earnings += p.price * sel.quantity;
                    sel.purchased = true;
                    yield user_rep.save(p.owner);
                    yield Utility_1.Utility.product_repo.save(p);
                    yield selection_repo.save(sel);
                }
                if (price > sec.user.credit) {
                    res.send('Failed to complete transaction. You do NOT have enough credit ' +
                        'to complete this order.\n Please, adjust your cart and try again.\n' +
                        'Your current credit is: Q' + sec.user.credit + ' You need: Q' + price + ' to proceed with this purchase.');
                    return;
                }
                sec.user.credit -= price;
                yield user_rep.save(sec.user);
                cart.active = false;
                cart.purchased_at = new Date();
                cart.price = price;
                yield rep.save(cart);
                let new_cart = new model_1.Cart();
                new_cart.user = sec.user;
                new_cart.active = true;
                yield rep.save(new_cart);
                res.send('OK');
                return;
            }
            catch (err) {
                res.send(err);
                return;
            }
            ;
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/cart/remove/:session_token/:selection_id', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            try {
                const sec = yield Utility_1.Security.verify_session(req.params.session_token);
                if (!sec.access) {
                    res.send('You CANNOT usee this feature without a valid session. Access denied.');
                    return;
                }
                const rep = yield model_1.getCartRepository();
                const selection_rep = yield model_1.getSelectionRepository();
                const cart = yield rep.findOne({
                    where: { user: sec.user, active: true },
                    relations: ["selections"]
                });
                if (!cart) {
                    console.log("FATAL ERROR. There's no active cart for customer ");
                    res.send("FATAL ERROR. There's no active cart for customer ");
                    return;
                }
                let valid_relations = [];
                for (let i = 0; i < cart.selections.length; i++) {
                    if (cart.selections[i].id != Number(req.params.selection_id))
                        valid_relations.push(cart.selections[i]);
                }
                cart.selections = valid_relations;
                yield rep.save(cart);
                //Delete old selection:
                const sel = yield selection_rep.findOne({ id: Number(req.params.selection_id) });
                if (sel) {
                    yield selection_rep.delete(sel);
                }
                res.send('OK');
                return;
            }
            catch (err) {
                res.send(err);
                return;
            }
            ;
        }
        catch (err) {
            return next(err);
        }
    });
});
exports.router.get('/cart/details/:session_token', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Utility_1.Utility.initialize_product_repo();
            const user_rep = yield model_1.getUserRepository();
            try {
                const sec = yield Utility_1.Security.verify_session(req.params.session_token);
                if (!sec.access) {
                    res.send('You CANNOT usee this feature without a valid session. Access denied.');
                    return;
                }
                const rep = yield model_1.getCartRepository();
                const cart = yield rep.findOne({
                    where: { user: sec.user, active: true },
                    relations: ["selections", "selections.product", "selections.color", "selections.product.owner", "selections.product.photo"]
                });
                if (!cart) {
                    console.log("FATAL ERROR. There's no active cart for customer ");
                    res.send("FATAL ERROR. There's no active cart for customer ");
                    return;
                }
                cart.price = 0;
                if (cart.selections) {
                    if (Array.isArray(cart.selections)) {
                        for (let i = 0; i < cart.selections.length; i++) {
                            cart.price += cart.selections[i].product.price * cart.selections[i].quantity;
                        }
                    }
                }
                res.send(cart);
                return;
            }
            catch (err) {
                res.send(err);
                return;
            }
            ;
        }
        catch (err) {
            return next(err);
        }
    });
});
