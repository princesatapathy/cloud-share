import DashboardLayout from "../layout/DashboardLayout.jsx";
import {useAuth} from "@clerk/react";
import {useContext, useEffect, useState} from "react";
import {UserCreditsContext} from "../context/UserCreditsContext.jsx";
import axios from "axios";
import {apiEndpoints} from "../util/apiEndpoints.js";
import {supabase} from "../util/supabaseClient.js";
import {Loader2} from "lucide-react";
import DashboardUpload from "../components/DashboardUpload.jsx";
import RecentFiles from "../components/RecentFiles.jsx";

const Dashboard = () => {
    const [files, setFiles] = useState([]);
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [remainingUploads, setRemainingUploads] = useState(5);
    const {getToken} = useAuth();
    const { fetchUserCredits } = useContext(UserCreditsContext);
    const MAX_FILES = 5;

    useEffect(() => {
        const fetchRecentFiles = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                // Use the existing endpoint that we know works
                const res = await axios.get(apiEndpoints.FETCH_FILES, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                // Sort by uploadedAt and take only the 5 most recent files
                const sortedFiles = res.data.sort((a, b) =>
                    new Date(b.uploadedAt) - new Date(a.uploadedAt)
                ).slice(0, 5);
                setFiles(sortedFiles);
            } catch (error) {
                console.error("Error fetching recent files:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecentFiles();
    }, [getToken]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        // Check if adding these files would exceed the limit
        if (uploadFiles.length + selectedFiles.length > MAX_FILES) {
            setMessage(`You can only upload a maximum of ${MAX_FILES} files at once.`);
            setMessageType('error');
            return;
        }

        // Add the new files to the existing files
        setUploadFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        setMessage('');
        setMessageType('');
    };

    // Remove a file from the upload list
    const handleRemoveFile = (index) => {
        setUploadFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
        setMessage('');
        setMessageType('');
    };

    // Calculate remaining uploads
    useEffect(() => {
        setRemainingUploads(MAX_FILES - uploadFiles.length);
    }, [uploadFiles]);

    // Upload a single file via Supabase: initiate → direct upload → finalize
    const uploadSingleFile = async (file, token) => {
        const { data: initData } = await axios.post(
            apiEndpoints.INITIATE_UPLOAD,
            { fileName: file.name, mimeType: file.type, fileSize: file.size },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const { token: signedToken, supabasePath } = initData;

        const { error } = await supabase.storage
            .from(import.meta.env.VITE_SUPABASE_BUCKET)
            .uploadToSignedUrl(supabasePath, signedToken, file, { contentType: file.type });

        if (error) throw new Error(error.message);

        const { data: finalizeData } = await axios.post(
            apiEndpoints.FINALIZE_UPLOAD,
            { supabasePath, name: file.name, type: file.type, size: file.size },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return finalizeData;
    };

    // Handle file upload
    const handleUpload = async () => {
        if (uploadFiles.length === 0) {
            setMessage('Please select at least one file to upload.');
            setMessageType('error');
            return;
        }
        if (uploadFiles.length > MAX_FILES) {
            setMessage(`You can only upload a maximum of ${MAX_FILES} files at once.`);
            setMessageType('error');
            return;
        }

        setUploading(true);
        setMessage('Uploading files...');
        setMessageType('info');

        try {
            const token = await getToken();
            let successCount = 0;

            for (const file of uploadFiles) {
                try {
                    await uploadSingleFile(file, token);
                    successCount++;
                } catch (err) {
                    console.error(`Error uploading ${file.name}:`, err);
                }
            }

            if (successCount === 0) {
                setMessage('Upload failed. Please try again.');
                setMessageType('error');
            } else {
                setMessage(`${successCount} file(s) uploaded successfully!`);
                setMessageType('success');
            }
            setUploadFiles([]);

            // Refresh recent files + credits
            const res = await axios.get(apiEndpoints.FETCH_FILES, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sortedFiles = res.data
                .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
                .slice(0, 5);
            setFiles(sortedFiles);
            await fetchUserCredits();
        } catch (error) {
            console.error('Error uploading files:', error);
            setMessage(error.response?.data?.message || 'Error uploading files. Please try again.');
            setMessageType('error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <DashboardLayout activeMenu="Dashboard">
            <div className="p-6">
                <h1 className="text-3xl font-semibold text-espresso mb-1">My Drive</h1>
                <p className="text-muted mb-6">Upload, manage, and share your files securely</p>
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                        messageType === 'error' ? 'bg-red-50 text-red-700' :
                            messageType === 'success' ? 'bg-olive-soft text-olive' :
                                'bg-terracotta-soft text-terracotta-dark'
                    }`}>
                        {message}
                    </div>
                )}
                <div className="flex flex-col md:flex-row gap-6">
                    {/*Left column*/}
                    <div className="w-full md:w-[40%]">
                        <DashboardUpload
                            files={uploadFiles}
                            onFileChange={handleFileChange}
                            onUpload={handleUpload}
                            uploading={uploading}
                            onRemoveFile={handleRemoveFile}
                            remainingUploads={remainingUploads}
                        />
                    </div>

                    {/*right column*/}
                    <div className="w-full md:w-[60%]">
                        {loading ? (
                            <div className="bg-surface border border-warmborder rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center min-h-[300px]">
                                <Loader2 size={40} className="text-terracotta animate-spin mb-4" />
                                <p className="text-muted">Loading your files...</p>
                            </div>
                        ) : (
                            <RecentFiles files={files} />
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default Dashboard;
