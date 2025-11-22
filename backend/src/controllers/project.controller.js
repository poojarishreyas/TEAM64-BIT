import { uploadJSONToIPFS, uploadFileToIPFS } from '../services/ipfs.service.js';
import { registerProjectOnChain, getContractAddress } from '../services/blockchain.service.js';

export const registerProject = async (req, res) => {
  try {
    const {
      projectID,
      projectName,
      state,
      district,
      block,
      village,
      geojson,
      areaInHectares,
      officerName
    } = req.body;

    if (!projectID) return res.status(400).json({ error: 'projectID required' });

    const registrationData = {
      projectID,
      projectName,
      location: { state, district, block, village },
      geoBoundary: geojson || null,
      areaInHectares: areaInHectares || null,
      officerName,
      verificationDate: new Date().toISOString()
    };

    // 1) Upload to IPFS (NFT.Storage)
    const cid = await uploadJSONToIPFS(registrationData);

    // 2) Register on chain
    const txHash = await registerProjectOnChain(projectID, cid);

    return res.json({ success: true, cid, txHash, contract: getContractAddress() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};


export const uploadGeoJSON = async (req, res) => {
  try {
    const { geojson, type } = req.body;

    if (!geojson) {
      return res.status(400).json({ success: false, error: "GeoJSON missing" });
    }

    const label = type === 'grid' ? 'GRID' : type === 'polygon' ? 'POLYGON' : 'GeoJSON';

    // Log the received GeoJSON to terminal
    console.log(`\n========== ${label} Received ==========`);
    console.log(JSON.stringify(geojson, null, 2));
    console.log('======================================\n');

    // Upload to IPFS
    const cid = await uploadJSONToIPFS(geojson);

    console.log(`✓ ${label} uploaded to IPFS with CID: ${cid}\n`);

    return res.json({ success: true, cid });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Upload multiple photos to IPFS
export const uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "No photos provided" });
    }

    console.log(`\n========== Uploading ${req.files.length} Photo(s) to IPFS ==========`);

    const photoCIDs = [];

    for (const file of req.files) {
      const cid = await uploadFileToIPFS(file.buffer, file.originalname);
      photoCIDs.push({
        filename: file.originalname,
        cid: cid,
        size: file.size
      });
      console.log(`✓ ${file.originalname} uploaded to IPFS: ${cid}`);
    }

    console.log('======================================\n');

    return res.json({ success: true, photos: photoCIDs });
  } catch (err) {
    console.error('Photo upload error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
