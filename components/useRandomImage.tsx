import { useState, useEffect } from "react";

const useRandomImage = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchImage = async () => {
    console.log("Fetching!");

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://picsum.photos/200/300`);

      if (!response.ok) {
        throw new Error("Failed to fetch the random image.");
      }

      console.log("data:", response);
      setImageSrc(response.url)

      // setImageSrc(data.urls.small);
    } catch (error: any) {
      setError(error);
      console.log("Error:", error);
    } finally {
      setLoading(false);
      console.log("Loading:");
    }
  };

  return { fetchImage, imageSrc, loading, error };
};

export default useRandomImage;
