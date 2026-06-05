import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useAuth} from "@clerk/react";
import axios from "axios";
import {apiEndpoints} from "../util/apiEndpoints.js";
import toast from "react-hot-toast";
import {Copy, Download, File, Info} from "lucide-react";
import LinkShareModal from "../components/LinkShareModal.jsx";
import Logo from "../components/Logo.jsx";

const PublicFileView = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [shareModal, setShareModal] = useState({
        isOpen: false,
        link: ""
    });
    const {getToken} = useAuth();
    const {fileId} = useParams();

    useEffect(() => {
        const getFile = async () => {
            setIsLoading(true);
            try {
                // Re-added token fetching and authorization header
                const res = await axios.get(
                    apiEndpoints.PUBLIC_FILE_VIEW(fileId)
                );
                setFile(res.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching file:", err);
                setError(
                    "Could not retrieve file. The link may be invalid or the file may have been removed."
                );
            } finally {
                setIsLoading(false);
            }
        };
        getFile();
    }, [fileId, getToken]);

    const handleDownload = async () => {
        try {
            // This endpoint might also require a token depending on your backend setup
            const response = await axios.get(
                apiEndpoints.DOWNLOAD_FILE(fileId),
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", file.name); // Use the actual file name
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Clean up the object URL
        } catch (err) {
            console.error("Download failed:", err);
            toast.error("Sorry, the file could not be downloaded.");
        }
    };

    const openShareModal = () => {
        setShareModal({
            isOpen: true,
            link: window.location.href,
        });
    };

    const closeShareModal = () => {
        setShareModal({
            isOpen: false,
            link: "",
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-cream">
                <p className="text-muted">Loading file...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-cream">
                <div className="text-center p-8 bg-surface border border-warmborder rounded-2xl shadow-sm">
                    <h2 className="text-xl font-semibold text-red-600">Error</h2>
                    <p className="text-muted mt-2">{error}</p>
                </div>
            </div>
        );
    }

    if (!file) return null;

    return (
        <div className="bg-cream min-h-screen">
            <header className="p-4 border-b border-warmborder bg-surface">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <Logo size={30} />
                        <span className="font-semibold text-xl text-espresso font-serif">Cloud Share</span>
                    </div>
                    <button
                        onClick={openShareModal}
                        className="flex items-center gap-2 px-4 py-2 bg-terracotta-soft text-terracotta-dark rounded-lg hover:bg-terracotta/15 transition-colors"
                    >
                        <Copy size={18} />
                        Share Link
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-4 md:p-8 flex justify-center">
                <div className="w-full max-w-3xl">
                    <div className="bg-surface border border-warmborder rounded-2xl shadow-sm p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-terracotta-soft rounded-full flex items-center justify-center">
                                <File size={40} className="text-terracotta" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-semibold text-espresso break-words">
                            {file.name}
                        </h1>
                        <p className="text-sm text-muted mt-2">
                            {(file.size / 1024).toFixed(2)} KB
                            <span className="mx-2">&bull;</span>
                            Shared on {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>

                        <div className="my-6">
              <span className="inline-block bg-olive-soft text-olive text-xs font-medium px-3 py-1 rounded-full uppercase">
                {file.type || "File"}
              </span>
                        </div>

                        <div className="flex justify-center gap-4 my-8">
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors shadow-sm"
                            >
                                <Download size={18} />
                                Download File
                            </button>
                        </div>

                        <hr className="my-8 border-warmborder" />

                        <div>
                            <h3 className="text-lg font-semibold text-left text-espresso mb-4">
                                File Information
                            </h3>
                            <div className="text-left text-sm space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted">File Name:</span>
                                    <span className="text-ink font-medium break-all">
                    {file.name}
                  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">File Type:</span>
                                    <span className="text-ink font-medium">{file.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">File Size:</span>
                                    <span className="text-ink font-medium">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Shared:</span>
                                    <span className="text-ink font-medium">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-terracotta-soft border border-terracotta/20 text-terracotta-dark p-4 rounded-2xl flex items-center gap-4">
                        <Info size={20} />
                        <p className="text-sm">
                            This file has been shared publicly. Anyone with this link can view
                            and download it.
                        </p>
                    </div>
                </div>
            </main>
            <LinkShareModal
                isOpen={shareModal.isOpen}
                onClose={closeShareModal}
                link={shareModal.link}
                title="Share File"
            />
        </div>
    )
}

export default PublicFileView;
