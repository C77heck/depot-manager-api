export type ErrorType =
    'BadRequest'
    | 'MissingResource'
    | 'Forbidden'
    | 'Unauthorized'
    | 'NotFound'
    | 'MethodNotAllowed'
    | 'RequestTimeout'
    | 'UnprocessableEntity'
    | 'InternalServerError'
    | 'BadGateway'
    | 'GatewayTimeout'
    | 'NotAcceptable'
    | 'PayloadTooLarge'
    | 'HttpError' // delete
    | 'ServiceUnavailable';

export interface HttpError {
    message: string;
    code: number;
    type: ErrorType;
    payload: any;
}

export class HttpError extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, code?: number, payload?: any) {
        super(message || 'HttpError');
        this.type = 'HttpError';
        this.code = code || 500;
        this.payload = payload;
    }
}

export class BadRequest extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message || 'BadRequest');
        this.type = 'BadRequest';
        this.code = 400;
        this.payload = payload;
    }
}

export class Unauthorized extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message || 'Unauthorized');
        this.type = 'Unauthorized';
        this.code = 401;
        this.payload = payload;
    }
}

export class Forbidden extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message || 'Forbidden');
        this.type = 'Forbidden';
        this.code = 403;
        this.payload = payload;
    }
}

export class NotFound extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message || 'NotFound');
        this.type = 'NotFound';
        this.code = 404;
        this.payload = payload;
    }
}

export class MethodNotAllowed extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message || 'MethodNotAllowed');
        this.type = 'MethodNotAllowed';
        this.code = 405;
        this.payload = payload;
    }
}

export class NotAcceptable extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message || 'NotAcceptable');
        this.type = 'NotAcceptable';
        this.code = 406;
        this.payload = payload;
    }
}

export class RequestTimeout extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message || 'RequestTimeout');
        this.type = 'RequestTimeout';
        this.code = 408;
        this.payload = payload;
    }
}

export class InternalServerError extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message || 'InternalServerError');
        this.type = 'InternalServerError';
        this.code = 500;
        this.payload = payload;
    }
}

export class UnprocessableEntity extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message);
        this.type = 'UnprocessableEntity';
        this.code = 422;
        this.payload = payload;
    }
}

export class ServiceUnavailable extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message || 'ServiceUnavailable');
        this.type = 'ServiceUnavailable';
        this.code = 503;
        this.payload = payload;
    }
}

export class GatewayTimeout extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message || 'GatewayTimeout');
        this.type = 'GatewayTimeout';
        this.code = 504;
        this.payload = payload;
    }
}

export class BadGateway extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message || 'BadGateway');
        this.type = 'BadGateway';
        this.code = 502;
        this.payload = payload;
    }
}

export class PayloadTooLarge extends Error implements HttpError {
    public code: number;
    public type: ErrorType;
    public payload: any;

    public constructor(message: string, payload?: any) {
        super(message || 'PayloadTooLarge');
        this.type = 'PayloadTooLarge';
        this.code = 413;
        this.payload = payload;
    }
}
