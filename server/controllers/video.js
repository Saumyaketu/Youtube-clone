import video from "../Modals/Video.js";

export const uploadVideo = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Please upload a valid video file" });
  }
  try {
    if (!req.user.channelName) {
      return res.status(400).json({ message: "Create a channel before uploading" });
    }

    const description = typeof req.body.description === "string"
      ? req.body.description.trim()
      : "";

    const file = new video({
      videotitle: req.body.videotitle,
      description,
      filename: req.file.originalname,
      filepath: req.file.path,
      filetype: req.file.mimetype,
      filesize: req.file.size || 0,
      videochannel: req.user.channelName,
      uploader: req.user._id.toString(),
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

export const updateVideo = async (req, res) => {
  const { id } = req.params;
  const { videotitle, description } = req.body;

  try {
    const existingVideo = await video.findOne({
      _id: id,
      uploader: req.user._id.toString(),
    });

    if (!existingVideo) {
      return res.status(403).json({ message: "Not authorized to edit this video" });
    }

    const updateFields = {};
    if (typeof videotitle === "string") {
      const trimmedTitle = videotitle.trim();
      if (trimmedTitle) {
        updateFields.videotitle = trimmedTitle;
      }
    }

    if (typeof description === "string") {
      updateFields.description = description.trim();
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No valid updates provided" });
    }

    const updatedVideo = await video.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true },
    );

    return res.status(200).json({ updatedVideo });
  } catch (error) {
    console.error("Update video error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
