import { useState, useRef } from "react";
const ethers = require("ethers")

const verifyMessage = async ({ message, address, signature }) => {
    try {
      const signerAddr = await ethers.utils.verifyMessage(message, signature);
      if (signerAddr !== address) {
        return false;
      }
  
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
};

export default function VerifyMessage() {
    const [verificationMessage, setVerificationMessage] = useState('');
    const [verificationError, setVerificationError] = useState(false);
    const dmvId = '0x109073b8C4f82D6060430CB25B3065CBEBF684FE'

    const verifyCredential = async (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      const file = data.get("signedvc");
      const fileContent = await file.text();
      const json = JSON.parse(fileContent);
      const m = JSON.stringify(json, null).split(',"proof":')[0] + '}';
      if (!json.proof) {
        setVerificationMessage('Credential signature does not exist!');
        setVerificationError(true);
        return;
      }

      const [header, content, signature] = json.proof.jws.split(".");
      const sig = atob(signature); // replace this because of proof
      
      const isValid = await verifyMessage({
        message: m,
        address: dmvId,
        signature: sig
      });
  
      if (isValid) {
        setVerificationMessage(`Valid drivers license issued by ${json.credentialSubject.driversLicense.issuing_authority} to ${json.credentialSubject.driversLicense.given_name} ${json.credentialSubject.driversLicense.family_name}`)
        setVerificationError(false);
      } else {
        setVerificationMessage(`Invalid drivers license issued by ${json.credentialSubject.driversLicense.issuing_authority} to ${json.credentialSubject.driversLicense.given_name} ${json.credentialSubject.driversLicense.family_name}`)
        setVerificationError(true);
      }
    }

return (
    <form className="m-4" onSubmit={verifyCredential}>
      <div className="credit-card w-full shadow-lg mx-auto rounded-xl bg-white">
        <main className="mt-4 p-4">
          <h1 className="text-xl font-semibold text-gray-700 text-center">
            Verify Drivers License Credential
          </h1>
          <label htmlFor="dl-dmv-id" className="block text-lg font-medium text-gray-500 mt-4">
            DMV Id
          </label>
          <input type="text" id="dl-dmv-id" name="dl-dmv-id" value={dmvId} disabled className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline" />
          <div className="">
            <div className="my-3">
              <input  
                required
                type="file"
                name="signedvc"
                className="input input-bordered focus:ring focus:outline-none"/>
            </div>
          </div>
        </main>
        <footer className="p-4">
          <button
            type="submit"
            className="btn btn-primary submit-button focus:ring focus:outline-none w-full">
            Verify
          </button>
        </footer>
        <div className="p-4 mt-4 bg-gray-100 rounded-lg shadow-md">
            <p className={verificationError ? 'text-red-500' : 'text-green-500'}>{verificationMessage}</p>
        </div>
      </div>
    </form>
  );
}