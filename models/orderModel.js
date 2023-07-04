import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    products: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Product' 
        }
    ],
    payment: {},
    buyer: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    status: {
        type: String,
        default: 'Not Process',
        enum: ['Not Process', 'Processing', 'Shipped', 'Delivered', 'Cancel']
    }
}, {timestamps: true})

export default mongoose.model('Orders', orderSchema)