const axios = require("axios");
const qs = require('qs');

const SetImage=(img)=>{
    //const formData = new FormData();
    //formData.append('image', img);
    var data = qs.stringify({
        'image': img
    });
    
    var config = {
        method: 'post',
        url: 'http://'+process.env.REACT_APP_HOSTIP+':3030/setImage',
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

export default SetImage