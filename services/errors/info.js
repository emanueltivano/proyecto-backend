const GenerateProductErrorInfo = (product) => {
    return `One or more properties were incomplete or not valid.
    List of required properties:
    - title: Needs to be a string, received ${product.title}
    - price: Needs to be a number, received ${product.price}`
}

module.exports = GenerateProductErrorInfo;