const express = require("express");
const router = express.Router();
const Cloth = require("../models/clothes");

router.get("/findByName", async (req, res) => {
    try {
        let clothID = await Cloth.find({ }).exec();
        return res.send(clothID);
    } catch(e) {
        return res.status(500).send(e)
    }
})

router.get("/findByName/:name", async (req, res) => {
    let { name } = req.params;
    try {
        let clothID = await Cloth.find({ title: { $regex: name, $options: "i" } }).exec();
        return res.send(clothID);
    } catch(e) {
        return res.status(500).send(e)
    }
})

router.get("/findByCategory", async (req, res) => {
    try {
        let clothID = await Cloth.find({ }).exec();
        const page = parseInt(req.query.page) || 1; 
        const perPage = parseInt(req.query.perPage) || 15;

        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedProducts = clothID.slice(startIndex, endIndex);
        return res.send(paginatedProducts)
    } catch(e) {
        return res.status(500).send(e)
    }
})

router.get("/findByCategory/:category", async (req, res) => {
    let { category } = req.params;
    const categoryList = category.split(",");
    try {
        let clothID = await Cloth.find({  category: categoryList.length === 1 ? categoryList[0] : { $in: categoryList } }).exec();
        const page = parseInt(req.query.page) || 1; 
        const perPage = parseInt(req.query.perPage) || 15;

        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedProducts = clothID.slice(startIndex, endIndex);
        return res.send(paginatedProducts);
    } catch(e) {
        return res.status(500).send(e)
    }
})

module.exports = router;