# CTTransf-Chaincode

**- Language:** NodeJS

**- Blockchain:** Hyperledger Fabric v1.2

**- Blockchain Library:** fabric-shim: v1.2

**- Author:** Lucas Fuzaro <<lfuzaro@outlook.com>>


## Repositories
- ## model
  **- ```dealer.js```**
  
  Functions related to Dealer participation in the Blockchain Network.
  He can Create, Offer and Transfer the asset (car)
      
  **- ```insurer.js```**
  
  Functions related to Insurer participation in the Blockchain Network.
  It can do a insurance check on the car's history to allow or deny the title transfership from happening

  **- ```registry.js```**
  
  Functions related to Registry participation in the Blockchain Network.
  It can do a background check on the car and owner's history to allow or deny the title transfership from happening

## Index.js

Main project file.

The **INIT** function is responsible for chaincode instantiation into the Blockchain Channel.

The **INVOKE** function is called whenever the blockchain executes a transaction. Kind of a middleware between the received proposal and the functions itselves.

In the end, this file executes the chaincode with the command ```shim.start(new Chaincode())```
