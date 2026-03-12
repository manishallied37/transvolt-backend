import express from "express";
import auth from "../middleware/auth.js";
import {
  getPreviewImages,
  getVideoPlayUrl,
} from "../controllers/netradyneController.js";

const router = express.Router();

router.get(
  "/v1/tenants/:tenantUniqueName/event/preview/images",
  auth,
  getPreviewImages,
);

router.get(
  "/v1/tenants/:tenantUniqueName/videoplayurl/:videoIds",
  auth,
  getVideoPlayUrl,
);

export default router;
