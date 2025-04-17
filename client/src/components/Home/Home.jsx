import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Image, X, Loader } from "lucide-react";
import cookies from "universal-cookie";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let objectUrl;
    if (file) {
      objectUrl = URL.createObjectURL(file);
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type.startsWith("image/")) {
      setFile(uploadedFile);
      setProgress(0);
      setUploaded(false);
      setPrediction(null);
      simulateUpload();
    } else {
      toast.error("Please upload a valid image file.");
    }
  };

  const simulateUpload = () => {
    let uploadProgress = 0;
    const interval = setInterval(() => {
      uploadProgress += 10;
      setProgress(uploadProgress);
      if (uploadProgress >= 100) {
        clearInterval(interval);
        setUploaded(true);
        toast.success("File uploaded successfully!");
      }
    }, 200);
  };

  const handleRemove = () => {
    setFile(null);
    setProgress(0);
    setUploaded(false);
    setPrediction(null);
  };

  const handlePredict = async () => {
    if (!file) {
      toast.error("Please upload an image first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:4000/api/predict",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const predictionResult = response.data;
      setPrediction(predictionResult);
      toast.success("Prediction received!");

      // Gemini API call
      const geminiResponse = await axios.post(
        "http://127.0.0.1:4000/api/gemini",
        { disease_name: predictionResult.disease },
        { headers: { "Content-Type": "application/json" } }
      );

      const geminiText = geminiResponse.data.suggestions;
      setPrediction((prev) => ({
        ...prev,
        geminiResponse: geminiText,
      }));
    } catch (error) {
      console.error("Error:", error);
      toast.error("Prediction or Gemini failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHistory = async () => {
    if (!prediction?.disease || !prediction?.geminiResponse || !file) {
      toast.error("Please complete the prediction and select an image before saving.");
      return;
    }

    setSaving(true);

    try {
      const token = new cookies().get('token'); 
      if (!token) {
        toast.error("Please login to save history");
        return;
      }

      const formData = new FormData();
      formData.append("image", file, file.name);

      const historyData = {
        disease: prediction.disease,
        geminiInsights: prediction.geminiResponse,
      };

      formData.append("history", JSON.stringify(historyData));

      console.log("File:", file);
      console.log("History Data:", historyData);
      console.log("Sending request with token:", token.substring(0, 10) + "...");

      const response = await axios.post("http://localhost:8080/api/history", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });

      if (response.status >= 200 && response.status < 300) {
        alert("History saved successfully!");
      } else {
        console.error("Failed to save history");
      }
    } catch (error) {
      console.error("Save history error:", error);
      toast.error(error.response?.data?.message || "Failed to save history");
    } finally {
      setSaving(false);
    }
  };
  
  

  const formatGeminiInsights = (text) => {
    return text
      .replace(/\*/g, "")
      .split("\n")
      .map((line, index) => {
        const trimmed = line.trim();
        if (trimmed.endsWith(":")) {
          return (
            <h5 key={index} className="font-semibold text-blue-600 mt-3">
              {trimmed}
            </h5>
          );
        } else if (/^\d+\./.test(trimmed)) {
          return (
            <p key={index} className="ml-5 text-gray-700">
              {trimmed}
            </p>
          );
        } else {
          return (
            <p key={index} className="text-gray-800 leading-relaxed">
              {trimmed}
            </p>
          );
        }
      });
  };

  return (
    <div className="w-full flex flex-col items-center p-10">
      <div className="w-[70vw] p-6 bg-blue-50 border-l-4 border-blue-500 rounded-md shadow-lg">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <div className="flex space-x-3">
            <label className="w-8 h-8 rounded-full border flex items-center justify-center text-blue-500 border-blue-500 cursor-pointer">
              <Image />
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            <button
              className="w-8 h-8 rounded-full border flex items-center justify-center text-red-500 border-red-500 cursor-pointer disabled:opacity-50"
              onClick={handleRemove}
              disabled={!uploaded}
            >
              <X />
            </button>
          </div>
          <div className="text-sm text-gray-500">{progress}%</div>
        </div>

        <div className="w-full h-2 bg-gray-300 rounded-full mb-4">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50 cursor-pointer">
          {uploaded && file ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Uploaded file preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <>
              <span className="text-gray-400 text-6xl">
                <Image size={100} />
              </span>
              <span className="mt-4 text-gray-500">
                Drag and Drop Image Here
              </span>
            </>
          )}
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg w-full hover:bg-blue-600 mt-10 disabled:opacity-50"
          disabled={!uploaded || loading}
          onClick={handlePredict}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader className="animate-spin mr-2" /> Processing...
            </span>
          ) : (
            "Predict"
          )}
        </button>
      </div>

      {prediction && (
        <div className="mt-5 p-4 bg-gray-100 rounded-lg text-center">
          <div className="mt-5 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Prediction Result:</h3>
            <p className="text-blue-600">{prediction.disease}</p>
          </div>

          {prediction.geminiResponse ? (
            <div className="mt-5 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold mb-2">Gemini Insights:</h4>
              {formatGeminiInsights(prediction.geminiResponse)}
            </div>
          ) : (
            <p className="mt-4 text-green-500">Loading Gemini insights.....</p>
          )}

          {prediction?.disease && prediction?.geminiResponse && (
            <button
              onClick={handleSaveHistory}
              disabled={saving}
              className="mt-5 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin mr-2" />
                  Saving to History...
                </span>
              ) : (
                "Save to History"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
