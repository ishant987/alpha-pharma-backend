import asyncHandler from '../utils/asyncHandler.js';

// Mock Pharmacy Products Data
const mockProducts = [
    { id: 1, name: 'Paracetamol 500mg', type: 'Capsule', stock: 120, price: 5.99 },
    { id: 2, name: 'Ibuprofen 200mg', type: 'Tablet', stock: 85, price: 7.50 },
    { id: 3, name: 'Amoxicillin 500mg', type: 'Antibiotic', stock: 45, price: 15.00 },
    { id: 4, name: 'Cough Syrup (Cherry)', type: 'Syrup', stock: 30, price: 12.99 },
];

/**
 * @desc    Get all products
 * @route   GET /api/v1/products
 */
export const getAllProducts = asyncHandler(async (req, res) => {
    res.status(200).json({
        status: 'success',
        results: mockProducts.length,
        data: {
            products: mockProducts,
        },
    });
});

/**
 * @desc    Get a single product by ID
 * @route   GET /api/v1/products/:id
 */
export const getProductById = asyncHandler(async (req, res) => {
    const product = mockProducts.find((p) => p.id === parseInt(req.params.id));

    if (!product) {
        const error = new Error(`Product with ID ${req.params.id} not found.`);
        error.statusCode = 404;
        throw error;
    }

    res.status(200).json({
        status: 'success',
        data: {
            product,
        },
    });
});
