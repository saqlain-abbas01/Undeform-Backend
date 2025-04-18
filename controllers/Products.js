import Product from "../models/Product.js";
import errorHandler from "../utils/errorhandler.js";

const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({
      message: "Product created successfully!",
      product: newProduct,
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

const uploadImage = async (req, res) => {
  console.log("upload file", req.files);
  try {
    const urls = req.files.map((file) => {
      return `/Uploads/${file.filename}`;
    });
    res.status(200).json({
      urls,
    });
  } catch (error) {
    errorHandler(error);
  }
};

const fetchAllProducts = async (req, res) => {
  try {
    let query = Product.find({});
    let totalProductQuery = Product.find({});
    if (req.query.category) {
      query = query.find({ category: req.query.category });
      totalProductQuery = totalProductQuery.find({
        category: req.query.category,
      });
    }
    if (req.query.brand) {
      query = query.find({ brand: req.query.brand });
      totalProductQuery = totalProductQuery.find({ brand: req.query.brand });
    }
    if (req.query._sort && req.query._order) {
      query = query.sort({ [req.query._sort]: req.query._order });
      totalProductQuery = totalProductQuery.sort({
        [req.query._sort]: req.query._order,
      });
    }

    if (req.query._page && req.query._limit) {
      const pageSize = req.query._limit;
      const page = req.query._page;
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }
    const products = await query.exec();
    const totalProducts = await totalProductQuery.countDocuments().exec();
    console.log(totalProducts);
    res.set("X-Total-Count", totalProducts);
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    errorHandler(error, res);
  }
};

const fetchRecentProducts = async (req, res) => {
  try {
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      recentProducts,
    });
  } catch (error) {
    console.error("Failed to fetch recent products:", error);
    errorHandler(error);
  }
};

const fecthProductsById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const product = await Product.findById(id);
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

const updateProductById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("id:", id);
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({
      success: true,
      updatedProduct,
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

const deleteProductById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Product ID is required",
      });
    }
    const deleteProduct = await Product.deleteOne({ _id: id });
    console.log("deleted product:", deleteProduct);
    res.json({
      status: true,
      deleteProduct,
    });
  } catch (error) {
    errorHandler(error);
  }
};

export {
  createProduct,
  fetchAllProducts,
  fecthProductsById,
  updateProductById,
  fetchRecentProducts,
  deleteProductById,
  uploadImage,
};
