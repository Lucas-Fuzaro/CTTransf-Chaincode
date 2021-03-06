const Identity = require('fabric-shim').ClientIdentity

class Utils {

    static getCertificate(stub){
        let clientIdentity = new Identity(stub)
        let cert = clientIdentity.getX509Certificate()
        let org = clientIdentity.getMSPID()
        if (cert.subject.commonName && org){
            return {
                name: cert.subject.commonName,
                org: org
            }
        }

        return null
    }
}

module.exports = Utils