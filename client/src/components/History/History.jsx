import { useEffect, useState } from "react";
import axios from "axios";
import cookies from "universal-cookie";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = new cookies().get("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/history", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setHistoryData(response.data);
        } else {
          setHistoryData([]);
          console.warn("Non-array history data:", response.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [historyData]);

  return (
    <div className="w-full flex flex-col items-center p-10">
      <div className="w-[70vw] p-6 bg-blue-50 border-l-4 border-blue-500 rounded-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Prediction History</h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : historyData.length > 0 ? (
          <div className="grid gap-4">
            {historyData.map((entry, index) => (
              <div key={entry._id || index} className="p-4 border rounded shadow bg-white">
                <p>
                  <strong>Disease:</strong> {entry.disease}
                </p>
                <p>
                  <strong>Insights:</strong> {entry.geminiInsights}
                </p>
                {entry.imageBytes && (
                  <img
                    src={`data:image/jpeg;base64,${entry.imageBytes}`}
                    alt="Prediction"
                    className="mt-2 w-48 rounded"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No history found.</p>
        )}
      </div>
    </div>
  );
};

export default History;
