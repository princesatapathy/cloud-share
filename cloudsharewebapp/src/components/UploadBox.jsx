import { ArrowUpFromLine, X, FileIcon, Loader2 } from 'lucide-react';
import { useRef } from 'react';

const UploadBox = ({ files, onFileChange, onUpload, uploading, onRemoveFile, remainingCredits, isUploadDisabled, fileProgress = {} }) => {
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            // Create a new event-like object with the files
            const mockEvent = {
                target: {
                    files: droppedFiles
                }
            };
            onFileChange(mockEvent);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current.click();
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / 1048576).toFixed(2) + ' MB';
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <ArrowUpFromLine className="text-terracotta" size={20} />
                    <h2 className="text-lg font-medium text-espresso">Upload Files</h2>
                </div>
                <div className="text-sm text-muted">
                    {remainingCredits} credits remaining
                </div>
            </div>

            <div
                className="border-dashed border-2 border-warmborder rounded-xl p-8 text-center bg-surface cursor-pointer hover:border-terracotta transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
            >
                <div className="flex flex-col items-center justify-center">
                    <div className="p-3 rounded-full bg-terracotta-soft mb-4">
                        <ArrowUpFromLine size={24} className="text-terracotta" />
                    </div>
                    <p className="text-ink mb-1">Drag and drop files here</p>
                    <p className="text-muted text-sm mb-2">or click to browse ({remainingCredits} credits remaining)</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={onFileChange}
                        className="hidden"
                        accept="*/*"
                        max={5}
                    />
                </div>
            </div>

            {files.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2 text-espresso">Selected Files ({files.length})</h3>
                    <div className="bg-surface rounded-xl border border-warmborder overflow-hidden">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border-b border-warmborder last:border-b-0 hover:bg-cream">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileIcon size={18} className="text-terracotta shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-ink truncate">{file.name}</p>
                                        <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
                                        {fileProgress[file.name] !== undefined && (
                                            <div className="w-full bg-warmborder rounded-full h-1 mt-1">
                                                <div
                                                    className="bg-terracotta h-1 rounded-full transition-all duration-150"
                                                    style={{ width: `${fileProgress[file.name]}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveFile(index);
                                    }}
                                    className="text-muted hover:text-red-500 transition-colors"
                                    disabled={uploading}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <div className="mt-4">
                    <button
                        onClick={onUpload}
                        disabled={uploading || isUploadDisabled}
                        className="w-full py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <span>Upload</span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadBox;
