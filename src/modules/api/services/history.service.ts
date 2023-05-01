import { Inject } from '../../../application/libs/inject.decorator';
import { Provider } from '../../../application/provider';
import History, { HistoryModel } from '../models/documents/history.document';
import { ProductDocument } from '../models/documents/product.document';
import HookService, { HistoryOptions } from './hook.service';
import WarehouseService from './warehouse.service';

class HistoryService extends Provider {
    private collection: HistoryModel = History;

    @Inject()
    public hookService: HookService;

    @Inject()
    public warehouseService: WarehouseService;

    public boot() {
        this.hookService
            .$productHistory
            .subscribe(async (data: HistoryOptions) => this.handleHistory(data));
    }

    public async getHistoriesByWarehouse(warehouse: { products: ProductDocument[]; _id: string }) {
        const histories = await this.collection
            .find({
                $or: [
                    { product: { $in: warehouse.products } },
                    {
                        $or: [
                            { 'details.from': warehouse },
                            { 'details.to': warehouse },
                        ]
                    },
                ]
            })
            .sort({ createdAt: -1 })
            .populate('product');

        return Promise.all(histories.map(async history => {
            if (history.type === 'transferred') {
                console.log(history.details?.from);
                const from = await this.warehouseService.get(history.details?.from || '');
                const to = await this.warehouseService.get(history.details?.to || '');

                return {
                    from, to,
                    type: history.type,
                    createdAt: (history as any).createdAt,
                    product: history.product,
                };
            }

            return history;
        }));
    }

    public async getHistories(products: ProductDocument[]) {
        const histories = await this.collection
            .find({ product: { $in: products } })
            .sort({ createdAt: -1 })
            .populate('product');

        return Promise.all(histories.map(async history => {
            if (history.type === 'transferred') {
                const from = await this.warehouseService.get(history.details?.from || '');
                const to = await this.warehouseService.get(history.details?.to || '');

                return {
                    from, to,
                    type: history.type,
                    createdAt: (history as any).createdAt,
                    product: history.product,
                };
            }

            return history;
        }));
    }

    public async list(product: ProductDocument) {
        const histories = await this.collection.find({ product });

        return Promise.all(histories.map(async history => {
            if (history.type === 'transferred') {
                const from = await this.warehouseService.get(history.details?.from || '');
                const to = await this.warehouseService.get(history.details?.to || '');

                return {
                    history, from, to
                };
            }

            return { history };
        }));
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
