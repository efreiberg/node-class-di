module.exports = class Service {
    constructor() {

    }
    onInit(callback) {
        setTimeout(() => callback());
    }
}