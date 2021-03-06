var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Shop = model.shop,
    ShopGood = model.shopGood,
    ShopPath = model.shopPath,
    PathModifyLog = model.pathModifyLog,
    GoodType = model.goodType,
    Order = model.order,
    OrderSeq = model.orderSeq,
    OrderDetail = model.orderDetail,
    Good = model.good,
    GoodAttribute = model.goodAttribute,
    GoodAttrVal = model.goodAttrVal,
    ShopGoodAttrVal = model.shopGoodAttrVal,
    User = model.user,
    Ws_user = model.ws_user,
    WechatHelper = require('../../util/wechatHelper'),
    crypto = require('crypto'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/Client/focus', auth.checkLogin(auth));
    app.get('/Client/focus', function (req, res) {
        res.render('Client/focus.html', {
            title: '关注中心',
            user: req.session.user // 机器信息
        });
    });

    app.get('/Client/buy', auth.checkLogin(auth));
    app.get('/Client/buy', function (req, res) {
        var orderId = req.query.orderId;
        res.render('Client/buy.html', {
            title: '出货中心',
            orderId: orderId,
            user: req.session.user // 机器信息
        });
    });

    app.get('/Client/manage', auth.checkLogin(auth));
    app.get('/Client/manage', auth.checkManager);
    app.get('/Client/manage', function (req, res) {
        res.render('Client/manage.html', {
            title: '管理中心',
            user: req.session.manager
        });
    });

    app.get('/Client/manage/login', auth.checkLogin(auth));
    app.get('/Client/manage/login', function (req, res) {
        res.render('Client/manageLogin.html', {
            title: '管理中心',
            user: req.session.user
        });
    });

    app.post('/Client/manage/login', auth.checkLogin(auth));
    app.post('/Client/manage/login', function (req, res) {
        // 日志
        User.getFilter({
                name: req.body.name
            })
            .then(user => {
                var md5 = crypto.createHash('md5'),
                    password = md5.update(req.body.password).digest('hex');
                if (user.password == password) {
                    req.session.manager = user;
                    return res.redirect('/Client/manage');
                } else {
                    return res.redirect('/Client/manage/login?err=1')
                }
            });
    });

    app.get('/Client/manage/logout', auth.checkLogin(auth));
    app.get('/Client/manage/logout', function (req, res) {
        req.session.manager = null;
        return res.redirect('/Client');
    });

    app.post('/Client/manage/paths', auth.checkLogin(auth, true));
    app.post('/Client/manage/paths', auth.checkManager);
    app.post('/Client/manage/paths', function (req, res) {
        var shopId = req.cookies['shopId'];
        var strSql = "select P.sequence, P.goodId, P.goodName, P.goodCount, A.img, P._id from shopPaths P left join goods A on A._id=P.goodId and A.isDeleted=0 where P.isDeleted=0 and P.shopId=:shopId order by P._id";
        // var shopId = req.session.shop._id;
        model.db.sequelize.query(strSql, {
                replacements: {
                    shopId: shopId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(paths => {
                var strSql = "select A.name, A.img, A._id as goodId, B._id from goods A join shopGoods B on A._id=B.goodId and B.shopId=:shopId and B.isDeleted=0 where A.isDeleted=0 ";
                // var shopId = req.session.shop._id;
                model.db.sequelize.query(strSql, {
                        replacements: {
                            shopId: shopId
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(goods => {
                        var shop = req.session.user;
                        res.jsonp({
                            goods: goods,
                            paths: paths,
                            shop: {
                                vpathCount: shop.vpathCount,
                                hpathCount: shop.hpathCount
                            }
                        });
                    });
            })
    });

    app.post('/Client/manage/updatepaths', auth.checkLogin(auth, true));
    app.post('/Client/manage/updatepaths', auth.checkManager);
    app.post('/Client/manage/updatepaths', function (req, res) {
        // update paths
        var paths = JSON.parse(req.body.paths),
            pArray = [];
        paths.forEach(path => {
            var p = ShopPath.getFilter({
                    _id: path._id
                })
                .then(orgPath => {
                    if (orgPath.goodId != path.goodId || orgPath.goodCount != path.goodCount) {
                        return model.db.sequelize.transaction(function (t1) {
                            return PathModifyLog.create({
                                    sequence: path.sequence,
                                    pathId: path._id,
                                    preGoodId: orgPath.goodId,
                                    preGoodName: orgPath.goodName,
                                    preGoodCount: orgPath.goodCount,
                                    goodCount: path.goodCount,
                                    goodId: path.goodId,
                                    goodName: path.goodName
                                }, {
                                    transaction: t1
                                })
                                .then(() => {
                                    return ShopPath.update(path, {
                                        where: {
                                            _id: path._id
                                        },
                                        transaction: t1
                                    });
                                });
                        });
                    }
                });
        });

        Promise.all(pArray)
            .then(() => {
                res.jsonp({
                    sucess: true
                });
            });

    });

    // /Client/manage/lockShop
    app.post('/Client/manage/lockShop', auth.checkLogin(auth, true));
    app.post('/Client/manage/lockShop', auth.checkManager);
    app.post('/Client/manage/lockShop', function (req, res) {
        // update paths
        var shopId = req.cookies['shopId'];
        Shop.update({
                isLocked: 1
            }, {
                where: {
                    _id: shopId
                }
            })
            .then(shop => {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/Client/manage/unlockShop', auth.checkLogin(auth, true));
    app.post('/Client/manage/unlockShop', auth.checkManager);
    app.post('/Client/manage/unlockShop', function (req, res) {
        // update paths
        var shopId = req.cookies['shopId'];
        Shop.update({
                isLocked: 0
            }, {
                where: {
                    _id: shopId
                }
            })
            .then(shop => {
                res.jsonp({
                    sucess: true
                });
            });
    });

    function random4() {
        var r = '000' + Math.random() * 1000;
        return r.slice(-3);
    };

    // goods to show 
    app.post('/Client/goods', auth.checkLogin(auth));
    app.post('/Client/goods', function (req, res) {
        var shopId = req.cookies['shopId'];
        var strSql = "select Distinct goodId, goodName from shopPaths where isDeleted=0 and shopId=:shopId and goodCount>0";
        // var shopId = req.session.shop._id;
        model.db.sequelize.query(strSql, {
                replacements: {
                    shopId: shopId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(goods => {
                res.jsonp(goods);
            });
    });

    // 支付订单
    app.post('/Client/order', auth.checkLogin(auth));
    app.post('/Client/order', function (req, res) {
        var shopId = req.cookies['shopId'],
            orderId = (new Date().getTime()).toString() + random4();
        return Order.create({
                userId: 0,
                shopId: shopId,
                totalPrice: 0.01,
                _id: orderId,
                payStatus: 2, // TBD need remove in real env
                createdBy: "0"
            })
            .then(() => {
                res.jsonp({
                    orderId: orderId
                });
            });
    });

    // 订单上添加商品
    app.post('/Client/AddGoodtoOrder', auth.checkLogin(auth));
    app.post('/Client/AddGoodtoOrder', function (req, res) {
        var shopId = req.cookies['shopId'],
            orderId = req.body.orderId,
            pathId = req.body.pathId;

        ShopPath.getFilter({
                shopId: shopId,
                sequence: pathId
            })
            .then(path => {
                path.goodCount -= 1;
                // 出货后数量减一
                return model.db.sequelize.transaction(function (t1) {
                        return path.save({
                                transaction: t1
                            })
                            .then(() => {
                                // 货物详情加入订单
                                return OrderDetail.create({
                                    orderId: orderId,
                                    goodId: path.goodId,
                                    pathId: path._id,
                                    status: 1
                                });
                            });
                    })
                    .then(detail => {
                        res.jsonp({
                            detailId: detail._id
                        });
                    });
            });
    });
}