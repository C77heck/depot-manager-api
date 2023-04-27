import superagent from 'superagent';
import { Provider } from '../../../application/provider';
import { ProductDocument } from '../models/documents/product.document';
import Resource, { ResourceDocument, ResourceModel } from '../models/documents/resource.document';

class ResourceService extends Provider {
    private collection: ResourceModel = Resource;
    private endpoint = process.env?.FAKE_API || '';

    public async list() {
        return this.collection.find();
    }

    public async getResources(): Promise<{ categories: string[]; resources: ResourceDocument[] }> {
        const resources = await this.list();

        const categories = await resources.map((resource: ResourceDocument) => resource.category);

        return { categories, resources };
    }

    public async init(): Promise<boolean> {
        try {
            const isResourceSetReady = await this.getIsResourceReady();

            if (isResourceSetReady) {
                return true;
            }

            const results = await superagent.get(`${this.endpoint}/products`).send();

            const formattedProducts = (results?.body || []).map((result: ProductDocument) => ({ ...result, productId: result.id }));

            await this.collection.insertMany(formattedProducts);

            return true;
        } catch (e) {
            return false;
        }
    }

    private async getIsResourceReady(): Promise<boolean> {
        try {
            const resources = await this.collection.find();

            return !!resources?.length;
        } catch (e) {
            return false;
        }
    }
}

export default ResourceService;
