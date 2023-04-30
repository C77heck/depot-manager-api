import superagent from 'superagent';
import { NotFound } from '../../../application/models/errors';
import { Provider } from '../../../application/provider';
import { ERROR_MESSAGES } from '../../../libs/constants';
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

        const categories = resources.map((resource: ResourceDocument) => resource.category) as string[];

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

    public async get(id: string): Promise<ResourceDocument> {
        const doc = await this.collection.findById(id);

        if (!doc) {
            throw new NotFound(ERROR_MESSAGES.NOT_FOUND.DOCUMENT);
        }

        return doc;
    }
}

export default ResourceService;
