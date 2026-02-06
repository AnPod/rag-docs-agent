import { ChatInterface } from "./components/ChatInterface";
import { FileUpload } from "./components/FileUpload";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-2">
          RAG Documentation Agent
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Upload your docs and ask questions with source-cited answers
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
              <FileUpload />
            </div>

            <div className="bg-white p-6 rounded-lg shadow mt-4">
              <h2 className="text-lg font-semibold mb-2">How it works</h2>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Upload .md or .txt files</li>
                <li>Documents are chunked & embedded</li>
                <li>Ask any question</li>
                <li>Get answers with source citations</li>
              </ol>
            </div>
          </div>

          {/* Chat Section */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Chat</h2>
              <ChatInterface />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
