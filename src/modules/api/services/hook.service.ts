import { Subject } from 'rxjs';
import { Provider } from '../../../application/provider';
import { HistoryDocument } from '../models/documents/history.document';
import { ProductDocument } from '../models/documents/product.document';

export interface HistoryOptions {
    product: ProductDocument;
    type: HistoryDocument['type'];
    details: object;
}

export interface BatchTransferOptions {
    from: string;
    to: string;
}

class HookService extends Provider {
    public $productHistory = new Subject<HistoryOptions>();
    public $batchTransfer = new Subject<BatchTransferOptions>();
}

export default HookService;
