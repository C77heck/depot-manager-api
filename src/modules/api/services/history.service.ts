import { Inject } from '../../../application/libs/inject.decorator';
import { Provider } from '../../../application/provider';
import History, { HistoryModel } from '../models/documents/history.document';
import { ProductDocument } from '../models/documents/product.document';
import HookService, { HistoryOptions } from './hook.service';

class HistoryService extends Provider {
    private collection: HistoryModel = History;

    @Inject()
    public hookService: HookService;

    public boot() {
        this.hookService
            .$productHistory
            .subscribe(async (data: HistoryOptions) => this.handleHistory(data));
    }

    public async list(product: ProductDocument) {
        return this.collection.find({ product });
    }

    private async handleHistory(data: HistoryOptions) {
        try {
            return this.collection.create(data);
        } catch (e) {
            console.log(e);
        }
    }
}

export default HistoryService;
