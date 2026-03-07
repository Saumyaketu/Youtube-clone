import video from "../Modals/Video.js";

export const uploadVideo = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Please upload a valid video file" });
  }
  try {
    const file = new video({
      videotitle: req.body.videotitle,
      filename: req.file.originalname,
      filepath: req.file.path,
      filetype: req.file.mimetype,
      filesize: req.file.size || 0,
      videochannel: req.body.videochannel,
      uploader: req.body.uploader,
      duration: req.body.duration || 0,
    });

    await file.save();

    return res.status(201).json("File uploaded successfully to Cloudinary");
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Something went wrong during upload" });
  }
};

export const getAllVideo = async (req, res) => {
  try {
    const files = await video.find();
    return res.status(200).send(files);
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUserVideos = async (req, res) => {
  try {
    const { videochannel } = req.params;
    const files = await video.find({ videochannel: videochannel });
    return res.status(200).send(files);
  } catch (error) {
    console.error("Fetch user videos error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
