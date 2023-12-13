import jwsheader from './jwsheader.json';
import { useState } from "react";
const ethers = require("ethers");

const signMessage = async ({ message }) => {
    try {
        if (!window.ethereum) {
            throw new Error("Metamask cannot be found");
        }
        await window.ethereum.send("eth_requestAccounts");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signature = await signer.signMessage(message);
        const address = await signer.getAddress();
        
        return {
            message,
            signature,
            address
        };
    }
    catch(err) {
        Error("Caught error");
    }
};

const jwsGen = ({ content, signature }) => {
  const header = JSON.stringify(jwsheader);
  const jws = [btoa(header), btoa(content), btoa(signature)].join('.');
  return jws;
}

const getWalletAddress = async () => {
  await window.ethereum.send("eth_requestAccounts");
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return await signer.getAddress();
}

export default function SignMessage() {
    const [signatureMessage, setSignatureMessage] = useState('');
    const [signatureError, setSignatureError] = useState(false);
    
    // Credential data
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [id, setId] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [sex, setSex] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [eyeColour, setEyeColour] = useState('');
    const [hairColour, setHairColour] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');

    const clearForm = () => {
      setLastName('');
      setFirstName('');
      setId('');
      setBirthDate('');
      setSex('');
      setHeight('');
      setWeight('');
      setEyeColour('');
      setHairColour('');
      setAddress('');
      setCity('');
      setPostalCode('');
    }

    const populateForm = () => {
      setLastName('Montfort');
      setFirstName('Thomas');
      setId('0xEab4bfaa3A75Decc57E953adA53E7e68c98D9ca3');
      setBirthDate('1999-01-31');
      setSex('M');
      setHeight('64');
      setWeight('190');
      setEyeColour('Blue');
      setHairColour('Brown');
      setAddress('100 University Ave');
      setCity('Syracuse');
      setPostalCode('13210');
    }

    const createCredential = async (e) => {
      e.preventDefault();

      const walletAddress = await getWalletAddress();
      const res = await fetch('dl_example.json');
      const json = await res.json();
      const issuanceDate = new Date(Date.now()).toISOString();
      const expiryDate = new Date(Date.now() + (5*365*24*60*60*1000)).toISOString();
      const documentNumber = Math.floor(Math.random() * (1_000_000_001)).toString(10);

      json['issuer']['id'] = walletAddress;
      json['credentialSubject']['id'] = id;
      json['credentialSubject']['driversLicense']['document_number'] = documentNumber;
      json['credentialSubject']['driversLicense']['birth_date'] = birthDate;
      json['credentialSubject']['driversLicense']['driving_privileges'][0]['expiry_date'] = expiryDate;
      json['credentialSubject']['driversLicense']['driving_privileges'][0]['issue_date'] = issuanceDate;
      json['credentialSubject']['driversLicense']['expiry_date'] = expiryDate;
      json['credentialSubject']['driversLicense']['eye_colour'] = eyeColour;
      json['credentialSubject']['driversLicense']['family_name'] = lastName;
      json['credentialSubject']['driversLicense']['given_name'] = firstName;
      json['credentialSubject']['driversLicense']['hair_colour'] = hairColour;
      json['credentialSubject']['driversLicense']['height'] = height;
      json['credentialSubject']['driversLicense']['issue_date'] = issuanceDate;
      json['credentialSubject']['driversLicense']['resident_address'] = address;
      json['credentialSubject']['driversLicense']['resident_city'] = city;
      json['credentialSubject']['driversLicense']['resident_postal_code'] = postalCode;
      json['credentialSubject']['driversLicense']['sex'] = sex;
      json['credentialSubject']['driversLicense']['weight'] = weight;
      json['expirationDate'] = expiryDate;
      json['issuanceDate'] = issuanceDate;

      const jsonData = JSON.stringify(json, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${lastName}-${firstName}-drivers-license-${documentNumber}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      clearForm();
    }


    const signCredential = async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById("fileInput");
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = async (e) => {
          const json = JSON.parse(e.target.result);
          const lastName = json['credentialSubject']['driversLicense']['family_name'];
          const firstName = json['credentialSubject']['driversLicense']['given_name'];
          const documentNumber = json['credentialSubject']['driversLicense']['document_number'];

          const walletAddress = await getWalletAddress();

          const message = JSON.stringify(json, 0);
          const sig = await signMessage({ message });
          if (sig) {
            const signedMessage = {
              ...JSON.parse(message),
              proof: {
                type: "EcdsaSecp256k1RecoverySignature2020",
                created: Math.floor(new Date().getTime() / 1000),
                proofPurpose: "assertionMethod",
                verificationMethod: sig.address,
                jws: jwsGen({content: message, signature: sig.signature}),
              },
            };
            const signedMessageJSON = JSON.stringify(signedMessage, null, 2); 
            const blob = new Blob([signedMessageJSON], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${lastName}-${firstName}-drivers-license-${documentNumber}-signed.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link)
            setSignatureMessage(`Drivers license issued by ${walletAddress} to ${firstName} ${lastName}!`);
            setSignatureError(false);
          }
        }
    };

    return (
      <div className='container mt-5'>
        <h1 className='text-3xl font-bold text-blue-500 text-center'>
          Issue Drivers License Credential
        </h1>
        <div className="relative inline-block w-full text-gray-700">    
        </div>
          <button
              onClick={populateForm}
              className="py-4 px-8 bg-blue-500 text-white rounded-lg">
              Populate Form
          </button>
          <button
              onClick={clearForm}
              className="py-4 px-8 bg-gray-500 text-white rounded-lg ml-5">
              Clear Form
          </button>
          <div className="rounded overflow-hidden shadow-lg p-10 mt-5">
            <h1 className='text-xl font-bold text-black-500 mb-8'>Create Drivers License Credential Form</h1>
            <form onSubmit={createCredential}>
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/2 pr-5">
                  <label htmlFor="dl-first-name" className="block text-gray-500">
                    Last Name
                  </label>
                  <input type="text" id="dl-first-name" name="dl-first-name" value={lastName} onChange={(e)=>setLastName(e.target.value)} className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline" />
                </div>
                <div className="w-full md:w-1/2">
                  <label htmlFor="dl-last-name" className="block text-gray-500">
                    First Name
                  </label>
                  <input type="text" id="dl-last-name" name="dl-last-name" value={firstName} onChange={(e)=>setFirstName(e.target.value)} className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline" />
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/2 pr-5">
                  <label htmlFor="dl-id" className="block text-gray-500 mt-4">
                    Id
                  </label>
                  <input type="text" id="dl-id" name="dl-id" value={id} onChange={(e)=>setId(e.target.value)} className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline" />
                </div>
                <div className="w-full md:w-1/2">
                  <label htmlFor="dl-birth-date" className="block text-gray-500 mt-4">
                    Birth Date
                  </label>
                  <input type="date" id="dl-birth-date" name="dl-birth-date" value={birthDate} onChange={(e)=>setBirthDate(e.target.value)} className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline" />
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/2 pr-5">
                  <label htmlFor="dl-sex" className="block text-gray-500 mt-4">
                    Sex
                  </label>
                  <select name="dl-sex" id="dl-sex" value={sex} onChange={(e)=>setSex(e.target.value)}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div className="w-full md:w-1/2">
                  <label htmlFor="dl-height" className="block text-gray-500 mt-4">
                    Height (inches)
                  </label>
                  <input type="number" id="dl-height" name="dl-height" value={height} onChange={(e)=>setHeight(e.target.value)} className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline" />
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/2 pr-5">
                  <label htmlFor="dl-weight" className="block text-gray-500 mt-4">
                    Weight (pounds)
                  </label>
                  <input type="number" id="dl-weight" name="dl-weight" value={weight} onChange={(e)=>setWeight(e.target.value)} className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline" />
                </div>
                <div className="w-full md:w-1/2">
                  <label htmlFor="dl-eye-colour" className="block text-gray-500 mt-4">
                    Eye colour
                  </label>
                  <select name="dl-eye-colour" id="dl-eye-colour" value={eyeColour} onChange={(e)=>setEyeColour(e.target.value)}>
                    <option value="Black">Black</option>
                    <option value="Brown">Brown</option>
                    <option value="Hazel">Hazel</option>
                    <option value="Gray">Gray</option>
                    <option value="Blue">Blue</option>
                    <option value="Green">Green</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/2 pr-5">
                  <label htmlFor="dl-hair-colour" className="block text-gray-500 mt-4">
                    Hair colour
                  </label>
                  <select name="dl-hair-colour" id="dl-hair-colour" value={hairColour} onChange={(e)=>setHairColour(e.target.value)}>
                    <option value="Brown">Brown</option>
                    <option value="Blonde">Blonde</option>
                    <option value="Black">Black</option>
                    <option value="Red">Red</option>
                    <option value="Gray">Gray</option>
                  </select>
                  </div>
                <div className="w-full md:w-1/2">
                  <label htmlFor="dl-address" className="block text-gray-500 mt-4">
                    Address
                  </label>
                  <input type="text" id="dl-address" name="dl-address" value={address} onChange={(e)=>setAddress(e.target.value)} className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline" />
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-full md:w-1/2 pr-5">
                  <label htmlFor="dl-city" className="block text-gray-500 mt-4">
                    City
                  </label>
                  <input type="text" id="dl-city" name="dl-city" value={city} onChange={(e)=>setCity(e.target.value)} className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline" />
                  </div>
                <div className="w-full md:w-1/2">
                  <label htmlFor="dl-postal-code" className="block text-gray-500 mt-4">
                    Postal Code
                  </label>
                  <input type="text" id="dl-postal-code" name="dl-postal-code" value={postalCode} onChange={(e)=>setPostalCode(e.target.value)} className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline" />
                </div>
              </div>
              <button className="py-4 px-8 bg-blue-500 text-white rounded-lg mt-4" type="submit">
                Generate JSON
              </button>
            </form>
          </div>
        <form className="mt-5" onSubmit={signCredential}>  
          <div className="credit-card w-full shadow-lg rounded-xl bg-white mb-8">
            <main className="mt-4 p-10">
              <h1 className="text-xl font-semibold text-gray-700">
                Sign Drivers License Credential
              </h1>
              <div className="">
                <div className="my-3">
                  <label htmlFor="fileInput" className="text-m font-semibold text-gray-700">
                    Select a JSON file to sign
                  </label>
                  <input
                    required
                    type="file"
                    id="fileInput"
                    accept=".json"
                    className="w-full h-10"
                  />
                </div>
              </div>
            </main>
            <footer className="p-4">
              <button
                type="submit"
                className="btn btn-primary submit-button focus:ring focus:outline-none w-full">
                Sign
              </button>
            </footer>
            <div className="p-2">
              <div className="my-3">
                <p className={(signatureError?'text-red-500':'text-green-500')+' text-center'}>{signatureMessage}</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }