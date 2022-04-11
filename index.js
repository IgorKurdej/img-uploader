const inputFile = document.querySelector(".imgUploader__input");
const imagesList = document.querySelector(".imgList__wrapper");

const validExtensions = ["image/jpg", "image/jpeg"];

// function converts b to mb
const covertToMb = size => {
  let sizeInMb = size / 1048576;
  return (Math.round(sizeInMb * 100) / 100).toFixed(2) + " MB";
};

// function creates new p tag which represent one detail row
const createNewDetailsRow = (item, value) => {
  let detailRow = document.createElement("p");
  detailRow.innerHTML = value;
  item.appendChild(detailRow);
};

// function creates thumbnail
const createThumbnail = (item, img) => {
  let reader = new FileReader();
  reader.onload = () => {
    let thumbnail = document.createElement("img");
    thumbnail.setAttribute("src", reader.result);
    thumbnail.setAttribute("class", "imageItem__thumbnail");
    item.appendChild(thumbnail);
  };
  reader.readAsDataURL(img);
};

// function creates button with remove item event
const createRemoveButton = item => {
  let btn = document.createElement("button");
  btn.setAttribute("class", "imageItem__removeBtn");
  btn.innerText = "x";
  btn.addEventListener("click", () => imagesList.removeChild(item));

  item.appendChild(btn);
};

// function return new element id incremented by one
const assingIndexNumber = () => {
  let lastChild = imagesList.lastChild;

  if (lastChild === null) {
    return 1;
  } else {
    return Number(lastChild.firstChild.innerHTML) + 1;
  }
};

// function creates new element with all childrens
const createNewImageItem = img => {
  let imgItem = document.createElement("div");
  imgItem.setAttribute("class", "imageItem__wrapper");

  const idx = assingIndexNumber();

  createNewDetailsRow(imgItem, idx);
  createNewDetailsRow(imgItem, img.name);
  createNewDetailsRow(imgItem, covertToMb(img.size));
  createNewDetailsRow(imgItem, img.lat);
  createNewDetailsRow(imgItem, img.lng);
  createThumbnail(imgItem, img);
  createRemoveButton(imgItem);

  return imgItem;
};

// function converts dd mm ss to decimal degrees
const convertToDecimalDegrees = (coords, ref) => {
  if (coords === undefined) return "";

  let coordinate = coords.reduce((sum, val, idx) => {
    return sum + val.numerator / val.denominator / Math.pow(60, idx);
  }, 0);

  return ref === "S" || ref === "W" ? -coordinate : coordinate;
};

// function assigns key latitude and longitude to file
const assignGpsCoordinateToImage = async img => {
  await new Promise(resolve =>
    EXIF.getData(img, function () {
      let lat = EXIF.getTag(this, "GPSLatitude");
      let ref = EXIF.getTag(this, "GPSLatitudeRef");
      lat = convertToDecimalDegrees(lat, ref);

      let lng = EXIF.getTag(this, "GPSLongitude");
      ref = EXIF.getTag(this, "GPSLongitudeRef");
      lng = convertToDecimalDegrees(lng, ref);

      img.lat = lat;
      img.lng = lng;

      resolve();
    })
  );
};

inputFile.addEventListener("change", e => {
  [...e.target.files].map(async img => {
    // checks if file has jpg or jpeg extension and size is smaller then 1 mb
    if (validExtensions.includes(img.type) && img.size < 1048576) {
      // assigns key latitude and longitude to img file
      await assignGpsCoordinateToImage(img);

      // creates new elemnt with image, file info and all funcionality
      const imgItem = createNewImageItem(img);

      // adds new element to html list
      imagesList.append(imgItem);
    } else {
      alert("Invalid file extension or is too big. Must be jpg, under 1 mb.");
    }
  });
});
