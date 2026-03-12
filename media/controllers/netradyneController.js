const IMAGE_URLS = [
  "https://images.pexels.com/photos/29008437/pexels-photo-29008437.jpeg",
  "https://images.pexels.com/photos/1903939/pexels-photo-1903939.jpeg",
  "https://images.pexels.com/photos/2372739/pexels-photo-2372739.jpeg",
  "https://images.pexels.com/photos/258447/pexels-photo-258447.jpeg",
  "https://images.pexels.com/photos/826809/pexels-photo-826809.jpeg",
  "https://images.pexels.com/photos/3068900/pexels-photo-3068900.jpeg",
  "https://images.pexels.com/photos/4055159/pexels-photo-4055159.jpeg",
  "https://images.pexels.com/photos/2048224/pexels-photo-2048224.jpeg",
  "https://images.pexels.com/photos/1013516/pexels-photo-1013516.jpeg",
  "https://media.istockphoto.com/id/942740004/photo/rush-hour-traffic-jam-in-delhi-india.jpg?s=1024x1024&w=is&k=20&c=V-cPfF_WRwmvuNL6zi7Gt9xr9G6HNZs1aeICcysWCXo=",
  "https://media.istockphoto.com/id/650369150/photo/traffic-jam-collapse-cars-on-highway.jpg?s=612x612&w=0&k=20&c=fY2l7pt-Aedj0jluErPhC6K1yApas-CYqOPZFLgZhqw=",
  "https://media.istockphoto.com/id/960122382/photo/cars-on-urban-street-in-traffic-jam.jpg?s=612x612&w=0&k=20&c=0gxUByhdRM4izpJn5339vEEHzLgeBLYkan3QmcBT3S0=",
];

const VIDEO_URLS = [
  "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",
  "https://assets.mixkit.co/videos/47109/47109-720.mp4",
  "https://assets.mixkit.co/videos/42367/42367-720.mp4",
  "https://media.istockphoto.com/id/2159760544/video/highway-in-heavy-rain-traffic-driving-on-the-highway-with-windshield-wipers-running.mp4?s=mp4-640x640-is&k=20&c=kG2UE15v2OBrZl-rH1F8K1IbacmNuDkhsARnO7TO6HA=",
  "https://video-previews.elements.envatousercontent.com/h264-video-previews/9db3a2cc-656c-4613-8250-e9ef297574aa/13856258.mp4",
  "https://assets.mixkit.co/videos/44651/44651-720.mp4",
  "https://assets.mixkit.co/videos/48489/48489-720.mp4",
  "https://assets.mixkit.co/videos/42030/42030-720.mp4",
  "https://assets.mixkit.co/videos/9678/9678-720.mp4",
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickMultiple(list, count) {
  if (count <= 0) return [];

  const shuffled = shuffle(list);
  const selected = [];

  for (let i = 0; i < count; i += 1) {
    selected.push(shuffled[i % shuffled.length]);
  }

  return selected;
}

export const getPreviewImages = (req, res) => {
  const {
    startTime,
    vehicleNumber = "UNKNOWN-VEHICLE",
    vin = "UNKNOWN-VIN",
    licensePlateNumber = "MH12AB1234",
    latitude = 19.076,
    longitude = 72.8777,
  } = req.query;

  const imageCount = randomInt(1, 5);
  const baseTimestamp = Number(startTime) || Date.now();

  const images = pickMultiple(IMAGE_URLS, imageCount).map((url, index) => ({
    fileName: `${vehicleNumber}_image_${index + 1}.jpg`,
    imageUrl: url,
    timestamp: baseTimestamp + index * 1000,
    latitude: Number(latitude) + index * 0.0005,
    longitude: Number(longitude) + index * 0.0005,
  }));

  res.json({
    data: {
      images,
      vehicle: {
        vin,
        vehicleNumber,
        licensePlateNumber,
      },
    },
  });
};

export const getVideoPlayUrl = (req, res) => {
  const { videoIds } = req.params;
  const validityDuration = req.query.validityDuration || 3600;

  const requestedIds = videoIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const availableIds = requestedIds.length > 0 ? requestedIds : ["1"];
  const maxVideoCount = Math.min(10, availableIds.length);
  const videoCount = maxVideoCount === 0 ? 0 : randomInt(0, maxVideoCount);
  const selectedIds = shuffle(availableIds).slice(0, videoCount);

  const urls = selectedIds.map((id) => ({
    videoId: Number(id),
    validity: validityDuration,
    url: pickRandom(VIDEO_URLS),
  }));

  console.log(urls);

  res.json({
    data: {
      urls,
    },
  });
};
