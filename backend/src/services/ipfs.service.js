import { create } from "ipfs-http-client";

const client = create({
  host: "127.0.0.1",
  port: 5001,
  protocol: "http"
});

export async function uploadJSONToIPFS(jsonData) {
  const buffer = Buffer.from(JSON.stringify(jsonData));

  const result = await client.add(buffer);

  return result.path; // this is the CID
}

// Upload binary file (e.g., images) to IPFS
export async function uploadFileToIPFS(fileBuffer, filename) {
  const result = await client.add({
    path: filename,
    content: fileBuffer
  });

  console.log('IPFS upload result for', filename, ':', result);
  // Return the CID - try both result.cid and result.path
  return result.cid ? result.cid.toString() : result.path;
}
