const utils = require('./utils');

const Insurer = class {

    /**
     * Insurance Check to validate if vehicle is ready for transfership
     * 
     * @param {*} args[0] - plate                 -> ex: "ABC1234" string
     * @param {*} args[1] - insuranceAnalysis     -> example below
     * ex: {
     *       insurance_check: {
     *                          analysis: {
     *                                      current_owner: string,
     *                                      last_owner: string,
     *                                      payments: string
     *                                     }
     *                          status: "NOT_APPROVED" or "APPROVED" (one or the other)
     *                        },
     *       insurerResponsible: string
     *     }
     */
    static async carInsuranceCheck(stub, args) {
        // === Formatting Plate Number ===        
        let plate = args[0].toUpperCase().replace(/[^a-z0-9]/gi,'')

        // === Checking for full array ===
        if (args.length !== 2) throw new Error("Transaction must have all 2 arguments defined")
        if (plate.length <= 0 || plate.length !== 7 || plate == undefined || plate == null ) throw new Error ("Invalid Car Plate!")
        if (args[1].length <= 0) throw new Error("Invalid insurance analysis format!")

        // === Checking if asset exists ===
        let asset = await stub.getState(plate)
        if (!asset && asset.length <= 0) throw new Error("This asset does not exists!")

        // === Checking if asset was approved in insurance check ===
        asset = JSON.parse(asset.toString())
        let insurance_check = JSON.parse(args[1])
        if (asset.car.status !== "BEING_AVALIATED_BY_INSURER") throw new Error("This car cannot be Insurance Checked!")
        if (insurance_check.status === "NOT_APPROVED") throw new Error("This car cannot be transfered because it failed the insurance check!")

        asset.car.status = "INSURANCE_CHECK_DONE"

        // === Getting Insurer Certificate ===
        let insurerCertificate = utils.getCertificate(stub)
        console.info("######", insurerCertificate)

        // === Verifying Insurer authorization for this transaction ===
        if (insurerCertificate.substring(insurerCertificate.indexOf("#") + 1) !== "Org1MSP") throw new Error("Invalid certificate! This member does not have permission to execute this transaction!")

        // === Updated Car Asset ===
        let updated_Car = {
            car: asset.car,
            insuranceAnalysis: {
                insurance_check: insurance_check,
                insurerResponsible: insurerCertificate
            }
        }

        // === Updating Asset in the Blockchain ===
        await stub.putState(asset.car.plate, Buffer.from(JSON.stringify(updated_Car)))
        console.log("Asset updated successfully!")

        return Buffer.from(JSON.stringify(asset.car.plate))

    }
}

module.exports = Insurer