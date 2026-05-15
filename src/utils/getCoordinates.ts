import axios from "axios";

export const getCoordinates = async (address: string) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: address,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "your-app-name",
        },
      }
    );

    const data = response.data;

    //  IMPORTANT: API returns an ARRAY
    if (!data || data.length === 0) {
      throw new Error("No coordinates found");
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (error: any) {
    console.error("Geocoding API error:", error.message);
    throw new Error("Geocoding failed");
  }
};