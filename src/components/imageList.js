function getImagePaths(directory) {
    directory.keys().map((item, index) => images.push(item.replace("./", "images/")));
    return images;
}

let images = [];
const directory = require.context("../../public/images/", true, /\.(png|jpe?g|svg|gif)$/);
getImagePaths(directory);

export default images;