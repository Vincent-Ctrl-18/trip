import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', '..', 'database.sqlite'),
  logging: false,
});

// ========== User Model ==========
interface UserAttributes {
  id: number;
  username: string;
  password_hash: string;
  role: 'merchant' | 'admin';
  created_at?: Date;
}
interface UserCreation extends Optional<UserAttributes, 'id' | 'created_at'> {}

class User extends Model<UserAttributes, UserCreation> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password_hash!: string;
  public role!: 'merchant' | 'admin';
  public created_at!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'merchant' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'users', timestamps: false }
);

// ========== Hotel Model ==========
interface HotelAttributes {
  id: number;
  name_cn: string;
  name_en: string;
  city: string;
  address: string;
  star: number;
  opening_date: string;
  description: string;
  tags: string;       // JSON array string
  facilities: string; // JSON array string
  images: string;     // JSON array string
  merchant_id: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'offline';
  reject_reason: string;
  created_at?: Date;
  updated_at?: Date;
}
interface HotelCreation extends Optional<HotelAttributes, 'id' | 'created_at' | 'updated_at' | 'reject_reason' | 'description' | 'tags' | 'facilities' | 'images'> {}

class Hotel extends Model<HotelAttributes, HotelCreation> implements HotelAttributes {
  public id!: number;
  public name_cn!: string;
  public name_en!: string;
  public city!: string;
  public address!: string;
  public star!: number;
  public opening_date!: string;
  public description!: string;
  public tags!: string;
  public facilities!: string;
  public images!: string;
  public merchant_id!: number;
  public status!: 'draft' | 'pending' | 'approved' | 'rejected' | 'offline';
  public reject_reason!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public RoomTypes?: RoomType[];
  public NearbyPlaces?: NearbyPlace[];
}

Hotel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name_cn: { type: DataTypes.STRING, allowNull: false },
    name_en: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    city: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    star: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
    opening_date: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    tags: { type: DataTypes.TEXT, defaultValue: '[]' },
    facilities: { type: DataTypes.TEXT, defaultValue: '[]' },
    images: { type: DataTypes.TEXT, defaultValue: '[]' },
    merchant_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'draft' },
    reject_reason: { type: DataTypes.TEXT, defaultValue: '' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'hotels', timestamps: false }
);

// ========== RoomType Model ==========
interface RoomTypeAttributes {
  id: number;
  hotel_id: number;
  name: string;
  price: number;
  original_price: number | null;
  capacity: number;
  breakfast: boolean;
  images: string;
}
interface RoomTypeCreation extends Optional<RoomTypeAttributes, 'id' | 'original_price' | 'images'> {}

class RoomType extends Model<RoomTypeAttributes, RoomTypeCreation> implements RoomTypeAttributes {
  public id!: number;
  public hotel_id!: number;
  public name!: string;
  public price!: number;
  public original_price!: number | null;
  public capacity!: number;
  public breakfast!: boolean;
  public images!: string;
}

RoomType.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hotel_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    original_price: { type: DataTypes.FLOAT, allowNull: true },
    capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
    breakfast: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    images: { type: DataTypes.TEXT, defaultValue: '[]' },
  },
  { sequelize, tableName: 'room_types', timestamps: false }
);

// ========== NearbyPlace Model ==========
interface NearbyPlaceAttributes {
  id: number;
  hotel_id: number;
  type: 'attraction' | 'transport' | 'mall';
  name: string;
  distance: string;
}
interface NearbyPlaceCreation extends Optional<NearbyPlaceAttributes, 'id'> {}

class NearbyPlace extends Model<NearbyPlaceAttributes, NearbyPlaceCreation> implements NearbyPlaceAttributes {
  public id!: number;
  public hotel_id!: number;
  public type!: 'attraction' | 'transport' | 'mall';
  public name!: string;
  public distance!: string;
}

NearbyPlace.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hotel_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    distance: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, tableName: 'nearby_places', timestamps: false }
);

// ========== Associations ==========
User.hasMany(Hotel, { foreignKey: 'merchant_id' });
Hotel.belongsTo(User, { foreignKey: 'merchant_id', as: 'merchant' });

Hotel.hasMany(RoomType, { foreignKey: 'hotel_id', as: 'RoomTypes' });
RoomType.belongsTo(Hotel, { foreignKey: 'hotel_id' });

Hotel.hasMany(NearbyPlace, { foreignKey: 'hotel_id', as: 'NearbyPlaces' });
NearbyPlace.belongsTo(Hotel, { foreignKey: 'hotel_id' });

export { sequelize, User, Hotel, RoomType, NearbyPlace };
