const jose = require('node-jose');

const encryptJWT = async (token) => {
    const keystore = jose.JWK.createKeyStore();

    const key = await keystore.generate("RSA", 2048, { alg: "RSA-OAEP", use: "enc" });

    const encryptedToken = await jose.JWE.createEncrypt({ format: 'compact' }, key)
        .update(token)
        .final();

    console.log('Encrypted JWT:', encryptedToken);
    return encryptedToken;
};

module.exports = encryptJWT;