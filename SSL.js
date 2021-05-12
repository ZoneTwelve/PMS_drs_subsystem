var fs = require('fs');
var path = require('path');
module.exports = {
    options: {
        key: fs.readFileSync(path.join(__dirname, "ssl", "privatekey.pem")),
        cert: fs.readFileSync(path.join(__dirname, "ssl", "certificate.pem")),
        ca: [fs.readFileSync(path.join(__dirname, "ssl", "certrequest.csr"))]
    }
};