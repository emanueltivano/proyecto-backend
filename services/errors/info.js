const GenerateProduct = (product) => {
    return `One or more properties were incomplete or not valid.
    List of required properties:
    - title: Needs to be a string, recieved ${product.title}
    - price: Needs to be a number, recieved ${product.price}`
}

module.exports = GenerateProduct;