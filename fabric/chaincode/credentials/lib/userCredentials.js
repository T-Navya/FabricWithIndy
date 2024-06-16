class UserCredentials {
    constructor(issuer, name, address, dob, licenseClass, expiryDate) {
        this.issuer = issuer;
        this.name = name;
        this.address = address;
        this.dob = dob;
        this.licenseClass = licenseClass;
        this.expiryDate = expiryDate;
        this.docType = 'drivingLicense';
    }
}

module.exports = UserCredentials;
