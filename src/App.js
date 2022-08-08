import './App.css';
import images from './components/imageList';
import UploadImage from './components/uploadImage';
const axios = require("axios");
const qs = require('qs');

function App() {

  const imageClick = (img) => {
    console.log('You clicked ' + img);
    var data = qs.stringify({
      'image': img
    });
    
    var config = {
        method: 'post',
        url: "http://"+process.env.REACT_APP_HOSTIP+":3030/setImage",
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
    };
    
    axios(config)
    .then((response) => {
        console.log(response);
        alert("RGBMatrix successfully updated");
    }).catch((error) => {
    });
  }
  
  const deleteImage = (img) => {
    console.log('You deleted ' + img);
    var data = qs.stringify({
      'image': img
    });

    var config = {
        method: 'post',
        url: "http://"+process.env.REACT_APP_HOSTIP+":3030/deleteImage",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
    };

    axios(config)
    .then((response) => {
        console.log(response);
        alert("Image successfully deleted");
    }).catch((error) => {
    });
  }

  const endStream = () => {
    console.log('You clicked end stream');
    var data = qs.stringify({
      'image': 'end'
    });

    var config = {
        method: 'post',
        url: "http://"+process.env.REACT_APP_HOSTIP+":3030/endStream",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
    };

    axios(config)
    .then((response) => {
        console.log(response);
        alert("Stream successfully ended");
    }).catch((error) => {
    });
  }


  return (
    <div className="App">
      <header className="App-header">
        RGB Matrix Image App
        <text className="stop-stream" onClick={() => endStream()}>&times;Stop Image Stream&times;</text>
      </header>
      <div className="grid">
      {images.map((img, index) => (
        <div className='photo-container'>
          <img className="photo" key={index} src={img} alt={img} onClick={() => imageClick(img)} />
          <button
            type="button"
            className="delete"
            data-dismiss="modal"
            aria-label="Close"
            onClick={() => deleteImage(img)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      ))}
      </div>
      <UploadImage />
    </div>
  );
}

export default App;