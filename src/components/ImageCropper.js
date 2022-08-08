import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import demoImage from "./demo-image.jpg";
import "./ImageCropper.css";
import { useAtom } from 'jotai';
import { configAtom } from './uploadImage';

function ImageCropper(props) {

  const { imageToCrop, onImageCropped } = props;

  const [cropConfig, setCropConfig] = useAtom(configAtom); 

  const [imageRef, setImageRef] = useState();

  // don't need cropped image sample, just the crop config
  // eslint-disable-next-line
  async function cropImage(crop) {
    if (imageRef && crop.width && crop.height) {
      const croppedImage = await getCroppedImage(
        imageRef,
        crop,
        "croppedImage.jpeg" // destination filename
      );

      // calling the props function to expose
      // croppedImage to the parent component
      onImageCropped(croppedImage);
    }
  }

  function getCroppedImage(sourceImage, cropConfig, fileName) {
    // creating the cropped image from the source image
    const canvas = document.createElement("canvas");
    const scaleX = sourceImage.naturalWidth / sourceImage.width;
    const scaleY = sourceImage.naturalHeight / sourceImage.height;
    canvas.width = cropConfig.width;
    canvas.height = cropConfig.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      sourceImage,
      cropConfig.x * scaleX,
      cropConfig.y * scaleY,
      cropConfig.width * scaleX,
      cropConfig.height * scaleY,
      0,
      0,
      cropConfig.width,
      cropConfig.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        // returning an error
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }

        blob.name = fileName;
        // creating a Object URL representing the Blob object given
        const croppedImageUrl = window.URL.createObjectURL(blob);

        resolve(croppedImageUrl);
      }, "image/gif");
    });
  }

  return (
    <div>
        <div className="wrapper">
            <span className="coords">X: {cropConfig.x}</span>
            <span className="coords">Y: {cropConfig.y}</span>
            <span className="coords">W: {cropConfig.width}</span>
            <span className="coords">H: {cropConfig.height}</span>
        </div>
        <ReactCrop
            src={imageToCrop || demoImage}
            crop={cropConfig}
            onImageLoaded={(imageRef) => setImageRef(imageRef)}
            //onComplete={(cropConfig) => cropImage(cropConfig)} // don't need sample displayed
            onChange={(cropConfig) => setCropConfig(cropConfig)}
            crossorigin="anonymous" // to avoid CORS-related problems
        />
    </div>
  );
}

ImageCropper.defaultProps = {
  onImageCropped: () => {}
};

export default ImageCropper;