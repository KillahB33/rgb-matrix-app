import React, { useState } from "react";
import ImageCropper from './ImageCropper';
import '../App.css';
import { atom, useAtom } from 'jotai'

const axios = require("axios");
export const configAtom = atom(
    // default crop config
    {
        width: 200,
        aspect: 2 / 1
    }); 

function UploadImage() {

    const [imageToCrop, setImageToCrop] = useState(undefined);
    const [cropConfig] = useAtom(configAtom);
    const [imageRef, setImageRef] = useState();
  
    const onChange = (event) => {
      if (event.target.files && event.target.files.length > 0) {
        const reader = new FileReader();
        console.log({ reader });
  
        reader.addEventListener("load", () => {
          const image = reader.result;
  
          setImageToCrop(image);
        });
  
        reader.readAsDataURL(event.target.files[0]);
        setImageRef(event.target.files[0]);
      }
    };

    const onFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('myImage', imageRef);
        formData.append('cropConfig', JSON.stringify(cropConfig));
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };
        axios.post("http://"+process.env.REACT_APP_HOSTIP+":3030/upload", formData, config)
            .then((response) => {
                alert("The file is successfully uploaded");
            }
            ).catch((error) => {
        });
        console.log("X is :"+ cropConfig.x);
    }

    return (
        <div>   
            <footer className="App-footer">
                <form>
                    <h3>File Upload</h3>
                    <input type="file" accept="image/*" name="myImage" onChange= {onChange} />
                    <button type="submit" onClick={onFormSubmit}>Upload</button>
                </form>
            </footer>
            <footer className='App-cropper'>
                <ImageCropper
                    imageToCrop={imageToCrop}
                />
            </footer>
        </div>
    )
    
}

export default UploadImage