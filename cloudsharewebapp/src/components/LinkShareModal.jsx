import React, { useRef, useEffect } from 'react';
import Modal from './Modal';
import { Check, Copy } from 'lucide-react';

/**
 * A modal component for sharing links
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call when the modal is closed
 * @param {string} props.link - The link to share
 * @param {string} props.title - Modal title
 */
const LinkShareModal = ({
                            isOpen,
                            onClose,
                            link,
                            title = "Share Link"
                        }) => {
    const [copied, setCopied] = React.useState(false);
    const linkInputRef = useRef(null);

    // Reset copied state when modal is opened or closed
    useEffect(() => {
        setCopied(false);

        // Focus and select the link input when the modal is opened
        if (isOpen && linkInputRef.current) {
            setTimeout(() => {
                linkInputRef.current.focus();
                linkInputRef.current.select();
            }, 100);
        }
    }, [isOpen]);

    const handleCopyLink = () => {
        if (linkInputRef.current) {
            linkInputRef.current.select();
            navigator.clipboard.writeText(link).then(() => {
                setCopied(true);
                // Reset copied state after 2 seconds
                setTimeout(() => setCopied(false), 2000);
            }).catch(err => {
                console.error('Failed to copy link: ', err);
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            confirmText={copied ? "Copied!" : "Copy"}
            cancelText="Close"
            onConfirm={handleCopyLink}
            confirmButtonClass={copied ? "bg-olive hover:bg-olive/90" : "bg-terracotta hover:bg-terracotta-dark"}
            size="md"
        >
            <div className="space-y-4">
                <p className="text-muted">
                    Share this link with others to give them access to this file:
                </p>
                <div className="flex items-center gap-2">
                    <input
                        ref={linkInputRef}
                        type="text"
                        value={link}
                        readOnly
                        className="flex-1 px-3 py-2 border border-warmborder rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                    />
                    <button
                        onClick={handleCopyLink}
                        className={`p-2 rounded-lg ${copied ? 'bg-olive-soft text-olive' : 'bg-cream text-muted'} hover:bg-terracotta-soft focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta`}
                        title={copied ? "Copied!" : "Copy to clipboard"}
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>
                {copied && (
                    <p className="text-sm text-olive flex items-center gap-1">
                        <Check size={16} />
                        Link copied to clipboard!
                    </p>
                )}
                <div className="mt-2">
                    <p className="text-sm text-muted">
                        Anyone with this link can access this file.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default LinkShareModal;
