import { generateAlert as createAlert } from "./generateAlert.cjs";

export const generateAlert = async (count, type, overrides) => {
    try {
      // const { count = 1, type, overrides = {} } = req.body || {};
 
      const n = Number(count);
      if (!Number.isInteger(n) || n < 1 || n > 1000) {
        return res.status(400).json({
          error: "Invalid 'count'. Must be an integer between 1 and 1000.",
        });
      }
 
      const baseOverrides = { ...overrides };
      if (type) {
        baseOverrides.alertType = type;
      }
 
      const items = Array.from({ length: n }, () => createAlert(baseOverrides));
 
      // OPTIONAL: ensure unique-ish ids if you're bulk-inserting
      // items.forEach((item, i) => { item.id = Number(`${item.id}${i}`); });
 
      return ({
        count: n,
        data: items,
      });
    } catch (err) {
      console.error("Error generating bulk alert payloads:", err);
      return res.status(500).json({ error: "Failed to generate alert payloads" });
    }
};