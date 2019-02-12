'use strict'

const shim = require("fabric-shim")
const Dealer = require("./model/dealer")
const Insurer = require("./model/insurer")
const Registry = require("./model/registry")
const utils = require('./model/utils')

const Chaincode = class {
    async Init(stub) {
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


    // async checkingCar(stub, args){
    //     // === Checking parameters ===
    //     const plate = args[0].toUpperCase().replace(/[.,-\s]/g, '')
    //     if (args.length !== 1) throw new Error("Incorrect number of arguments. This function accepts only 1 argument.")
    //     if (plate.length <= 0 || plate == undefined || plate == null || plate !== 7) throw new Error ("Invalid Car Plate!")
    //     if (!plate) throw new Error("Asset Identifier cannot be empty!")

    //     if (id == undefined || id == null) throw new Error("Car ID must not be null or undefined!")
    //     if (typeof owner !== "string" && owner.length == 0) throw new Error("Owner invalid!")
    //     if (typeof new_owner !== "string" && new_owner.length == 0) throw new Error(`Owner ${new_owner} is not valid! It must be a string with at least 1 letter`)
    //     if (new_owner.indexOf("@") < 0 || new_owner.indexOf("@") == new_owner.length - 1) throw new Error ("new_owner is invalid! Its format should be <UserIdentity>@<UserOrganization>")
    //     if (new_owner.substring(new_owner.indexOf("@") + 1, new_owner.length - 1) !== "org" && typeof new_owner.substring(new_owner.length - 1) !== "number") throw new Error ("Invalid new_owner format!")

    //     // === Checking if the car exists ===
    //     let asset = await stub.getState(plate)
    //     if (!asset && asset.length == 0) throw new Error("Asset does not exist!")
    //     asset = JSON.parse(asset.toString())
    //     if (asset.status !== "BEING_AVALIATED") throw new Error("Asset is not available for avaliation!")

    //     // === Getting Registry Certificate ===
    //     let registryCertificate = await utils.getCertificate(stub)
    //     console.info("######", registryCertificate)

    //     // === Updating Asset in the blockchain
    //     await stub.putState(plate, Buffer.from(JSON.stringify(asset)))
    //     console.info("Asset updated successfully")

    //     return Buffer.from(JSON.stringify(plate))

    // }

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