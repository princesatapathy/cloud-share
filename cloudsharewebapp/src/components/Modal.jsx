import React, { useEffect, useRef } from 'react';

/**
 * A reusable modal component for confirmation dialogs
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call when the modal is closed
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.confirmText - Text for the confirm button
 * @param {string} props.cancelText - Text for the cancel button
 * @param {function} props.onConfirm - Function to call when the confirm button is clicked
 * @param {string} props.confirmButtonClass - Additional classes for the confirm button
 * @param {string} props.size - Modal size ('sm', 'md', 'lg')
 */
const Modal = ({
                   isOpen,
                   onClose,
                   title,
                   children,
                   confirmText = "Confirm",
                   cancelText = "Cancel",
                   onConfirm,
                   confirmButtonClass = "bg-terracotta hover:bg-terracotta-dark",
                   size = "md"
               }) => {
    const modalRef = useRef(null);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Close modal when pressing Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Determine modal width based on size prop
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto backdrop-blur-sm bg-transparent">
            <div
                ref={modalRef}
                className={`${sizeClasses[size]} w-full bg-surface rounded-2xl shadow-xl border border-warmborder transform transition-all`}
            >
                <div className="border-b border-warmborder">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-espresso">{title}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-muted hover:text-ink focus:outline-none"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4">
                    {children}
                </div>

                <div className="px-6 py-4 border-t border-warmborder flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-cream text-ink rounded-lg hover:bg-warmborder focus:outline-none focus:ring-2 focus:ring-terracotta/30"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
