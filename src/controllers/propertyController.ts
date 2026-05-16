import cloudinary from "../config/cloudinary";
import Property from "../models/Property";
import { getCoordinates } from "../utils/getCoordinates";
import type { AuthRequest } from "../middleware/authMiddleware";

export const createProperty = async (req: any, res: any) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // 1. Upload images to Cloudinary
    const uploadResults = await Promise.all(
      files.map((file: any) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "properties" }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            })
            .end(file.buffer);
        });
      }),
    );

    const imageUrls = uploadResults.map((r: any) => r.secure_url);

    // 2. Prepare property data (NO coordinates yet)
    const propertyData = {
      ...req.body,
      price: Number(req.body.price),
      beds: Number(req.body.beds),
      baths: Number(req.body.baths),
      area: Number(req.body.area),
      parking: Number(req.body.parking),

      features: req.body.features ? JSON.parse(req.body.features) : [],

      images: imageUrls,
      coordinates: null, //  temporarily null
    };

    // 3. Save property FIRST (fast response)
    const property = await Property.create(propertyData);

    // 4.  Background geocoding (NON-BLOCKING)
    const fullAddress = `${req.body.location}, ${req.body.state}, Nigeria`;

    getCoordinates(fullAddress)
      .then(async (coords) => {
        await Property.findByIdAndUpdate(property._id, {
          coordinates: coords,
        });

        console.log("Coordinates updated in background");
      })
      .catch((err) => {
        console.warn("Background geocoding failed:", err.message);
      });

    // 5. Respond immediately
    return res.status(201).json({
      message: "Property created successfully",
      property,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message: "could not create property",
      error: err.message,
    });
  }
};

export const getProperties = async (req: any, res: any) => {
  try {
    const { search, type, status } = req.query;

    let filter: any = {};

    //  Search (title OR location)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // 🏷 Property type
    if (type && type !== "all") {
      filter.category = type;
    }

    //  Status
    if (status && status !== "all") {
      filter.status = status;
    }

    const properties = await Property.find(filter).sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching properties" });
  }
};

export const getPropertyById = async (req: any, res: any) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePropertyStatus = async (req: AuthRequest, res: any) => {
  try {
    const { status } = req.body;

    if (!status || !["active", "unlisted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({
      message: "Property status updated",
      property,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update property status" });
  }
};

function getPublicIdFromUrl(url: string): string {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return "";
    let path = parts[1];
    path = path.replace(/^v\d+\//, "");
    path = path.replace(/\.[^.]+$/, "");
    return path;
  } catch {
    return "";
  }
}

export const updatePropertyImages = async (req: AuthRequest, res: any) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    const removedImages: string[] = req.body.removedImages
      ? JSON.parse(req.body.removedImages)
      : [];

    const keepImages: string[] = req.body.keepImages
      ? JSON.parse(req.body.keepImages)
      : [...property.images];

    // Delete removed images from Cloudinary
    if (removedImages.length > 0) {
      await Promise.allSettled(
        removedImages.map((url) => {
          const publicId = getPublicIdFromUrl(url);
          return publicId ? cloudinary.uploader.destroy(publicId) : Promise.resolve();
        })
      );
    }

    // Upload new images
    const files = req.files as Express.Multer.File[];
    let newImageUrls: string[] = [];
    if (files && files.length > 0) {
      newImageUrls = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              cloudinary.uploader
                .upload_stream({ folder: "properties" }, (error, result) => {
                  if (error) reject(error);
                  else resolve((result as any).secure_url);
                })
                .end(file.buffer);
            })
        )
      );
    }

    const updatedImages = [...keepImages, ...newImageUrls];
    if (updatedImages.length === 0) {
      return res.status(400).json({ message: "Property must have at least one image" });
    }

    property.images = updatedImages;
    await property.save();

    res.json({ message: "Images updated", property });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update images" });
  }
};

export const updateProperty = async (req: AuthRequest, res: any) => {
  try {
    const body = req.body as Record<string, unknown>;
    const allowedKeys = [
      "title",
      "description",
      "location",
      "state",
      "price",
      "category",
      "beds",
      "baths",
      "area",
      "parking",
      "features",
      "contactPhone",
      "contactEmail",
    ];

    const updates: Record<string, unknown> = {};

    for (const key of allowedKeys) {
      if (body[key] !== undefined && body[key] !== null) {
        updates[key] = body[key];
      }
    }

    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
    }
    if (updates.beds !== undefined) {
      updates.beds = Number(updates.beds);
    }
    if (updates.baths !== undefined) {
      updates.baths = Number(updates.baths);
    }
    if (updates.parking !== undefined) {
      updates.parking = Number(updates.parking);
    }

    if (typeof updates.features === "string") {
      try {
        updates.features = JSON.parse(updates.features as string);
      } catch {
        return res.status(400).json({ message: "Invalid features format" });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const property = await Property.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({
      message: "Property updated",
      property,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update property" });
  }
};
