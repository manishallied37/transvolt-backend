import { mockImageUrls, mockVideoUrls } from "../data/mockData.js";

function pickRandomItems(array, count) {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

function pickRandomOne(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export const getEventMedia = async (req, res) => {
  try {
    const { eventId } = req.params;

    const vehicleNumber = req.query.vehicleNumber || "UNKNOWN";
    const driverName = req.query.driverName || "Mock Driver";
    const alertType = req.query.alertType || "Safety Event";
    const severity = req.query.severity || "HIGH";

    const selectedImages = pickRandomItems(mockImageUrls, 2);
    const selectedVideo = pickRandomOne(mockVideoUrls);

    const response = {
      event: {
        id: Number(eventId),
        title: alertType,
        eventType: alertType,
        severity,
        vehicleId: vehicleNumber,
        driverName,
        depot: "",
        status: "OPEN",
        timestamp: new Date().toISOString(),
        location: "",
        thumbnailUrl: selectedImages[0] ?? null,
        description: `${alertType} event for ${vehicleNumber}`,
        netradyneAlertId: Number(eventId),
      },
      images: selectedImages.map((url, index) => ({
        id: index + 1,
        type: "image",
        title: `${vehicleNumber}_image_${index + 1}.jpg`,
        url,
        thumbnailUrl: url,
        mimeType: "image/jpeg",
        source: "mock-random-web",
      })),
      videos: [
        {
          id: 1,
          type: "video",
          title: `${vehicleNumber}_video_1.mp4`,
          url: selectedVideo,
          thumbnailUrl: selectedImages[0] ?? null,
          mimeType: "video/mp4",
          source: "mock-random-web",
        },
      ],
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("getEventMedia error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
