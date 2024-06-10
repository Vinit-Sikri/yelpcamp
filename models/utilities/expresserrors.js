class ExpressErrors extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressErrors;


const wrapAsync = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    };
};

module.exports = {
    ExpressErrors: ExpressErrors,
    wrapAsync: wrapAsync
};
