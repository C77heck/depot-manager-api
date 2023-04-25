export const CONSTANTS = { REDIS: ['honest-jobs'] };

export const ERROR_MESSAGES = {
    MISSING: {
        EMAIL: 'Email is missing!',
        SESSION_ID: 'Missing session id',
        AD: 'Missing ad id',
    },
    NOT_FOUND: {
        USER: 'User not found!',
        APPLICANT: 'User not found!',
        AD: 'Ad not found',
    },
    GENERIC: 'Something went wrong. Please try again later.',
    INVALID_TOKEN: 'Invalid token!',
    AD_EXPIRED: 'Ad expired',
};

export const MESSAGE = {
    SUCCESS: {
        GENERIC: 'Success',
        ALERT_ADDED: 'Successfully added to alerts',
        ALERT_REMOVED: 'Successfully removed from alerts',
        APPLIED: 'Successfully applied',
        ADDED_TO_FAVOURITES: 'Successfully added to favourites',
        REMOVED_FROM_FAVOURITES: 'Successfully removed from favourites',
        USER_DATA_UPDATED: 'User data has been successfully updated.',
        ACCOUNT_DELETED: 'Account has been successfully deleted.',
        REJECTED: 'Applicant rejected.',
        OFFER_MADE: 'Applicant received offer.',
        AD_CREATED: 'New ad has been successfully added',
        AD_DELETED: 'Ad has been successfully deleted',
        REVIEW_ADDED: 'Review has been successfully submitted',
        REVIEW_DELETED: 'Review has been successfully deleted',
    },
};
