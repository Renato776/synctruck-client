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
const model_1 = require("./model");
const typeorm_1 = require("typeorm");
class Printing {
    static log(text) {
        console.log(text);
    }
}
exports.Printing = Printing;
class Security {
    static getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    static sleep(milliseconds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => setTimeout(resolve, milliseconds));
        });
    }
    static rollback_password(user, og, new_pass) {
        return __awaiter(this, void 0, void 0, function* () {
            /*This function waits asynchronously for 2 minutes and then resets
            * password of User back to og*/
            yield this.sleep(2 * 60 * 1000);
            const repo = yield model_1.getUserRepository();
            const u = yield repo.findOne(user.id);
            if (u == undefined) {
                Printing.log('Failed to roll back password.' +
                    'Undefined user: ' + user.id + ' username: ' + user.correo);
                return;
            }
            if (u.password == new_pass) {
                //Password hasn't changed yet.
                u.password = og;
                yield repo.save(u);
            }
        });
    }
    static success(user, message, comment = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const h = new model_1.History();
            h.user = user;
            h.description = message;
            h.comment = comment;
            const repo = yield model_1.getHistoryRepository();
            yield repo.save(h);
        });
    }
    static verify_session(session_token) {
        return __awaiter(this, void 0, void 0, function* () {
            const session_repository = yield model_1.getSessionRepository();
            const session = yield session_repository.findOne({
                relations: ["user", "user.photo"],
                where: { id: +session_token, active: true }
            });
            if (session == undefined) {
                return { access: false, user: undefined, admin: false };
            }
            //Alright, an active session does exist!
            //Let's return the rol associated with it:
            return { access: true, user: session.user, admin: session.user.rol == 'admin' };
        });
    }
}
exports.Security = Security;
class Utility {
    static update_object(target, origin) {
        target = Object.assign({}, target);
        const o_keys = Object.keys(origin);
        o_keys.forEach(key => {
            target[key] = origin[key];
        });
        return target;
    }
    static transfer_properties(target, origin) {
        return __awaiter(this, void 0, void 0, function* () {
            const o_keys = Object.keys(origin);
            for (const key of o_keys) {
                if (key == 'video') {
                    target['videos'] = [yield this.get_video(origin[key])];
                }
                else if (key == 'photo' && !isNaN(origin[key])) {
                    target['photo'] = yield this.get_photo(origin[key]);
                }
                else if (key == 'photoId') {
                    target['photo'] = yield this.get_photo(origin[key]);
                }
                else if (key == 'color' || key == 'colors') {
                    if (typeof origin[key] != "string" && !Array.isArray(origin[key]))
                        continue;
                    let colors;
                    if (!Array.isArray(origin[key])) {
                        if (origin[key].includes(','))
                            origin[key] = origin[key].replace(',', '-');
                        colors = origin[key].split('-');
                    }
                    else
                        colors = origin[key];
                    console.log(colors);
                    for (let i = 0; i < colors.length; i++) {
                        colors[i] = colors[i].trim();
                    }
                    for (let i = 0; i < colors.length; i++) {
                        const color = yield this.search_color(colors[i]);
                        if (!target['colors'])
                            target['colors'] = [];
                        target['colors'].push(color);
                    }
                }
                else if (key == 'category') {
                    if (typeof origin[key] != "string")
                        continue;
                    if (!this.category_repo)
                        this.category_repo = yield model_1.getCategoryRepository();
                    if (origin[key].includes(','))
                        origin[key] = origin[key].replace(',', '-');
                    let categories = origin[key].split('-'); //Category path.
                    for (let i = 0; i < categories.length; i++) {
                        categories[i] = categories[i].trim();
                    }
                    let parent = null;
                    for (let i = 0; i < categories.length; i++) {
                        parent = yield this.search_category(categories[i], parent);
                    }
                    target['category'] = parent;
                }
                else if (key == 'published')
                    continue; //WE DO NOT Transfer published property from origin to target EVER.
                else
                    target[key] = origin[key];
            }
        });
    }
    static initialize_product_repo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.product_repo)
                this.product_repo = yield model_1.getProductRepository();
        });
    }
    static miniTraversal(list, tree) {
        list.push(tree.id);
        if (Array.isArray(tree.children)) {
            if (tree.children != undefined) {
                for (let i = 0; i < tree.children.length; i++) {
                    this.miniTraversal(list, tree.children[i]);
                }
            }
        }
    }
    static search_products(category, keyword, orderColumn, direction, include_category = false) {
        return __awaiter(this, void 0, void 0, function* () {
            //This method searches all products that meet the search criteria. If all are null, returns all products.
            yield this.initialize_product_repo();
            const alias = 'product';
            const d = (direction == "ASC") ? "ASC" : "DESC";
            if (!orderColumn)
                orderColumn = 'name';
            orderColumn = alias + '.' + orderColumn;
            const orderClause = {};
            orderClause[orderColumn] = d;
            let whereClause = (keyword) ? alias + ".name LIKE '" + keyword + "%'" : alias + ".name IS NOT NULL";
            if (category) {
                let categories = [];
                this.miniTraversal(categories, category);
                whereClause += " AND (";
                for (const category1 of categories) {
                    whereClause += alias + ".category = " + category1 + " OR ";
                }
                whereClause = whereClause.substring(0, whereClause.length - 4) + ')';
            }
            const q = (include_category) ? this.product_repo.createQueryBuilder(alias).
                leftJoinAndSelect(alias + ".photo", "photo")
                .leftJoinAndSelect(alias + ".category", "category")
                .where(whereClause).orderBy(orderClause)
                : this.product_repo.createQueryBuilder(alias).
                    leftJoinAndSelect(alias + ".photo", "photo")
                    .leftJoinAndSelect(alias + ".colors", "colors")
                    .where(whereClause).orderBy(orderClause);
            const result = yield q.getMany();
            return result;
        });
    }
    static get_all_categories() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.category_repo)
                this.category_repo = yield model_1.getCategoryRepository();
            return yield this.category_repo.find({
                relations: ["children"],
                where: {
                    parent: null
                },
                order: {
                    name: "ASC"
                }
            });
        });
    }
    static get_photo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const photo_repo = yield model_1.getPhotoRepository();
            let photo = undefined;
            if (!isNaN(id))
                photo = yield photo_repo.findOne({ id: id });
            if (photo == undefined) {
                photo = yield photo_repo.findOne({ id: 1 });
            }
            return photo;
        });
    }
    static get_video(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const video_repo = yield model_1.getVideoRepository();
            let vid = yield video_repo.findOne({ id: id });
            if (vid == undefined) {
                vid = yield video_repo.findOne({ id: 1 });
            }
            return vid;
        });
    }
    static search_color(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = yield model_1.getColorRepository();
            let c = yield repo.findOne({ name: name });
            if (c == undefined) {
                c = new model_1.Color();
                c.name = name;
                yield repo.save(c);
            }
            return c;
        });
    }
    static initialize_category_repo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.category_repo)
                this.category_repo = yield model_1.getCategoryRepository();
        });
    }
    static search_category(string, parent) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.category_repo)
                this.category_repo = yield model_1.getCategoryRepository();
            let r = yield this.category_repo.findOne({
                where: {
                    parent: (parent) ? parent.id : null,
                    name: string
                }
            });
            if (!r) {
                r = new model_1.Category();
                r.parent = parent;
                r.name = string;
                yield this.category_repo.save(r);
            }
            return r;
        });
    }
    static get_report(name, x, y) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize_product_repo();
            yield this.initialize_category_repo();
            const user_repo = yield model_1.getUserRepository();
            const chat_repo = yield model_1.getChatRepository();
            const review_repo = yield model_1.getReviewRepository();
            const selection_repo = yield model_1.getSelectionRepository();
            let alias;
            switch (name) {
                case "general_help":
                    {
                        alias = 'AliasChat';
                        let q = chat_repo.createQueryBuilder(alias).select(alias + ".agent", "agent_id")
                            .addSelect("AVG(" + alias + ".rating)", "rating").where("\"active\" != 1").groupBy(alias + ".agent")
                            .orderBy("\"rating\"", "DESC");
                        const results = yield q.getRawMany();
                        for (let i = 0; i < results.length; i++) {
                            const result = results[i];
                            let agent = yield user_repo.findOne({
                                select: ["id", "name", "correo", "apellidos"],
                                where: { id: result["agent_id"] }
                            });
                            results[i]["agent_data"] = agent;
                        }
                        return results;
                    }
                    break; //X = N/A  .1)
                case "male_help":
                    { /*
                    El listado de todos los Servicio de ayuda de sexo masculino que hayan nacido
        arriba de ​ X ​ año.
        .leftJoinAndSelect("user.photos", "photo")
            .where("user.name = :name", { name: "Timber" })
            .andWhere("photo.isRemoved = :isRemoved", { isRemoved: false })
            .getOne();
                    */
                        x = "DATE '" + (Number(x) + 1) + "-01-01'";
                        alias = 'AliasAgent';
                        let q = user_repo.createQueryBuilder(alias).select(alias + ".name")
                            .addSelect(alias + ".apellidos")
                            .addSelect(alias + ".correo")
                            .where(alias + ".rol = 'agent' AND " + alias + ".genero = 'MASCULINO' AND " + alias + ".fechaNac >= " + x)
                            .orderBy("\"name\"", "DESC");
                        const results = yield q.getRawMany();
                        return results;
                    }
                    break; //X = anio de nacimiento maximo .2)
                case "female_admins":
                    {
                        /*
                        * El listado de todos los administradores de sexo femenino que hayan nacido
        debajo de ​ Y ​ año.
                        * */
                        x = "DATE '" + (Number(x) - 1) + "-12-29'";
                        alias = 'admin';
                        let q = user_repo.createQueryBuilder(alias).select(alias + ".name")
                            .addSelect(alias + ".apellidos")
                            .addSelect(alias + ".correo")
                            .where(alias + ".rol = 'admin' AND " + alias + ".genero != 'MASCULINO' AND " + alias + ".fechaNac <= " + x)
                            .orderBy("\"name\"", "DESC");
                        return yield q.getRawMany();
                    }
                    break; //X = anio de nacimiento del admin .3)
                case "most_earnings":
                    {
                        /*
                        *Los clientes que más ganancias han generado ordenandos de mayor a
        menor.
                        * */
                        alias = 'usuarios';
                        let q = user_repo.createQueryBuilder(alias).select(alias + ".name")
                            .addSelect(alias + ".apellidos")
                            .addSelect(alias + ".correo")
                            .addSelect(alias + ".earnings")
                            .where(alias + ".rol = 'customer'")
                            .orderBy("\"earnings\"", "DESC");
                        return yield q.getRawMany();
                    }
                    break; //X=N/A .4)
                case "best_products":
                    { /*
                    Todos los productos con el promedio de su puntuación para 5,4,3,2,1,0
        estrellas.
                    */
                        alias = 'review';
                        let q = review_repo.createQueryBuilder(alias).select(alias + ".product", "product_id")
                            .addSelect("AVG(" + alias + ".rating)", "rating").groupBy(alias + ".product")
                            .orderBy("\"rating\"", "DESC");
                        const results = yield q.getRawMany();
                        for (let i = 0; i < results.length; i++) {
                            const result = results[i];
                            let product = yield Utility.product_repo.findOne({
                                relations: ["category"],
                                select: ["id", "name", "price", "stock", "published"],
                                where: { id: result["product_id"] }
                            });
                            results[i]["product_data"] = product;
                        }
                        return results;
                    }
                    break; //X=N/A .5)
                case "best_sellers":
                    { /*
                    Top 3 de productos más
        vendidos.
                    */
                        alias = 'cool';
                        let q = selection_repo.createQueryBuilder(alias).select(alias + ".product", "product_id")
                            .addSelect("SUM(" + alias + ".quantity)", "purchased_count")
                            .where("\"purchased\" = 1").groupBy(alias + ".product")
                            .orderBy("\"purchased_count\"", "DESC").take(3);
                        const results = yield q.getRawMany();
                        for (let i = 0; i < results.length; i++) {
                            const result = results[i];
                            let product = yield Utility.product_repo.findOne({
                                relations: ["category"],
                                select: ["id", "name", "price", "stock", "published"],
                                where: { id: result["product_id"] }
                            });
                            results[i]["product_data"] = product;
                        }
                        return results;
                    }
                    break; //X= N/A .6)
                case "most_enthusiastic":
                    { /*
                    Top 3 de clientes que más productos tenga en su
        catálogo.
                    */
                        alias = 'enthusiast';
                        let q = this.product_repo.createQueryBuilder(alias).select(alias + ".owner", "owner")
                            .addSelect("COUNT(" + alias + ".owner)", "product_count").groupBy(alias + ".owner")
                            .orderBy("\"product_count\"", "DESC");
                        const results = yield q.getRawMany();
                        for (let i = 0; i < results.length; i++) {
                            const result = results[i];
                            let seller = yield user_repo.findOne({
                                select: ["id", "name", "correo", "apellidos"],
                                where: { id: result["owner"] }
                            });
                            results[i]["seller_data"] = seller;
                        }
                        return results;
                    }
                    break; //X = N/A .7)
                case "all_products":
                    { /*
                    Listado de todos los productos indicando en que categoría se encontraban, si en
        dado caso tiene categorías hijas debe mostrarlas.
                    */
                        const all_products = yield this.search_products(undefined, undefined, 'name', 'DESC', true);
                        return all_products;
                    }
                    break; //X = N/A .8)
                case "commented_products":
                    { /*
                    Todos los productos indicando la cantidad de comentarios asignados,
        publicados en Y fecha.
        select "id" from C##renato."review" where UPPER("published") LIKE '09-MAY-20';
                */
                        x = "'" + x + "'";
                        alias = 'review';
                        let q = review_repo.createQueryBuilder(alias).select(alias + ".product", "product_id")
                            .addSelect("COUNT(" + alias + ".rating)", "comment_count")
                            .where("UPPER(\"published\") LIKE " + x).groupBy(alias + ".product")
                            .orderBy("\"comment_count\"", "DESC");
                        const results = yield q.getRawMany();
                        for (let i = 0; i < results.length; i++) {
                            const result = results[i];
                            let product = yield Utility.product_repo.findOne({
                                relations: ["category"],
                                select: ["id", "name", "price", "stock", "published"],
                                where: { id: result["product_id"] }
                            });
                            results[i]["product_data"] = product;
                        }
                        return results;
                    }
                    break; //X LIKE '09-MAY-20' .9)
                case "stock_products":
                    { /*
                    Todos los productos que tengan ​ X ​ cantidad
        disponible.
                    */
                        const results = yield this.product_repo.find({
                            relations: ["category"],
                            where: {
                                stock: typeorm_1.MoreThan((Number(x) - 1))
                            },
                            order: { "stock": "DESC" }
                        });
                        return results;
                    }
                    break; //X = cantidad de productos que en existencia. .10)
                case "worst_products":
                    { /*
                    Top 3 de productos con peor
        puntuación
                    */
                        alias = 'review';
                        let q = review_repo.createQueryBuilder(alias).select(alias + ".product", "product_id")
                            .addSelect("AVG(" + alias + ".rating)", "rating").groupBy(alias + ".product")
                            .orderBy("\"rating\"", "ASC");
                        const results = yield q.getRawMany();
                        for (let i = 0; i < results.length; i++) {
                            const result = results[i];
                            let product = yield Utility.product_repo.findOne({
                                relations: ["category"],
                                select: ["id", "name", "price", "stock", "published"],
                                where: { id: result["product_id"] }
                            });
                            results[i]["product_data"] = product;
                        }
                        return results;
                    }
                    break; //X = N/A .11)
            }
        });
    }
}
Utility.product_repo = undefined;
Utility.category_repo = undefined;
exports.Utility = Utility;
