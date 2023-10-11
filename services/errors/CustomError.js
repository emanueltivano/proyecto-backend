const CustomError = ({ name = 'Error', cause, message, code = 1 }) => {
    const error = new Error(message);
    error.name = name;
    error.code = code;
    error.cause = cause;
    return error;
};

module.exports = CustomError;