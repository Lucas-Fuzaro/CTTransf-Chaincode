const utils = require('./utils')

const Dealer = class {

    /**
     * Creating Car Asset in the Network
     * 
     * @param {*} args[0] - plate      -> ex: "ABC1234" string
     * @param {*} args[1] - color      -> ex: "black" string
     * @param {*} args[2] - make       -> ex: "fiat" string
     * @param {*} args[3] - model      -> ex: "uno" string
     * @param {*} args[4] - mileage    -> ex: "10515.70" string
     * @param {*} args[5] - price      -> ex: "29500.25" string
     * @param {*} args[6] - owner      -> ex: "11100011122" string
     * @param {*} args[7] - new_owner  -> ex: "11100011122" string
     */

    static async createCar(stub, args) {
        // === Checking for full array ===
        if (args.length !== 8) throw new Error("Asset must have all 8 arguments defined")
        if (args[0].length <= 0) throw new Error("1st argument must be filled!")
        if (args[1].length <= 0) throw new Error("2nd argument must be filled!")
        if (args[2].length <= 0) throw new Error("3rd argument must be filled!")
        if (args[3].length <= 0) throw new Error("4th argument must be filled!")
        if (args[4].length <= 0) throw new Error("5th argument must be filled!")
        if (args[5].length <= 0) throw new Error("6th argument must be filled!")
        if (args[6].length <= 0) throw new Error("7th argument must be filled!")
        if (args[7].length <= 0) throw new Error("8th argument must be filled!")

        // === Formatting Variables ===
        let plate = args[0].toUpperCase().replace(/[^a-z0-9]/gi,'')
        let mileage = parseFloat(args[4].replace(/[^\d.]/g, ''))
        let price = parseFloat(args[5].replace(/[^\d.]/g, ''))
        let owner = args[6].replace(/\D/g, '')
        let new_owner = args[7].replace(/\D/g, '')

        // === Error Handling for New Owner, Plate, Mileage and Price ===
        if (owner.length !== 11 || new_owner.length !== 11) throw new Error("Both CPF must be valid!")
        if (plate.length !== 7) throw new Error("Car plate must be valid!")
        if (typeof mileage !== 'number' || typeof price !== 'number') throw new Error("5th and 6th arguments must be numberic strings!")

        // === Checking if asset exists ===
        let existence = await stub.getState(plate)
        if (existence && existence.length > 0) throw new Error("This asset already exists!")

        // === Getting Dealer Certificate === 
        let dealerCertificate = utils.getCertificate(stub)
        console.log("######", dealerCertificate)

        // === Creating Object ===
        let car = {
            plate: plate,
            color: args[1].toLowerCase(),
            make: args[2].toLowerCase(),
            model: args[3].toLowerCase(),
            mileage: mileage,
            price: price,
            status: "OWNED",
            dealerResponsible: dealerCertificate,
            owner: owner,
            new_owner: new_owner
        }

        // === Saving Asset in the Blockchain ===
        await stub.putState(plate, Buffer.from(JSON.stringify({car: car})))
        console.info("Car created successfully!")

        return Buffer.from(JSON.stringify(plate))
    }


    /**
     * Making Car available for Insurer to check the Car's insurance history
     * 
     * @param {*} args[0] - plate   -> ex: "ABC1234" string
     */

    static async offerCar(stub, args) {
        // === Formatting Plate Number ===        
        let plate = args[0].toUpperCase().replace(/[^a-z0-9]/gi,'')

        // === Checking for full array ===
        if (plate.length <= 0 || plate.length !== 7 || plate == undefined || plate == null) throw new Error ("Invalid Car Plate!")

        // === Checking if asset exists ===
        let asset = await stub.getState(plate)
        if (!asset || asset.length <= 0) throw new Error("Asset does not exist!")

        // === Getting the dealer Certificate ===
        let dealerCertificate = utils.getCertificate(stub)
        console.info("######", dealerCertificate)

        // === Checking if dealer is authorized to execute this transaction ===
        asset = JSON.parse(asset.toString())
        if (asset.car.dealerResponsible !== dealerCertificate) throw new Error ("This dealer does not have permission to operate that transaction!")

        // === Checking if the car can be offered for insurance check ===
        if (asset.car.status !== "OWNED") throw new Error ("This car cannot be offered to Insurance Check")

        asset.car.status = "BEING_AVALIATED_BY_INSURER"

        // === Updating Asset in the Blockchain ===
        await stub.putState(plate, Buffer.from(JSON.stringify(asset)))
        console.log("Asset updated successfully!")

        return Buffer.from(JSON.stringify(plate))

    }

    /**
     * Transfering Car Ownership for the new_owner
     * 
     * @param {*} args[0] - plate     -> ex: "ABC1234" string
     */

    static async transferCar(stub, args) {
        // === Formatting Plate Number ===
        let plate = args[0].toUpperCase().replace(/[^a-z0-9]/gi,'')

        // === Checking for full array ===
        if (plate.length <= 0 || plate.length !== 7 || plate == undefined || plate == null) throw new Error ("Invalid Car Plate!")

        // === Checking if asset exists ===
        let asset = await stub.getState(plate)
        if (!asset || asset.length <= 0) throw new Error("Asset does not exist!")

        // === Getting the dealer Certificate ===
        let dealerCertificate = utils.getCertificate(stub)
        console.info("######", dealerCertificate)

        // === Checking if dealer is authorized to execute this transaction ===
        asset = JSON.parse(asset.toString())
        if (asset.car.dealerResponsible !== dealerCertificate) throw new Error ("This dealer does not have permission to operate that transaction!")

        // === Checking if the car can be transfered ===
        if (asset.car.status !== "READY_FOR_TRANSFERSHIP") throw new Error ("This car cannot be transfered!")

        asset.car.status = "OWNED"
        asset.car.owner = asset.car.new_owner
        asset.car.new_owner = ""
        asset.insuranceAnalysis = ""
        asset.registryAnalysis = ""

        // === Updating Asset in the Blockchain ===
        await stub.putState(plate, Buffer.from(JSON.stringify(asset)))
        console.log("Asset updated successfully!")

        return Buffer.from(JSON.stringify(plate))
    }
}

module.exports = Dealer