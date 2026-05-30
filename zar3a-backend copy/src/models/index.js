import sequelize from '../config/database.js';
import User from './User.js';
import FarmerProfile from './FarmerProfile.js';
import AgroExpertProfile from './AgroExpertProfile.js';
import SupplierProfile from './SupplierProfile.js';
import BuyerProfile from './buyerprofile.js';
import RefreshToken from './RefreshToken.js';
import VerificationToken from './VerificationToken.js';
import PasswordResetOTP from './PasswordResetOTP.js';
import Product from './Product.js';
import ExpertListing from './ExpertListing.js';
import Notification from './Notification.js';
import ChatMessage from './ChatMessage.js';
import OrderTracking from './OrderTracking.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Cart from './Cart.js';
import ProductReview from './ProductReview.js';
import Transaction from './Transaction.js';

// Associations
User.hasOne(FarmerProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
FarmerProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(AgroExpertProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
AgroExpertProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(SupplierProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
SupplierProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(BuyerProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
BuyerProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(VerificationToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
VerificationToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PasswordResetOTP, { foreignKey: 'userId', onDelete: 'CASCADE' });
PasswordResetOTP.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Product, { foreignKey: 'userId', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ProductReview, { foreignKey: 'userId', onDelete: 'CASCADE' });
ProductReview.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(ProductReview, { foreignKey: 'productId', onDelete: 'CASCADE' });
ProductReview.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(ExpertListing, { foreignKey: 'userId', onDelete: 'CASCADE' });
ExpertListing.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Owner (Farmer/Supplier) has many OrderItems
User.hasMany(OrderItem, { as: 'soldItems', foreignKey: 'ownerId', onDelete: 'CASCADE' });
OrderItem.belongsTo(User, { as: 'seller', foreignKey: 'ownerId' });

Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(Notification, { foreignKey: 'productId', onDelete: 'CASCADE' });
Notification.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(ChatMessage, { as: 'sentMessages', foreignKey: 'senderId', onDelete: 'CASCADE' });
User.hasMany(ChatMessage, { as: 'receivedMessages', foreignKey: 'receiverId', onDelete: 'CASCADE' });
ChatMessage.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
ChatMessage.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

Product.hasMany(OrderTracking, { foreignKey: 'productId', onDelete: 'CASCADE' });
OrderTracking.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(OrderTracking, { foreignKey: 'userId', onDelete: 'CASCADE' });
OrderTracking.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(Transaction, { foreignKey: 'orderId', onDelete: 'CASCADE' });
Transaction.belongsTo(Order, { foreignKey: 'orderId' });

export { sequelize, User, FarmerProfile, AgroExpertProfile, SupplierProfile, BuyerProfile, RefreshToken, VerificationToken, PasswordResetOTP, Product, ExpertListing, Notification, ChatMessage, OrderTracking, Order, OrderItem, Cart, ProductReview, Transaction };