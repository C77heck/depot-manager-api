import { Subject } from 'rxjs';
import { Provider } from '../../../application/provider';
import { HistoryDocument } from '../models/documents/history.document';

export interface HistoryOptions {
    type: HistoryDocument['type'];
    details: object;
}

class HookService extends Provider {
    public $productHistory = new Subject<HistoryOptions>();
}

export default HookService;
