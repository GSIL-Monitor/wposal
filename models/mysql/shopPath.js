// 机器的轨道，可能需要初始化功能处理

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const ShopPath = db.defineModel('shopPaths', {
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    },
    goodCount: {
        // 机器管理员修改
        type: db.INTEGER,
        defaultValue: 0,
        comment: "商品数量"
    },
    goodId: {
        // 可以为空，就是不添加商品
        // 机器管理员修改
        type: db.INTEGER,
        defaultValue: 0
    },
    goodName: {
        // 商品名称
        type: db.STRING(50),
        defaultValue: ''
    },
    shopId: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = ShopPath;

//读取用户信息
ShopPath.getFilter = function (filter) {
    filter.isDeleted = false;
    return ShopPath.findOne({
        'where': filter
    });
};

ShopPath.getFilters = function (filter) {
    filter.isDeleted = false;
    return ShopPath.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

ShopPath.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ShopPath.findAndCountAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};