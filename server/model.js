"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var Category_1;
const typeorm_1 = require("typeorm");
exports.BASE_URL = 'http://localhost:4201';
exports.TIERS = { DIAMANTE: 50000, ORO: 10000, PLATINO: 25000, PLATA: 5000, BRONCE: 1000 };
let Photo = class Photo {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Photo.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Photo.prototype, "url", void 0);
__decorate([
    typeorm_1.OneToMany(type => User, user => user.photo),
    __metadata("design:type", Array)
], Photo.prototype, "users", void 0);
__decorate([
    typeorm_1.OneToMany(type => Enterprise, enterprise => enterprise.photo),
    __metadata("design:type", Array)
], Photo.prototype, "enterprises", void 0);
__decorate([
    typeorm_1.OneToMany(type => Product, product => product.photo),
    __metadata("design:type", Array)
], Photo.prototype, "products", void 0);
Photo = __decorate([
    typeorm_1.Entity()
], Photo);
exports.Photo = Photo;
let Enterprise = class Enterprise {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Enterprise.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Enterprise.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({ type: 'varchar2', nullable: true, length: 1000 }),
    __metadata("design:type", String)
], Enterprise.prototype, "slogan", void 0);
__decorate([
    typeorm_1.Column({ type: 'varchar2', nullable: true, length: 2500 }),
    __metadata("design:type", String)
], Enterprise.prototype, "mission", void 0);
__decorate([
    typeorm_1.Column({ type: 'varchar2', nullable: true, length: 2500 }),
    __metadata("design:type", String)
], Enterprise.prototype, "vision", void 0);
__decorate([
    typeorm_1.Column({ type: 'varchar2', nullable: true, length: 2500 }),
    __metadata("design:type", String)
], Enterprise.prototype, "aboutUs", void 0);
__decorate([
    typeorm_1.OneToMany(type => Video, video => video.enterprise),
    __metadata("design:type", Array)
], Enterprise.prototype, "videos", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Photo, photo => photo.enterprises),
    __metadata("design:type", Array)
], Enterprise.prototype, "photo", void 0);
Enterprise = __decorate([
    typeorm_1.Entity()
], Enterprise);
exports.Enterprise = Enterprise;
let User = class User {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "apellidos", void 0);
__decorate([
    typeorm_1.Column({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "fechaNac", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "correo", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "telefono", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "genero", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], User.prototype, "credit", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], User.prototype, "earnings", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "tier", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "rol", void 0);
__decorate([
    typeorm_1.Column({ type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], User.prototype, "registered_at", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Photo, photo => photo.users),
    __metadata("design:type", Photo)
], User.prototype, "photo", void 0);
__decorate([
    typeorm_1.OneToMany(type => History, history => history.user),
    __metadata("design:type", Array)
], User.prototype, "history", void 0);
__decorate([
    typeorm_1.OneToMany(type => Session, session => session.user),
    __metadata("design:type", Array)
], User.prototype, "sessions", void 0);
__decorate([
    typeorm_1.OneToMany(type => Chat, chat => chat.customer),
    __metadata("design:type", Array)
], User.prototype, "customer_chats", void 0);
__decorate([
    typeorm_1.OneToMany(type => Product, product => product.owner),
    __metadata("design:type", Array)
], User.prototype, "products", void 0);
__decorate([
    typeorm_1.OneToMany(type => Chat, chat => chat.agent),
    __metadata("design:type", Array)
], User.prototype, "agent_chats", void 0);
__decorate([
    typeorm_1.OneToMany(type => Message, message => message.sender),
    __metadata("design:type", Array)
], User.prototype, "messages", void 0);
__decorate([
    typeorm_1.OneToMany(type => Message, message => message.receiver),
    __metadata("design:type", Array)
], User.prototype, "inbox", void 0);
__decorate([
    typeorm_1.OneToMany(type => Cart, cart => cart.user),
    __metadata("design:type", Array)
], User.prototype, "carts", void 0);
__decorate([
    typeorm_1.OneToMany(type => Review, review => review.user),
    __metadata("design:type", Array)
], User.prototype, "reviews", void 0);
User = __decorate([
    typeorm_1.Entity()
], User);
exports.User = User;
let Video = class Video {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Video.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Video.prototype, "url", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Enterprise, enterprise => enterprise.videos),
    __metadata("design:type", Enterprise)
], Video.prototype, "enterprise", void 0);
Video = __decorate([
    typeorm_1.Entity()
], Video);
exports.Video = Video;
let Category = Category_1 = class Category {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Category.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Category.prototype, "name", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Category_1, category => category.children),
    __metadata("design:type", Category)
], Category.prototype, "parent", void 0);
__decorate([
    typeorm_1.OneToMany(type => Category_1, category => category.parent),
    __metadata("design:type", Array)
], Category.prototype, "children", void 0);
__decorate([
    typeorm_1.OneToMany(type => Product, product => product.category),
    __metadata("design:type", Array)
], Category.prototype, "products", void 0);
Category = Category_1 = __decorate([
    typeorm_1.Entity()
], Category);
exports.Category = Category;
let Product = class Product {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    typeorm_1.Column('long'),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Product.prototype, "stock", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "codigo", void 0);
__decorate([
    typeorm_1.Column({ type: 'date', default: () => 'CURRENT_DATE', nullable: true }),
    __metadata("design:type", Date)
], Product.prototype, "published", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Category, category => category.products),
    __metadata("design:type", Category)
], Product.prototype, "category", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User, user => user.products),
    __metadata("design:type", User)
], Product.prototype, "owner", void 0);
__decorate([
    typeorm_1.OneToMany(type => Selection, selection => selection.product),
    __metadata("design:type", Array)
], Product.prototype, "selections", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Photo, photo => photo.products),
    __metadata("design:type", Photo)
], Product.prototype, "photo", void 0);
__decorate([
    typeorm_1.OneToMany(type => Review, review => review.product),
    __metadata("design:type", Array)
], Product.prototype, "reviews", void 0);
__decorate([
    typeorm_1.ManyToMany(type => Color, color => color.products, {
        cascade: true
    }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], Product.prototype, "colors", void 0);
Product = __decorate([
    typeorm_1.Entity()
], Product);
exports.Product = Product;
let History = class History {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], History.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], History.prototype, "time", void 0);
__decorate([
    typeorm_1.Column('long'),
    __metadata("design:type", String)
], History.prototype, "description", void 0);
__decorate([
    typeorm_1.Column({ type: 'varchar2', length: 2000, nullable: true }),
    __metadata("design:type", String)
], History.prototype, "comment", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User, user => user.history),
    __metadata("design:type", User)
], History.prototype, "user", void 0);
History = __decorate([
    typeorm_1.Entity()
], History);
exports.History = History;
let Session = class Session {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Session.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], Session.prototype, "logged_at", void 0);
__decorate([
    typeorm_1.Column({ default: true }),
    __metadata("design:type", Boolean)
], Session.prototype, "active", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User, user => user.sessions),
    __metadata("design:type", User)
], Session.prototype, "user", void 0);
Session = __decorate([
    typeorm_1.Entity()
], Session);
exports.Session = Session;
let Color = class Color {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Color.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], Color.prototype, "name", void 0);
__decorate([
    typeorm_1.ManyToMany(type => Product, product => product.colors),
    __metadata("design:type", Array)
], Color.prototype, "products", void 0);
__decorate([
    typeorm_1.OneToMany(type => Selection, selection => selection.color),
    __metadata("design:type", Array)
], Color.prototype, "selections", void 0);
Color = __decorate([
    typeorm_1.Entity()
], Color);
exports.Color = Color;
let Review = class Review {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Review.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], Review.prototype, "published", void 0);
__decorate([
    typeorm_1.Column({ type: 'long', nullable: true }),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Product, product => product.reviews),
    __metadata("design:type", Product)
], Review.prototype, "product", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User, user => user.reviews),
    __metadata("design:type", User)
], Review.prototype, "user", void 0);
Review = __decorate([
    typeorm_1.Entity()
], Review);
exports.Review = Review;
let Chat = class Chat {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Chat.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], Chat.prototype, "started_at", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Chat.prototype, "rating", void 0);
__decorate([
    typeorm_1.Column({ nullable: true, type: 'date' }),
    __metadata("design:type", Date)
], Chat.prototype, "ended_at", void 0);
__decorate([
    typeorm_1.Column({ default: true }),
    __metadata("design:type", Boolean)
], Chat.prototype, "active", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User, user => user.customer_chats),
    __metadata("design:type", User)
], Chat.prototype, "customer", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User, user => user.agent_chats),
    __metadata("design:type", User)
], Chat.prototype, "agent", void 0);
__decorate([
    typeorm_1.OneToMany(type => Message, message => message.chat),
    __metadata("design:type", Array)
], Chat.prototype, "messages", void 0);
Chat = __decorate([
    typeorm_1.Entity()
], Chat);
exports.Chat = Chat;
let Cart = class Cart {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Cart.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ default: true }),
    __metadata("design:type", Boolean)
], Cart.prototype, "active", void 0);
__decorate([
    typeorm_1.Column({ type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], Cart.prototype, "began_at", void 0);
__decorate([
    typeorm_1.Column({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Cart.prototype, "purchased_at", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Cart.prototype, "price", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User, user => user.carts),
    __metadata("design:type", User)
], Cart.prototype, "user", void 0);
__decorate([
    typeorm_1.OneToMany(type => Selection, selection => selection.cart),
    __metadata("design:type", Array)
], Cart.prototype, "selections", void 0);
Cart = __decorate([
    typeorm_1.Entity()
], Cart);
exports.Cart = Cart;
let Selection = class Selection {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Selection.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Selection.prototype, "quantity", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], Selection.prototype, "purchased", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Product, product => product.selections),
    __metadata("design:type", Product)
], Selection.prototype, "product", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Color, color => color.selections),
    __metadata("design:type", Color)
], Selection.prototype, "color", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Cart, cart => cart.selections),
    __metadata("design:type", Cart)
], Selection.prototype, "cart", void 0);
Selection = __decorate([
    typeorm_1.Entity()
], Selection);
exports.Selection = Selection;
let Message = class Message {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Message.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    typeorm_1.Column({ type: 'date', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], Message.prototype, "sent_at", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User, user => user.messages),
    __metadata("design:type", User)
], Message.prototype, "sender", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User, user => user.inbox),
    __metadata("design:type", User)
], Message.prototype, "receiver", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Chat, chat => chat.messages),
    __metadata("design:type", Chat)
], Message.prototype, "chat", void 0);
Message = __decorate([
    typeorm_1.Entity()
], Message);
exports.Message = Message;
let connection;
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        connection = yield typeorm_1.createConnection({
            type: 'oracle',
            database: 'XE',
            name: 'oracle',
            host: 'localhost',
            port: 1521,
            username: 'C##renato',
            password: 'renato',
            sid: 'XE',
            logging: "all",
            logger: "file",
            synchronize: true,
            entities: [
                Product, Photo, Enterprise, Video, History, User, Session,
                Review, Chat, Cart, Selection, Message, Category, Color
            ]
        });
    });
}
function getConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection;
    });
}
exports.getConnection = getConnection;
function getProductRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(Product);
    });
}
exports.getProductRepository = getProductRepository;
function getSessionRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(Session);
    });
}
exports.getSessionRepository = getSessionRepository;
function getEnterpriseRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(Enterprise);
    });
}
exports.getEnterpriseRepository = getEnterpriseRepository;
function getVideoRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(Video);
    });
}
exports.getVideoRepository = getVideoRepository;
function getPhotoRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(Photo);
    });
}
exports.getPhotoRepository = getPhotoRepository;
function getHistoryRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(History);
    });
}
exports.getHistoryRepository = getHistoryRepository;
function getUserRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(User);
    });
}
exports.getUserRepository = getUserRepository;
function getReviewRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(Review);
    });
}
exports.getReviewRepository = getReviewRepository;
function getChatRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(Chat);
    });
}
exports.getChatRepository = getChatRepository;
function getCartRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(Cart);
    });
}
exports.getCartRepository = getCartRepository;
function getSelectionRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(Selection);
    });
}
exports.getSelectionRepository = getSelectionRepository;
function getMessageRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(Message);
    });
}
exports.getMessageRepository = getMessageRepository;
function getCategoryRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(Category);
    });
}
exports.getCategoryRepository = getCategoryRepository;
function getColorRepository() {
    return __awaiter(this, void 0, void 0, function* () {
        if (connection === undefined)
            yield connect();
        return connection.getRepository(Color);
    });
}
exports.getColorRepository = getColorRepository;
