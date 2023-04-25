export interface ValidationResponse {
    isValid: boolean;
    error: string;
}

export type ValidatorFunction = (value: any) => ValidationResponse;

export type LengthValidatorFunction = (length: number) => ValidatorFunction;

export const required: ValidatorFunction = (value: any): ValidationResponse => {
    console.log({ value });
    if (!value) {
        return {
            isValid: false,
            error: 'Required'
        };
    }

    return {
        isValid: true,
        error: ''
    };
};

export const isNumber: ValidatorFunction = (value: any): ValidationResponse => {
    if (isNaN(+value)) {
        return {
            isValid: false,
            error: 'Must be number'
        };
    }

    return {
        isValid: true,
        error: ''
    };
};

export const isBoolean: ValidatorFunction = (value: any): ValidationResponse => {
    if (typeof value !== 'boolean') {
        return {
            isValid: false,
            error: 'Must be boolean'
        };
    }

    return {
        isValid: true,
        error: ''
    };
};
export const isDate: ValidatorFunction = (value: any): ValidationResponse => {
    const date = new Date(value);
    if (date.toDateString() === 'Invalid Date') {
        return {
            isValid: false,
            error: 'Must be valid date'
        };
    }

    return {
        isValid: true,
        error: ''
    };
};

export const isString: ValidatorFunction = (value: any): ValidationResponse => {
    if (typeof value !== 'boolean') {
        return {
            isValid: false,
            error: 'Must be boolean'
        };
    }

    return {
        isValid: true,
        error: ''
    };
};

export const email: ValidatorFunction = (value: any): ValidationResponse => {
    const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!email.test(value)) {
        return {
            isValid: false,
            error: 'Invalid email'
        };
    }

    return {
        isValid: true,
        error: ''
    };
};

export const minLength: LengthValidatorFunction = (length: number): ValidatorFunction => {
    return (value: string): ValidationResponse => {
        if (value.length < length) {
            return {
                isValid: false,
                error: `Input must be at least ${length} character long`
            };
        }

        return {
            isValid: true,
            error: ''
        };
    };
};

export const maxLength: LengthValidatorFunction = (length: number): ValidatorFunction => {
    return (value: string): ValidationResponse => {

        if (value.length > length) {
            return {
                isValid: false,
                error: `Input is too long! The maximum length is ${length} character long`
            };
        }

        return {
            isValid: true,
            error: ''
        };
    };
};
