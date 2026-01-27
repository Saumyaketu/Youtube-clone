import video from "../Modals/Video.js";

export const uploadVideo = async (req, res) => {
  if (req.file === undefined) {
    return res
      .status(404)
      .json({ message: "Please upload a mp4 video file only" });
  } else {
    try {
      const file = new video({
        videotitle: req.body.videotitle,
        filename: req.file.originalname,
        filepath: req.file.path,
        filetype: req.file.mimetype,
        filesize: req.file.size,
        videochannel: req.body.videochannel,
        uploader: req.body.uploader,
      });

      await file.save();

      return res.status(201).json("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
};
