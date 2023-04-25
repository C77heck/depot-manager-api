import { Provider } from '../../../application/provider';
import Product, { ProductModel } from '../models/documents/product.document';

class ProductsService extends Provider {
    private collection: ProductModel = Product;

}

export default ProductsService;
