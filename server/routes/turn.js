import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `https://${process.env.METERED_DOMAIN}/api/v1/turn/credentials?apiKey=${process.env.METERED_SECRET_KEY}`,
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching TURN credentials:", error);
    res
      .status(500)
      .json({ message: "Failed to generate secure WebRTC credentials" });
  }
});

export default router;
