const {
    SyncHook,
    AsyncSeriesHook
} = require('tapable')

class Car {
    constructor() {
        this.hooks = {
            acclerate: new SyncHook(["newSpeed"]),
            brake: new SyncHook(),
            calculateRoutes: new AsyncSeriesHook(["source", "target", "routesList"])
        }
    }
}

const myCar = new Car()

myCar.hooks.brake.tap('WarningLampPlugin', () => console.log('warningLamp'))

myCar.hooks.acclerate.tap("LoggerPlugin", newSpeed => console.log(`Accelerating to ${newSpeed}`))

myCar.hooks.calculateRoutes.tapPromise("calculateRoutes tapPomise", (source, target, routesList, callback) => {
    console.log("source", source)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(`tapPromise to ${source} ${target} ${routesList}`)
            resolve()
        }, 1000)
    })
})

myCar.hooks.brake.call()
myCar.hooks.acclerate.call(10)

console.time('cost')

myCar.hooks.calculateRoutes.promise('Async', 'hook', 'demo').then(() => {
    console.timeEnd('cost')
}, err=> {
    console.error(err)
    console.timeEnd('cost')
})
