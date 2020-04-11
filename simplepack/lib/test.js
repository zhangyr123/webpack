const { getAST, getDependencies, transform } = require('./parser')
const path = require('path')

// console.log(getAST(path.join(__dirname, '../src/index.js')))
let ast = getAST(path.join(__dirname, '../src/index.js'))

// console.log(getDependencies(ast))
let dependencies = getDependencies(ast)

let source = transform(ast)
console.log(source)