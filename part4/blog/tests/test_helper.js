
const isUnique = (array) => {
    return array.length === new Set(array).size;
}

module.exports = { isUnique }
