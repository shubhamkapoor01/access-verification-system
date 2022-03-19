// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Lock is ERC721 {
    constructor() ERC721("Lock", "LCK") {

    }

    mapping (address => uint[]) allowedOfPerson;
    mapping (address => uint[]) productsOfPerson;
    mapping (uint => Product) productNft;
    uint productIdCount = 0;

    /*  creates a new product and appends it to list of global products along with information about 
        the product ie name, description, owner address and initially no one is allowed to use it. */
    function addProduct(string memory name, address userAccount, string memory description) public {
        address[] memory empty;
        Product memory product = Product(name, description, userAccount, empty, productIdCount);
        _mint(userAccount, productIdCount);
        productNft[productIdCount] = product;
        productsOfPerson[userAccount].push(productIdCount);
        grantPermission(productIdCount, userAccount, userAccount);
        productIdCount ++;
    }

    /*  creates a new product and appends it to list of global products along with information about 
        the product ie name, description, owner address and address of who all are allowed to use it. */
    function addProductWithAllowed(string memory name, address userAccount, string memory description, address[] memory allowed) public {
        Product memory product = Product(name, description, userAccount, allowed, productIdCount);
        _mint(userAccount, productIdCount);
        productNft[productIdCount] = product;
        productsOfPerson[userAccount].push(productIdCount);
        grantPermission(productIdCount, userAccount, userAccount);
        for (uint i = 0; i < allowed.length; i ++) {
            allowedOfPerson[allowed[i]].push(productIdCount);
        }
        productIdCount ++;
    }

    /* checks if the product with Id productId belongs to the user that has invoked the function */
    function checkOwner(uint productId, address userToCheck) public view returns (bool) {
        address realOwner = productNft[productId].ownerAddress;
        return realOwner == userToCheck;
    }
    
    /* checks if a user has permission from the product owner to use a particular product */
    function isAllowed(uint productId, address userToCheckAllowed) public view returns (bool) {
        for (uint i = 0; i < productNft[productId].allowedToUse.length; i ++) {
            if (productNft[productId].allowedToUse[i] == userToCheckAllowed) {
                return true;
            }
        }
        return false;
    }

    /* the user is allowed to view all the permissions they have been granted */
    function myPermissions(address userAccount) public view returns (Product[] memory) {
        Product[] memory iCanUse = new Product[](allowedOfPerson[userAccount].length);
        for (uint i = 0; i < allowedOfPerson[userAccount].length; i ++) {
            Product memory currProduct = productNft[allowedOfPerson[userAccount][i]];
            iCanUse[i] = currProduct;
        }
        return iCanUse;
    }

    /* the user is allowed to view all the products that they own */
    function myProducts(address userAccount) public view returns (Product[] memory) {
        Product[] memory iOwn = new Product[](productsOfPerson[userAccount].length);
        for (uint i = 0; i < productsOfPerson[userAccount].length; i ++) {
            Product memory currProduct = productNft[productsOfPerson[userAccount][i]];
            iOwn[i] = currProduct;
        }
        return iOwn;
    }

    /* the owner is allowed to give usage rights of the product to another user */
    function grantPermission(uint productId, address userAccount, address userToGrantPermission) public {
        if (!checkOwner(productId, userAccount)) {
            return;
        }

        allowedOfPerson[userToGrantPermission].push(productId);
        productNft[productId].allowedToUse.push(userToGrantPermission);
    }

    /* the owner is allowed to take back the usage rights of the product from user */
    function revokePermission(uint productId, address userAccount, address userToRevokePermission) public {
        if (!checkOwner(productId, userAccount)) {
            return;
        }
        
        for (uint i = 0; i < productNft[productId].allowedToUse.length; i ++) {
            if (userToRevokePermission == productNft[productId].allowedToUse[i]) {
                productNft[productId].allowedToUse[i] = productNft[productId].allowedToUse[productNft[productId].allowedToUse.length - 1];
                productNft[productId].allowedToUse.pop();
                break;
            }
        }

        for (uint i = 0; i < allowedOfPerson[userToRevokePermission].length; i ++) {
            if (productId == allowedOfPerson[userToRevokePermission][i]) {
                allowedOfPerson[userToRevokePermission][i] = allowedOfPerson[userToRevokePermission][allowedOfPerson[userToRevokePermission].length - 1];
                allowedOfPerson[userToRevokePermission].pop();
                break;
            }
        }
    }

    /*  owner has rights to give the product(NFT) to anyone, that person will become
        the new owner and previous owner will no longer have it, all users who had 
        access to the product under the old owner will keep their access unless the 
        new owner decides to modify it */
    function transferOwnership(uint productId, address oldOwner, address newOwner) public {
        if (!checkOwner(productId, oldOwner)) {
            return;
        }
        
        grantPermission(productId, oldOwner, newOwner);
        bool belongsToOldOwner = false;

        for (uint i = 0; i < productsOfPerson[oldOwner].length; i ++) {
            if (productsOfPerson[oldOwner][i] == productId) {
                belongsToOldOwner = true;
                productsOfPerson[oldOwner][i] = productsOfPerson[oldOwner][productsOfPerson[oldOwner].length - 1];
                productsOfPerson[oldOwner].pop();
                break;
            }
        }

        if (!belongsToOldOwner) {
            return;
        }

        address userToRevokePermission = oldOwner;

        for (uint i = 0; i < productNft[productId].allowedToUse.length; i ++) {
            if (userToRevokePermission == productNft[productId].allowedToUse[i]) {
                productNft[productId].allowedToUse[i] = productNft[productId].allowedToUse[productNft[productId].allowedToUse.length - 1];
                productNft[productId].allowedToUse.pop();
                break;
            }
        }

        for (uint i = 0; i < allowedOfPerson[userToRevokePermission].length; i ++) {
            if (productId == allowedOfPerson[userToRevokePermission][i]) {
                allowedOfPerson[userToRevokePermission][i] = allowedOfPerson[userToRevokePermission][allowedOfPerson[userToRevokePermission].length - 1];
                allowedOfPerson[userToRevokePermission].pop();
                break;
            }
        }

        productsOfPerson[newOwner].push(productId); 
        address previousOwner = ownerOf(productId);
        _transfer(previousOwner, oldOwner, productId);
    }
}

struct Product {
    string name;
    string description;
    address ownerAddress;
    address[] allowedToUse;
    uint productId;
}