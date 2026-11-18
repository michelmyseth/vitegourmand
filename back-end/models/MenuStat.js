// Order statistics per menu (NoSQL), see docs/data-model.md.
// One document per menu, updated on each order; read by the admin dashboard
// (orders chart and revenue) without loading PostgreSQL.
const { mongoose } = require('../config/mongo');

const dayStatSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // 'YYYY-MM-DD', day the order was placed
    orders: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }, // euros
  },
  { _id: false },
);

const menuStatSchema = new mongoose.Schema(
  {
    menuId: { type: Number, required: true, unique: true },
    menuTitle: { type: String, required: true },
    ordersCount: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    byDay: { type: [dayStatSchema], default: [] },
  },
  { collection: 'menu_stats', versionKey: false, timestamps: { createdAt: false, updatedAt: 'updatedAt' } },
);

module.exports = mongoose.model('MenuStat', menuStatSchema);
