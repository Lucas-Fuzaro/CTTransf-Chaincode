const utils = require("./utils")

const Registry = class {
    
    static async carBackgroundCheck(stub, args) {
        // === Getting Insurer Certificate ===
        let registryCertificate = utils.getCertificate(stub)
        console.info("######", registryCertificate)
        
        // === Checking Certificate ===
        if (registryCertificate.org !== "Org3MSP") throw new Error ("Invalid certificate! This member does not have permission to execute this transaction!")

        // === Formatting Plate Number ===        
        let plate = args[0].toUpperCase().replace(/[^a-z0-9]/gi,'')

        // === Checking Parameters ===
        if (args.length != 2) throw new Error("Invalid number of arguments!")
        if (plate.length !== 7 || plate == undefined || plate == null) throw new Error ("Invalid Car Plate!")
        if (args[1].length <= 0) throw new Error("Invalid Background Check format!")

        // === Checking if asset exists ===
        let asset = await stub.getState(plate)
        if (!asset && asset.length <= 0) throw new Error("This asset does not exists!")
        
        asset = JSON.parse(asset.toString())
        let background_check = JSON.parse(args[1])
        if (asset.car.status !== "INSURANCE_CHECK_DONE") throw new Error ("This car cannot get background checked!")
        if (background_check.status === "DENIED") throw new Error ("This car cannot be transfered because it failed the background check!")

        asset.car.status = "READY_FOR_TRANSFERSHIP"

        // === Creating Object ===
        let new_asset = {
            car: asset.car,
            insuranceAnalysis: {
                insurance_check: asset.insuranceAnalysis.insurance_check,
                insurerResponsible: asset.insuranceAnalysis.insurerResponsible
            },
            registryAnalysis: {
                background_check: background_check,
                registryAnalysis: registryCertificate.name + "#" + registryCertificate.org
            }
        }


        // === Updating Asset in the Blockchain ===
        await stub.putState(asset.car.plate, Buffer.from(JSON.stringify(new_asset)))
        console.log("--- Asset updated successfully! ---")

        return Buffer.from(JSON.stringify(asset.car.plate))
    }

}

module.exports = Registry