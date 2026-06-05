import DashboardLayout from "../layout/DashboardLayout.jsx";
import { useContext, useState } from "react";
import { useAuth } from "@clerk/react";
import { UserCreditsContext } from "../context/UserCreditsContext.jsx";
import { AlertCircle } from "lucide-react";
import axios from "axios";
import { apiEndpoints } from "../util/apiEndpoints.js";
import { supabase } from "../util/supabaseClient.js";
import UploadBox from "../components/UploadBox.jsx";

const Upload = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [fileProgress, setFileProgress] = useState({}); // { fileName: 0-100 }
    const { getToken } = useAuth();
    const { credits, setCredits } = useContext(UserCreditsContext);
    const MAX_FILES = 5;

    const updateFileProgress = (name, pct) =>
        setFileProgress(prev => ({ ...prev, [name]: pct }));

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (files.length + selectedFiles.length > MAX_FILES) {
            setMessage(`You can only upload a maximum of ${MAX_FILES} files at once`);
            setMessageType("error");
            return;
        }
        setFiles(prev => [...prev, ...selectedFiles]);
        setMessage("");
        setMessageType("");
    };

    const handleRemoveFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setMessageType("");
        setMessage("");
    };

    const uploadSingleFile = async (file, token) => {
        // 1. Validate + get pre-signed Supabase upload URL from backend
        const { data: initData } = await axios.post(
            apiEndpoints.INITIATE_UPLOAD,
            { fileName: file.name, mimeType: file.type, fileSize: file.size },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const { token: signedToken, supabasePath } = initData;

        // 2. Upload directly to Supabase — handles chunking/TUS automatically
        const { error } = await supabase.storage
            .from(import.meta.env.VITE_SUPABASE_BUCKET)
            .uploadToSignedUrl(supabasePath, signedToken, file, {
                contentType: file.type,
                onUploadProgress: (progress) => {
                    const pct = Math.round((progress.loaded / progress.total) * 100);
                    updateFileProgress(file.name, pct);
                }
            });

        if (error) throw new Error(error.message);

        // 3. Finalize: backend saves metadata + deducts 1 credit
        const { data: finalizeData } = await axios.post(
            apiEndpoints.FINALIZE_UPLOAD,
            { supabasePath, name: file.name, type: file.type, size: file.size },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return finalizeData;
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setMessageType("error");
            setMessage("Please select at least one file to upload.");
            return;
        }
        if (files.length > MAX_FILES) {
            setMessage(`You can only upload a maximum of ${MAX_FILES} files at once.`);
            setMessageType("error");
            return;
        }

        setUploading(true);
        setMessage("Uploading files...");
        setMessageType("info");

        const token = await getToken();
        let successCount = 0;
        let lastCredits = credits;

        for (const file of files) {
            try {
                updateFileProgress(file.name, 0);
                const result = await uploadSingleFile(file, token);
                successCount++;
                if (result.remainingCredits !== undefined) {
                    lastCredits = result.remainingCredits;
                }
            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
                setMessage(error.response?.data?.message || `Failed to upload ${file.name}`);
                setMessageType("error");
            }
        }

        setCredits(lastCredits);

        if (successCount > 0) {
            setMessage(`${successCount} file(s) uploaded successfully.`);
            setMessageType("success");
            setFiles([]);
            setFileProgress({});
        }

        setUploading(false);
    };

    const isUploadDisabled = files.length === 0 || files.length > MAX_FILES || credits <= 0 || files.length > credits;

    return (
        <DashboardLayout activeMenu="Upload">
            <div className="p-6">
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                        messageType === 'error' ? 'bg-red-50 text-red-700' :
                        messageType === 'success' ? 'bg-olive-soft text-olive' :
                        'bg-terracotta-soft text-terracotta-dark'
                    }`}>
                        {messageType === 'error' && <AlertCircle size={20} />}
                        {message}
                    </div>
                )}

                <UploadBox
                    files={files}
                    onFileChange={handleFileChange}
                    onUpload={handleUpload}
                    uploading={uploading}
                    onRemoveFile={handleRemoveFile}
                    remainingCredits={credits}
                    isUploadDisabled={isUploadDisabled}
                    fileProgress={fileProgress}
                />
            </div>
        </DashboardLayout>
    );
};

export default Upload;
