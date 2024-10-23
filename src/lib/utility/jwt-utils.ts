import { verifiableJwt } from "../types.js";

// Utility Function to Decode a JWT Token into a verifiablePresentation
export const getDecodedPresentation = function getDecodedJwt(token: string) { 

    const jwt = atob(token.split('.')[1]);
    const jwtPresentation = JSON.parse(jwt);

    const decodedPresentstion = {...jwtPresentation};
    decodedPresentstion.verifiableCredential = [];

    jwtPresentation.verifiableCredential.forEach((vc: verifiableJwt) => {
        const parseOutToken = vc.id.split(';')[1];
        const jwt = atob(parseOutToken.split('.')[1]);
        const jsonJwt = JSON.parse(jwt);
        decodedPresentstion.verifiableCredential.push(jsonJwt);
    });

    return decodedPresentstion;
}