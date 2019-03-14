'use strict'

const shim = require("fabric-shim")
const Dealer = require("./model/dealer")
const Insurer = require("./model/insurer")
const Registry = require("./model/registry")

const Chaincode = class {
    async Init() {
        console.log("============= INIT SUCCESSFUL =============");
        return shim.success()
    }

    async Invoke(stub) {
        console.log("@@@ Invoke Started @@@")
        console.log("Transaction ID: " + stub.getTxID())
        let ret = stub.getFunctionAndParameters()
        console.info("\nret: " + ret)
        let method = this[ret.fcn]
        if (!method) {
            console.log('### No function of name: ' + ret.fcn + ' found! ###')
            throw new Error('### Received unknown function: ' + ret.fcn + ' invocation ###')
        }
        try {
            let payload = await method(stub, ret.params)
            return shim.success(payload)
        } catch (err) {
            console.log(err)
            return shim.error(err)
        }
    }

    async queryCar(stub, args) {
        let plate =  args[0].toUpperCase().replace(/[^a-z0-9]/gi,'')
        if (args.length !== 1) throw new Error("Incorrect number of arguments. This function accepts only 1 argument.")
        if (plate.length <= 0 || plate.length !== 7 || plate == undefined || plate == null) throw new Error ("Invalid Car Plate!")
        if (!plate) throw new Error("Asset Identifier cannot be empty!")

        let result = await stub.getState(plate)

        return result

    }

    // === Dealer ===

    async createCar(stub, args) {
        return Dealer.createCar(stub, args)
    }

    async offerCar(stub, args) {
        return Dealer.offerCar(stub, args)
    }

    async transferCar(stub, args) {
        return Dealer.transferCar(stub, args)
    }


    // === Insurer ===

    async carInsuranceCheck(stub, args) {
        return Insurer.carInsuranceCheck(stub, args)
    }


    // === Registry ===

    async carBackgroundCheck(stub, args) {
        return Registry.carBackgroundCheck(stub, args)
    }

}

shim.start(new Chaincode());