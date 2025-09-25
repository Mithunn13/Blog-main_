// server/configs/imageKit.js
import dotenv from "dotenv";
dotenv.config();   // load .env here

import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export default imagekit;

console.log("PUBLIC_KEY:", process.env.IMAGEKIT_PUBLIC_KEY);
