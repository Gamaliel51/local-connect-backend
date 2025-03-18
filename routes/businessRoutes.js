const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Business = require('../models/Business')
const Product = require("../models/Product");
const Order = require("../models/Order");
const { verifyBusinessToken } = require("../middleware/middleware");
const settings = require("../config/settings");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Utility function to calculate distance using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth’s radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Business Signup
router.post("/signup", upload.single("profileImage"), async (req, res) => {
    try {
        const { email, name, password, about, address, location, category, tags } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        let profileImageUrl;

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "business_profiles" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });
        profileImageUrl = result.secure_url;
        console.log("URL: ", profileImageUrl , req.body)

        const business = await Business.create({
            email,
            name,
            password: hashedPassword,
            about,
            address,
            location: JSON.parse(location),
            category,
            active: true,
            tags: JSON.parse(tags),
            profileImageUrl,
        });

        res.status(201).json({ message: "Business registered successfully", business });
    } catch (error) {
        console.log("ERROR: ", error)
        res.status(500).json({ error: error.message });
    }
});

// Business Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const business = await Business.findOne({ where: { email } });
        if (!business) return res.status(400).json({ error: "Business not found" });

        const isMatch = await bcrypt.compare(password, business.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ businessId: business.email }, settings.accesskey, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Business Profile
router.put("/update-profile", verifyBusinessToken, upload.single("profileImage"), async (req, res) => {
  try {
      const { name, about, address, category, tags, location } = req.body;
      let profileImageUrl;
      
      const business = await Business.findOne({ where: { email: req.business.businessId } });
      if (!business) return res.status(404).json({ error: "Business not found" });

      if (req.file) {
          if (business.profileImageUrl) {
              const publicId = business.profileImageUrl.split("/").pop().split(".")[0];
              await cloudinary.uploader.destroy(publicId);
          }
          
          const result = await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                  { folder: "business_profiles" },
                  (error, result) => {
                      if (error) reject(error);
                      else resolve(result);
                  }
              );
              stream.end(req.file.buffer);
          });
          profileImageUrl = result.secure_url;
      }

      await Business.update(
          { name, about, address, category, tags: JSON.parse(tags), profileImageUrl, location: JSON.parse(location) },
          { where: { email: req.business.businessId } }
      );

      res.json({ message: "Business updated successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Fetch Business Profile (for customers)
router.get("/:email", async (req, res) => {
  try {
      const business = await Business.findOne(
        { where: { email: req.params.email },
          attributes: ['email', 'name', 'about', 'address', 'location', 'category', 'profileImageUrl', 'active', 'tags']
      });
      if (!business) return res.status(404).json({ error: "Business not found" });

      res.json({ business });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Route to fetch 20 nearby businesses based on user's coordinates
router.post("/fetch-nearby", async (req, res) => {
    try {
      const { location } = req.body; // expecting [longitude, latitude]
      if (!location || !Array.isArray(location) || location.length !== 2) {
        return res
          .status(400)
          .json({ error: "Invalid location coordinates" });
      }
      const [userLon, userLat] = location;
      
      // Fetch all active businesses
      const businesses = await Business.findAll({ where: { active: true } });
      
      // Compute distance for each business that has a valid location
      const businessesWithDistance = businesses.map((business) => {
        if (business.location && business.location.length === 2) {
          const [busLon, busLat] = business.location;
          const distance = calculateDistance(userLat, userLon, busLat, busLon);
          return { business, distance };
        }
        return { business, distance: Infinity };
      });
      
      // Sort businesses by distance (closest first)
      businessesWithDistance.sort((a, b) => a.distance - b.distance);
      
      // Return the top 20 closest businesses
      const nearbyBusinesses = businessesWithDistance
        .slice(0, 20)
        .map((item) => item.business);
      
      res.json({ businesses: nearbyBusinesses });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
  
// Route to fetch businesses by category sorted by proximity along with their products
router.post("/fetch-by-category", async (req, res) => {
    try {
      const { category, location } = req.body;
      if (
        !category ||
        !location ||
        !Array.isArray(location) ||
        location.length !== 2
      ) {
        return res
          .status(400)
          .json({ error: "Invalid category or location." });
      }
      const [userLon, userLat] = location;
      // Fetch businesses with matching category and active flag true
      const businesses = await Business.findAll({
        where: { category, active: true },
      });
      // Calculate distance for each business
      const businessesWithDistance = businesses.map((business) => {
        if (
          business.location &&
          Array.isArray(business.location) &&
          business.location.length === 2
        ) {
          const [busLon, busLat] = business.location;
          const distance = calculateDistance(userLat, userLon, busLat, busLon);
          return { business, distance };
        }
        return { business, distance: Infinity };
      });
      // Sort businesses by distance (closest first)
      businessesWithDistance.sort((a, b) => a.distance - b.distance);
      // For each sorted business, fetch its products from the Product model
      const sortedBusinessesWithProducts = await Promise.all(
        businessesWithDistance.map(async ({ business, distance }) => {
          const products = await Product.findAll({
            where: { business_owned: business.email },
          });
          // Return a plain object with business data, attached products and distance
          return { ...business.toJSON(), products, distance };
        })
      );
      res.json({ businesses: sortedBusinessesWithProducts });
    } catch (error) {
      console.log("ERROR: ", error);
      res.status(500).json({ error: error.message });
    }
});
  
  
  

module.exports = router;
