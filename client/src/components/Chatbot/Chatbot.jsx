import { useState, useEffect } from "react";
import axios from "axios";

const Chatbot = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedPrompt = sessionStorage.getItem("chat_prompt");
    const savedResponse = sessionStorage.getItem("chat_response");

    if (savedPrompt) setPrompt(savedPrompt);
    if (savedResponse) setResponse(savedResponse);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    const lowerPrompt = prompt.toLowerCase();
    const keywords = [
      "crop",
      "disease",
      "pesticide",
      "fertilizer",
      "plant infection",
      "weed",
      "fungus",
      "insect",
      "plant care",
    ];

    const isRelevant = keywords.some((word) => lowerPrompt.includes(word));

    if (!isRelevant) {
      const fallback = "I'm only trained to answer questions about crop diseases and pesticide management.";
      setResponse(fallback);
      localStorage.setItem("chat_prompt", prompt);
      localStorage.setItem("chat_response", fallback);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:8080/api/chat", {
        prompt: prompt,
      });
      setResponse(res.data);

      sessionStorage.setItem("chat_prompt", prompt);
      sessionStorage.setItem("chat_response", res.data);
    } catch (error) {
      console.error("Error fetching response:", error);
      const fallback = "Something went wrong. Please try again.";
      setResponse(fallback);
      sessionStorage.setItem("chat_response", fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-10">
      <div className="w-[70vw] p-6 bg-blue-50 border-l-4 border-blue-500 rounded-md shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-blue-700 text-center">
          Crop Disease & Pesticide Helpdesk
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            className="border border-gray-300 p-3 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows="4"
            placeholder="Type your question..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          ></textarea>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 self-start"
          >
            {loading ? "Asking..." : "Ask"}
          </button>
        </form>

        {response && (
          <div className="mt-6 bg-white border p-4 rounded shadow text-gray-800 whitespace-pre-line">
            {response}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
