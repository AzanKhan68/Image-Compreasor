document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('upload-area');
    const uploadButton = document.getElementById('upload-button');
    const fileInput = document.getElementById('file-input');
    const resultsDiv = document.getElementById('results');
    const progressBar = document.getElementById('progress-bar');
    const originalSizeSpan = document.getElementById('original-size');
    const compressedSizeSpan = document.getElementById('compressed-size');
    const downloadButton = document.getElementById('download-button');
    let compressedBlob = null;

    // Helper function to format file size
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Trigger file input click when upload button is clicked
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle drag and drop
    ['dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    uploadArea.addEventListener('dragover', () => {
        uploadArea.style.borderColor = '#007bff';
        uploadArea.style.backgroundColor = '#f9f9f9';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.backgroundColor = '#fff';
    });

    uploadArea.addEventListener('drop', (e) => {
        uploadArea.style.borderColor = '#ccc';
        uploadArea.style.backgroundColor = '#fff';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Main compression function
    const handleFile = (file) => {
        resultsDiv.style.display = 'none';
        progressBar.style.width = '0%';
        
        // Show progress bar container and start progress
        resultsDiv.style.display = 'block';
        progressBar.style.width = '50%';

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                
                // Set compression quality (e.g., 0.7 for 70%)
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

                // Convert data URL to Blob to get size
                fetch(compressedDataUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        compressedBlob = blob;
                        originalSizeSpan.textContent = formatSize(file.size);
                        compressedSizeSpan.textContent = formatSize(compressedBlob.size);
                        progressBar.style.width = '100%';
                        downloadButton.style.display = 'block';
                    });
            };
        };
    };

    // Download button functionality
    downloadButton.addEventListener('click', () => {
        if (compressedBlob) {
            const url = URL.createObjectURL(compressedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compressed-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
});
