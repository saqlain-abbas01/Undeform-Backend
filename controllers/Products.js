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

const fetchFilterProducts = async (req, res) => {
  console.log("req query", req.query);
  try {
    let query = Product.find({});
    let totalProductQuery = Product.find({});
    if (req.query.category && req.query.category !== "all") {
      const category = req.query.category.trim();
      query = query.find({
        category: {
          $regex: `^${category}\\s*$`,
          $options: "i",
        },
      });
      totalProductQuery = totalProductQuery.find({
        category: {
          $regex: `^${category}\\s*$`,
          $options: "i",
        },
      });
    }
    if (req.query.size && req.query.size !== "all") {
      query = query.find({ size: req.query.size });
      totalProductQuery = totalProductQuery.find({ size: req.query.size });
    }
    if (req.query.brands) {
      let brands = req.query.brands;
      console.log(brands);
      if (!Array.isArray(brands)) {
        brands = [brands];
      }
      query = query.find({ brand: { $in: brands } });
      totalProductQuery = totalProductQuery.find({ brand: { $in: brands } });
    }
    if (req.query._sort) {
      const sortOption = req.query._sort;
      if (sortOption === "newest") {
        query = query.sort({ createdAt: -1 }); // Newest first
        totalProductQuery = totalProductQuery.sort({ createdAt: -1 });
      } else if (sortOption === "price-low") {
        query = query.sort({ price: 1 }); // Low to high
        totalProductQuery = totalProductQuery.sort({ price: 1 });
      } else if (sortOption === "price-high") {
        query = query.sort({ price: -1 }); // High to low
        totalProductQuery = totalProductQuery.sort({ price: -1 });
      }
    }
    if (req.query._page && req.query._limit) {
      const pageSize = req.query._limit;
      const page = req.query._page;
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }
    const products = await query.exec();
    const totalProducts = await totalProductQuery.countDocuments().exec();
    console.log("filter products", products);
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
  fetchFilterProducts,
  fecthProductsById,
  updateProductById,
  fetchRecentProducts,
  deleteProductById,
  uploadImage,
};
