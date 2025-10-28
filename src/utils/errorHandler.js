

export const extractErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.payload?.detail) return error.payload.detail;
    if (error?.payload?.message) return error.payload.message;
    if (error?.message) return error.message;
    return "An unexpected error occurred";
};