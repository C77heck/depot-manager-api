import { Inject } from '../../../application/libs/inject.decorator';
import { Provider } from '../../../application/provider';
import History, { HistoryModel } from '../models/documents/history.document';
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

    private async handleHistory(data: HistoryOptions) {
        try {
            return this.collection.create(data);
        } catch (e) {
            console.log(e);
        }
    }
}

export default HistoryService;
